create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  account_number_masked text not null,
  balance_cents bigint not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_name text,
  description text not null,
  category text not null,
  amount_cents bigint not null,
  direction text not null check (direction in ('credit', 'debit')),
  status text not null default 'posted',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id) on delete cascade,
  to_account_id uuid not null references public.accounts(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  memo text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  kind text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null,
  severity text not null default 'info',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.notifications enable row level security;
alter table public.alerts enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (id = (select auth.uid()));

create policy "profiles_insert_own"
on public.profiles for insert
with check (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
using (id = (select auth.uid()));

create policy "accounts_select_own"
on public.accounts for select
using (user_id = (select auth.uid()));

create policy "transactions_select_own"
on public.transactions for select
using (user_id = (select auth.uid()));

create policy "transfers_select_own"
on public.transfers for select
using (user_id = (select auth.uid()));

create policy "notifications_select_own"
on public.notifications for select
using (user_id = (select auth.uid()));

create policy "alerts_select_related"
on public.alerts for select
using (user_id is null or user_id = (select auth.uid()));

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_transactions_user_account_date on public.transactions(user_id, account_id, occurred_at desc);
create index if not exists idx_transfers_user_id on public.transfers(user_id, created_at desc);
create index if not exists idx_notifications_user_id on public.notifications(user_id, created_at desc);
