create table if not exists public.statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  period_label text not null,
  period_start date not null,
  period_end date not null,
  opening_balance_cents bigint not null default 0,
  closing_balance_cents bigint not null default 0,
  format text not null default 'csv' check (format in ('csv')),
  status text not null default 'available' check (status in ('available')),
  file_name text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.statements enable row level security;

drop policy if exists "statements_select_own_or_admin" on public.statements;

create policy "statements_select_own_or_admin"
on public.statements
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_admin()));

create index if not exists idx_statements_user_account_generated
on public.statements(user_id, account_id, generated_at desc);

insert into public.statements (
  id,
  user_id,
  account_id,
  period_label,
  period_start,
  period_end,
  opening_balance_cents,
  closing_balance_cents,
  format,
  status,
  file_name,
  generated_at,
  created_at
)
values
  (
    '6d14b350-c233-4d2a-8df4-c001aa100001',
    '0f1c2df6-fd53-46da-9077-f0f7f74f5001',
    '55dd90b2-e83d-429e-b4c6-61002b7f1001',
    'February 2026',
    date '2026-02-01',
    date '2026-02-28',
    511230,
    582340,
    'csv',
    'available',
    'primary-checking-february-2026.csv',
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    '6d14b350-c233-4d2a-8df4-c001aa100002',
    '0f1c2df6-fd53-46da-9077-f0f7f74f5001',
    '55dd90b2-e83d-429e-b4c6-61002b7f1002',
    'February 2026',
    date '2026-02-01',
    date '2026-02-28',
    1209040,
    1289040,
    'csv',
    'available',
    'rainy-day-savings-february-2026.csv',
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    '6d14b350-c233-4d2a-8df4-c001aa100003',
    '52a9ea89-c4ea-4b44-8168-b293a2e3d702',
    '55dd90b2-e83d-429e-b4c6-61002b7f1003',
    'February 2026',
    date '2026-02-01',
    date '2026-02-28',
    428410,
    392120,
    'csv',
    'available',
    'daily-checking-february-2026.csv',
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    '6d14b350-c233-4d2a-8df4-c001aa100004',
    '52a9ea89-c4ea-4b44-8168-b293a2e3d702',
    '55dd90b2-e83d-429e-b4c6-61002b7f1004',
    'February 2026',
    date '2026-02-01',
    date '2026-02-28',
    2064300,
    2144300,
    'csv',
    'available',
    'travel-savings-february-2026.csv',
    now() - interval '12 days',
    now() - interval '12 days'
  )
on conflict (id) do update
set
  period_label = excluded.period_label,
  period_start = excluded.period_start,
  period_end = excluded.period_end,
  opening_balance_cents = excluded.opening_balance_cents,
  closing_balance_cents = excluded.closing_balance_cents,
  format = excluded.format,
  status = excluded.status,
  file_name = excluded.file_name,
  generated_at = excluded.generated_at;
