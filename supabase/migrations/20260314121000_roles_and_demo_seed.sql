create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_admin() from anon, public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'member'),
    coalesce(new.created_at, now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transfers_select_own" on public.transfers;
drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "alerts_select_related" on public.alerts;

create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "accounts_select_own_or_admin"
on public.accounts
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "transactions_select_own_or_admin"
on public.transactions
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "transfers_select_own_or_admin"
on public.transfers
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "notifications_select_own_or_admin"
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "alerts_select_related_or_admin"
on public.alerts
for select
to authenticated
using (user_id is null or user_id = (select auth.uid()) or (select public.is_admin()));

create or replace function public.submit_internal_transfer(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount_cents bigint,
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
  v_transfer_id uuid := gen_random_uuid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_amount_cents <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;

  if p_from_account_id = p_to_account_id then
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

  perform 1
  from public.accounts
  where id = p_to_account_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Destination account not found';
  end if;

  if v_from_balance < p_amount_cents then
    raise exception 'Insufficient funds';
  end if;

  update public.accounts
  set balance_cents = balance_cents - p_amount_cents
  where id = p_from_account_id;

  update public.accounts
  set balance_cents = balance_cents + p_amount_cents
  where id = p_to_account_id;

  insert into public.transfers (
    id,
    user_id,
    from_account_id,
    to_account_id,
    amount_cents,
    memo,
    status,
    created_at
  )
  values (
    v_transfer_id,
    v_user_id,
    p_from_account_id,
    p_to_account_id,
    p_amount_cents,
    p_memo,
    'completed',
    v_now
  );

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
      'member_transfer',
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Member initiated internal transfer for $%s.', to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      v_now
    ),
    (
      gen_random_uuid(),
      null,
      'admin_feed',
      case when p_amount_cents >= 100000 then 'high' else 'info' end,
      format('Demo transfer recorded for user %s in the amount of $%s.', v_user_id, to_char(p_amount_cents / 100.0, 'FM999999990.00')),
      v_now
    );

  return v_transfer_id;
end;
$$;

grant execute on function public.submit_internal_transfer(uuid, uuid, bigint, text) to authenticated;
revoke execute on function public.submit_internal_transfer(uuid, uuid, bigint, text) from anon, public;

do $$
declare
  admin_user_id uuid := 'a9df6e9e-4303-4d8f-9d0a-a3c0673a0121';
  member_one_id uuid := '0f1c2df6-fd53-46da-9077-f0f7f74f5001';
  member_two_id uuid := '52a9ea89-c4ea-4b44-8168-b293a2e3d702';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@bankjoy.demo',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'admin'),
      jsonb_build_object('full_name', 'Avery Stone', 'role', 'admin'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      member_one_id,
      'authenticated',
      'authenticated',
      'member1@bankjoy.demo',
      crypt('Member@123', gen_salt('bf')),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'member'),
      jsonb_build_object('full_name', 'Taylor Mason', 'role', 'member'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      member_two_id,
      'authenticated',
      'authenticated',
      'member2@bankjoy.demo',
      crypt('Member@123', gen_salt('bf')),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', 'member'),
      jsonb_build_object('full_name', 'Jordan Lee', 'role', 'member'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    last_sign_in_at = excluded.last_sign_in_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = excluded.updated_at,
    aud = excluded.aud,
    role = excluded.role;

  delete from auth.identities
  where user_id in (admin_user_id, member_one_id, member_two_id) and provider = 'email';

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      gen_random_uuid(),
      'admin@bankjoy.demo',
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@bankjoy.demo', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'member1@bankjoy.demo',
      member_one_id,
      jsonb_build_object('sub', member_one_id::text, 'email', 'member1@bankjoy.demo', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'member2@bankjoy.demo',
      member_two_id,
      jsonb_build_object('sub', member_two_id::text, 'email', 'member2@bankjoy.demo', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    );

  insert into public.profiles (id, email, full_name, role, created_at)
  values
    (admin_user_id, 'admin@bankjoy.demo', 'Avery Stone', 'admin', now()),
    (member_one_id, 'member1@bankjoy.demo', 'Taylor Mason', 'member', now()),
    (member_two_id, 'member2@bankjoy.demo', 'Jordan Lee', 'member', now())
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

  insert into public.accounts (id, user_id, name, type, account_number_masked, balance_cents, currency, created_at)
  values
    ('55dd90b2-e83d-429e-b4c6-61002b7f1001', member_one_id, 'Primary Checking', 'Checking', '•••• 1024', 582340, 'USD', now() - interval '14 days'),
    ('55dd90b2-e83d-429e-b4c6-61002b7f1002', member_one_id, 'Rainy Day Savings', 'Savings', '•••• 8831', 1289040, 'USD', now() - interval '14 days'),
    ('55dd90b2-e83d-429e-b4c6-61002b7f1003', member_two_id, 'Daily Checking', 'Checking', '•••• 4401', 392120, 'USD', now() - interval '10 days'),
    ('55dd90b2-e83d-429e-b4c6-61002b7f1004', member_two_id, 'Travel Savings', 'Savings', '•••• 9902', 2144300, 'USD', now() - interval '10 days')
  on conflict (id) do update
  set
    name = excluded.name,
    type = excluded.type,
    account_number_masked = excluded.account_number_masked,
    balance_cents = excluded.balance_cents,
    currency = excluded.currency;

  insert into public.transactions (id, account_id, user_id, merchant_name, description, category, amount_cents, direction, status, occurred_at, created_at)
  values
    ('9df661ac-4226-4e0a-98da-61fb4b2b3001', '55dd90b2-e83d-429e-b4c6-61002b7f1001', member_one_id, 'Fresh Market', 'Grocery refill', 'Groceries', 8425, 'debit', 'posted', now() - interval '3 hours', now() - interval '3 hours'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3002', '55dd90b2-e83d-429e-b4c6-61002b7f1001', member_one_id, 'Payroll', 'Monthly direct deposit', 'Income', 184500, 'credit', 'posted', now() - interval '1 day', now() - interval '1 day'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3003', '55dd90b2-e83d-429e-b4c6-61002b7f1001', member_one_id, 'City Power', 'Utility autopay', 'Utilities', 12990, 'debit', 'posted', now() - interval '2 days', now() - interval '2 days'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3004', '55dd90b2-e83d-429e-b4c6-61002b7f1002', member_one_id, 'Internal Transfer', 'Savings contribution', 'Transfer', 45000, 'credit', 'posted', now() - interval '4 days', now() - interval '4 days'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3005', '55dd90b2-e83d-429e-b4c6-61002b7f1001', member_one_id, 'Metro Transit', 'Transit top-up', 'Transport', 2200, 'debit', 'pending', now() - interval '2 hours', now() - interval '2 hours'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3006', '55dd90b2-e83d-429e-b4c6-61002b7f1003', member_two_id, 'Northwind Airlines', 'Flight purchase', 'Travel', 67500, 'debit', 'posted', now() - interval '18 hours', now() - interval '18 hours'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3007', '55dd90b2-e83d-429e-b4c6-61002b7f1004', member_two_id, 'Internal Transfer', 'Vacation savings', 'Transfer', 80000, 'credit', 'posted', now() - interval '3 days', now() - interval '3 days'),
    ('9df661ac-4226-4e0a-98da-61fb4b2b3008', '55dd90b2-e83d-429e-b4c6-61002b7f1003', member_two_id, 'Coffee Dock', 'Morning coffee', 'Dining', 890, 'debit', 'posted', now() - interval '5 hours', now() - interval '5 hours')
  on conflict (id) do update
  set
    merchant_name = excluded.merchant_name,
    description = excluded.description,
    category = excluded.category,
    amount_cents = excluded.amount_cents,
    direction = excluded.direction,
    status = excluded.status,
    occurred_at = excluded.occurred_at;

  insert into public.transfers (id, user_id, from_account_id, to_account_id, amount_cents, memo, status, created_at)
  values
    ('f57adb6d-fd69-4fc0-a6af-b7fce1e74001', member_one_id, '55dd90b2-e83d-429e-b4c6-61002b7f1001', '55dd90b2-e83d-429e-b4c6-61002b7f1002', 45000, 'Automatic weekly savings', 'completed', now() - interval '4 days'),
    ('f57adb6d-fd69-4fc0-a6af-b7fce1e74002', member_two_id, '55dd90b2-e83d-429e-b4c6-61002b7f1003', '55dd90b2-e83d-429e-b4c6-61002b7f1004', 80000, 'Vacation fund transfer', 'completed', now() - interval '3 days')
  on conflict (id) do update
  set
    amount_cents = excluded.amount_cents,
    memo = excluded.memo,
    status = excluded.status,
    created_at = excluded.created_at;

  insert into public.notifications (id, user_id, title, message, kind, is_read, created_at)
  values
    ('7d0e7930-e744-4b81-af6f-2c5e1bcf5001', member_one_id, 'Security pulse', 'Login detected from your trusted Chicago browser.', 'security', false, now() - interval '6 hours'),
    ('7d0e7930-e744-4b81-af6f-2c5e1bcf5002', member_one_id, 'Transaction posted', 'Fresh Market charge for $84.25 posted successfully.', 'transaction', false, now() - interval '3 hours'),
    ('7d0e7930-e744-4b81-af6f-2c5e1bcf5003', member_two_id, 'Transaction posted', 'Northwind Airlines charge for $675.00 posted successfully.', 'transaction', false, now() - interval '18 hours'),
    ('7d0e7930-e744-4b81-af6f-2c5e1bcf5004', member_two_id, 'Security pulse', 'Password sign-in confirmed from your usual device.', 'security', true, now() - interval '1 day')
  on conflict (id) do update
  set
    title = excluded.title,
    message = excluded.message,
    kind = excluded.kind,
    is_read = excluded.is_read,
    created_at = excluded.created_at;

  insert into public.alerts (id, user_id, kind, severity, message, created_at)
  values
    ('d01d17af-0ad5-4154-b8d2-29c2ff780001', null, 'transfer_traffic_normal', 'info', 'Transfer completion rate is healthy across demo accounts.', now() - interval '1 hour'),
    ('d01d17af-0ad5-4154-b8d2-29c2ff780002', null, 'high_value_activity', 'high', 'Direct deposit above $1,500 cleared for Taylor Mason.', now() - interval '1 day'),
    ('d01d17af-0ad5-4154-b8d2-29c2ff780003', member_one_id, 'member_security', 'info', 'Trusted-device login confirmed.', now() - interval '6 hours'),
    ('d01d17af-0ad5-4154-b8d2-29c2ff780004', member_two_id, 'member_transfer', 'info', 'Vacation transfer completed successfully.', now() - interval '3 days')
  on conflict (id) do update
  set
    user_id = excluded.user_id,
    kind = excluded.kind,
    severity = excluded.severity,
    message = excluded.message,
    created_at = excluded.created_at;
end;
$$;
