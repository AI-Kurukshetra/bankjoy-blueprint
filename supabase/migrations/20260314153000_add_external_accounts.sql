create table if not exists public.external_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_name text not null,
  account_name text not null,
  account_type text not null check (account_type in ('checking', 'savings', 'credit', 'loan', 'investment')),
  status text not null default 'linked' check (status in ('linked', 'pending_review')),
  routing_number_masked text not null,
  account_number_masked text not null,
  last_sync_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.external_accounts enable row level security;

drop policy if exists "external_accounts_select_own_or_admin" on public.external_accounts;
drop policy if exists "external_accounts_insert_own" on public.external_accounts;

create policy "external_accounts_select_own_or_admin"
on public.external_accounts
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "external_accounts_insert_own"
on public.external_accounts
for insert
to authenticated
with check (user_id = (select auth.uid()));

create index if not exists idx_external_accounts_user_id
on public.external_accounts(user_id, created_at desc);

insert into public.external_accounts (
  id,
  user_id,
  institution_name,
  account_name,
  account_type,
  status,
  routing_number_masked,
  account_number_masked,
  last_sync_at,
  created_at
)
values
  (
    '7f24b350-c233-4d2a-8df4-c001aa100001',
    '0f1c2df6-fd53-46da-9077-f0f7f74f5001',
    'Great Lakes Credit Union',
    'Household Checking',
    'checking',
    'linked',
    '•••••0210',
    '•••• 7821',
    now() - interval '2 hours',
    now() - interval '9 days'
  ),
  (
    '7f24b350-c233-4d2a-8df4-c001aa100002',
    '52a9ea89-c4ea-4b44-8168-b293a2e3d702',
    'North Harbor Bank',
    'Travel Rewards Card',
    'credit',
    'pending_review',
    '•••••1184',
    '•••• 6402',
    now() - interval '7 hours',
    now() - interval '3 days'
  )
on conflict (id) do update
set
  institution_name = excluded.institution_name,
  account_name = excluded.account_name,
  account_type = excluded.account_type,
  status = excluded.status,
  routing_number_masked = excluded.routing_number_masked,
  account_number_masked = excluded.account_number_masked,
  last_sync_at = excluded.last_sync_at;
