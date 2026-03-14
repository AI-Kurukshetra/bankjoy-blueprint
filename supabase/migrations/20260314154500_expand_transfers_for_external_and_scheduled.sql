alter table public.transfers
  add column if not exists external_account_id uuid references public.external_accounts(id) on delete cascade,
  add column if not exists transfer_rail text not null default 'internal' check (transfer_rail in ('internal', 'external')),
  add column if not exists scheduled_for date,
  add column if not exists processed_at timestamptz;

alter table public.transfers
  alter column to_account_id drop not null;

alter table public.transfers
  drop constraint if exists transfers_destination_check;

alter table public.transfers
  add constraint transfers_destination_check
  check (
    (transfer_rail = 'internal' and to_account_id is not null and external_account_id is null)
    or
    (transfer_rail = 'external' and to_account_id is null and external_account_id is not null)
  );

update public.transfers
set
  transfer_rail = 'internal',
  processed_at = coalesce(processed_at, created_at)
where transfer_rail = 'internal';

create or replace function public.submit_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid default null,
  p_external_account_id uuid default null,
  p_transfer_rail text default 'internal',
  p_amount_cents bigint default 0,
  p_memo text default null,
  p_scheduled_for date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_from_balance bigint;
  v_transfer_id uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_status text;
  v_effective_occurrence timestamptz := coalesce(p_scheduled_for::timestamptz, v_now);
  v_external_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;

  if p_transfer_rail not in ('internal', 'external') then
    raise exception 'Transfer rail is invalid';
  end if;

  if p_transfer_rail = 'internal' and p_from_account_id = p_to_account_id then
    raise exception 'Choose two different accounts';
  end if;

  select balance_cents
  into v_from_balance
  from public.accounts
  where id = p_from_account_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Source account not found';
  end if;

  if p_transfer_rail = 'internal' then
    perform 1
    from public.accounts
    where id = p_to_account_id and user_id = v_user_id
    for update;

    if not found then
      raise exception 'Destination account not found';
    end if;
  else
    select institution_name
    into v_external_name
    from public.external_accounts
    where id = p_external_account_id and user_id = v_user_id
    for update;

    if not found then
      raise exception 'External destination account not found';
    end if;
  end if;

  if p_scheduled_for is not null and p_scheduled_for > current_date then
    v_status := 'scheduled';
  elsif p_transfer_rail = 'external' then
    v_status := 'pending_review';
  else
    v_status := 'completed';
  end if;

  if v_status = 'completed' and v_from_balance < p_amount_cents then
    raise exception 'Insufficient funds';
  end if;

  if v_status = 'completed' then
    update public.accounts
    set balance_cents = balance_cents - p_amount_cents
    where id = p_from_account_id;

    update public.accounts
    set balance_cents = balance_cents + p_amount_cents
    where id = p_to_account_id;
  end if;

  insert into public.transfers (
    id,
    user_id,
    from_account_id,
    to_account_id,
    external_account_id,
    transfer_rail,
    amount_cents,
    memo,
    status,
    scheduled_for,
    processed_at,
    created_at
  )
  values (
    v_transfer_id,
    v_user_id,
    p_from_account_id,
    p_to_account_id,
    p_external_account_id,
    p_transfer_rail,
    p_amount_cents,
    p_memo,
    v_status,
    p_scheduled_for,
    case when v_status = 'completed' then v_now else null end,
    v_now
  );

  if v_status = 'completed' then
    insert into public.transactions (
      id,
      account_id,
      user_id,
      merchant_name,
      description,
      category,
      amount_cents,
      direction,
      status,
      occurred_at,
      created_at
    )
    values
      (
        gen_random_uuid(),
        p_from_account_id,
        v_user_id,
        'Internal Transfer',
        coalesce(p_memo, 'Transfer sent'),
        'Transfer',
        p_amount_cents,
        'debit',
        'posted',
        v_now,
        v_now
      ),
      (
        gen_random_uuid(),
        p_to_account_id,
        v_user_id,
        'Internal Transfer',
        coalesce(p_memo, 'Transfer received'),
        'Transfer',
        p_amount_cents,
        'credit',
        'posted',
        v_now,
        v_now
      );

    insert into public.notifications (
      id,
      user_id,
      title,
      message,
      kind,
      is_read,
      created_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      'Transfer complete',
      format('Internal transfer posted for $%s.', to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      'transaction',
      false,
      v_now
    );
  elsif v_status = 'pending_review' then
    insert into public.transactions (
      id,
      account_id,
      user_id,
      merchant_name,
      description,
      category,
      amount_cents,
      direction,
      status,
      occurred_at,
      created_at
    )
    values (
      gen_random_uuid(),
      p_from_account_id,
      v_user_id,
      coalesce(v_external_name, 'External Transfer'),
      coalesce(p_memo, format('Transfer to %s', coalesce(v_external_name, 'external account'))),
      'Transfer',
      p_amount_cents,
      'debit',
      'pending',
      v_effective_occurrence,
      v_now
    );

    insert into public.notifications (
      id,
      user_id,
      title,
      message,
      kind,
      is_read,
      created_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      'External transfer submitted',
      format('Transfer to %s is pending review for $%s.', coalesce(v_external_name, 'your linked account'), to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      'transaction',
      false,
      v_now
    );
  else
    insert into public.notifications (
      id,
      user_id,
      title,
      message,
      kind,
      is_read,
      created_at
    )
    values (
      gen_random_uuid(),
      v_user_id,
      'Transfer scheduled',
      format('Transfer scheduled for %s in the amount of $%s.', to_char(p_scheduled_for, 'Mon DD, YYYY'), to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      'transaction',
      false,
      v_now
    );
  end if;

  insert into public.alerts (
    id,
    user_id,
    kind,
    severity,
    message,
    created_at
  )
  values
    (
      gen_random_uuid(),
      v_user_id,
      case when p_transfer_rail = 'external' then 'external_transfer' else 'member_transfer' end,
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Member initiated %s transfer for $%s with status %s.', p_transfer_rail, to_char(p_amount_cents / 100.0, 'FM999999990.00'), v_status),
      v_now
    ),
    (
      gen_random_uuid(),
      null,
      'admin_feed',
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Transfer recorded for user %s on rail %s with status %s in the amount of $%s.', v_user_id, p_transfer_rail, v_status, to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      v_now
    );

  return v_transfer_id;
end;
$$;

grant execute on function public.submit_transfer(uuid, uuid, uuid, text, bigint, text, date) to authenticated;
revoke execute on function public.submit_transfer(uuid, uuid, uuid, text, bigint, text, date) from anon, public;

insert into public.transfers (
  id,
  user_id,
  from_account_id,
  to_account_id,
  external_account_id,
  transfer_rail,
  amount_cents,
  memo,
  status,
  scheduled_for,
  processed_at,
  created_at
)
values
  (
    'f57adb6d-fd69-4fc0-a6af-b7fce1e74003',
    '0f1c2df6-fd53-46da-9077-f0f7f74f5001',
    '55dd90b2-e83d-429e-b4c6-61002b7f1001',
    null,
    '7f24b350-c233-4d2a-8df4-c001aa100001',
    'external',
    32500,
    'Home repair reserve',
    'pending_review',
    null,
    null,
    now() - interval '5 hours'
  ),
  (
    'f57adb6d-fd69-4fc0-a6af-b7fce1e74004',
    '52a9ea89-c4ea-4b44-8168-b293a2e3d702',
    '55dd90b2-e83d-429e-b4c6-61002b7f1003',
    null,
    '7f24b350-c233-4d2a-8df4-c001aa100002',
    'external',
    54000,
    'Scheduled card payoff',
    'scheduled',
    current_date + 2,
    null,
    now() - interval '1 hour'
  )
on conflict (id) do update
set
  external_account_id = excluded.external_account_id,
  transfer_rail = excluded.transfer_rail,
  amount_cents = excluded.amount_cents,
  memo = excluded.memo,
  status = excluded.status,
  scheduled_for = excluded.scheduled_for,
  processed_at = excluded.processed_at,
  created_at = excluded.created_at;
