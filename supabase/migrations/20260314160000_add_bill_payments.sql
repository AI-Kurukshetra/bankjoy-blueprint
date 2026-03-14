create table if not exists public.bill_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id) on delete cascade,
  payee_name text not null,
  payee_category text not null,
  amount_cents bigint not null check (amount_cents > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'processing', 'paid')),
  deliver_by date not null,
  memo text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.bill_payments enable row level security;

drop policy if exists "bill_payments_select_own_or_admin" on public.bill_payments;
drop policy if exists "bill_payments_insert_own" on public.bill_payments;

create policy "bill_payments_select_own_or_admin"
on public.bill_payments
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "bill_payments_insert_own"
on public.bill_payments
for insert
to authenticated
with check (user_id = (select auth.uid()));

create index if not exists idx_bill_payments_user_due_date
on public.bill_payments(user_id, deliver_by desc);

create or replace function public.submit_bill_payment(
  p_from_account_id uuid,
  p_payee_name text,
  p_payee_category text,
  p_amount_cents bigint,
  p_deliver_by date,
  p_memo text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_from_balance bigint;
  v_payment_id uuid := gen_random_uuid();
  v_now timestamptz := now();
  v_status text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Bill payment amount must be positive';
  end if;

  select balance_cents
  into v_from_balance
  from public.accounts
  where id = p_from_account_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Payment account not found';
  end if;

  if p_deliver_by > current_date then
    v_status := 'scheduled';
  else
    v_status := 'paid';
  end if;

  if v_status = 'paid' and v_from_balance < p_amount_cents then
    raise exception 'Insufficient funds';
  end if;

  if v_status = 'paid' then
    update public.accounts
    set balance_cents = balance_cents - p_amount_cents
    where id = p_from_account_id;
  end if;

  insert into public.bill_payments (
    id,
    user_id,
    from_account_id,
    payee_name,
    payee_category,
    amount_cents,
    status,
    deliver_by,
    memo,
    processed_at,
    created_at
  )
  values (
    v_payment_id,
    v_user_id,
    p_from_account_id,
    p_payee_name,
    p_payee_category,
    p_amount_cents,
    v_status,
    p_deliver_by,
    p_memo,
    case when v_status = 'paid' then v_now else null end,
    v_now
  );

  if v_status = 'paid' then
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
      p_payee_name,
      coalesce(p_memo, format('Bill payment to %s', p_payee_name)),
      'Bill Pay',
      p_amount_cents,
      'debit',
      'posted',
      v_now,
      v_now
    );
  end if;

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
    case when v_status = 'paid' then 'Bill paid' else 'Bill payment scheduled' end,
    case
      when v_status = 'paid'
        then format('%s was paid for $%s.', p_payee_name, to_char(p_amount_cents / 100.0, 'FM999999990.00'))
      else format('%s is scheduled for %s.', p_payee_name, to_char(p_deliver_by, 'Mon DD, YYYY'))
    end,
    'transaction',
    false,
    v_now
  );

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
      'bill_payment',
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Bill payment for %s recorded at $%s with status %s.', p_payee_name, to_char(p_amount_cents / 100.0, 'FM999999990.00'), v_status),
      v_now
    ),
    (
      gen_random_uuid(),
      null,
      'admin_feed',
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Bill payment recorded for user %s to payee %s at $%s with status %s.', v_user_id, p_payee_name, to_char(p_amount_cents / 100.0, 'FM999999990.00'), v_status),
      v_now
    );

  return v_payment_id;
end;
$$;

grant execute on function public.submit_bill_payment(uuid, text, text, bigint, date, text) to authenticated;
revoke execute on function public.submit_bill_payment(uuid, text, text, bigint, date, text) from anon, public;

insert into public.bill_payments (
  id,
  user_id,
  from_account_id,
  payee_name,
  payee_category,
  amount_cents,
  status,
  deliver_by,
  memo,
  processed_at,
  created_at
)
values
  (
    '8f34b350-c233-4d2a-8df4-c001aa100001',
    '0f1c2df6-fd53-46da-9077-f0f7f74f5001',
    '55dd90b2-e83d-429e-b4c6-61002b7f1001',
    'City Power',
    'Utilities',
    12990,
    'paid',
    current_date - 2,
    'Monthly electricity bill',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '8f34b350-c233-4d2a-8df4-c001aa100002',
    '52a9ea89-c4ea-4b44-8168-b293a2e3d702',
    '55dd90b2-e83d-429e-b4c6-61002b7f1003',
    'Metro Water',
    'Utilities',
    8600,
    'scheduled',
    current_date + 4,
    'Quarterly water bill',
    null,
    now() - interval '6 hours'
  )
on conflict (id) do update
set
  payee_name = excluded.payee_name,
  payee_category = excluded.payee_category,
  amount_cents = excluded.amount_cents,
  status = excluded.status,
  deliver_by = excluded.deliver_by,
  memo = excluded.memo,
  processed_at = excluded.processed_at,
  created_at = excluded.created_at;
