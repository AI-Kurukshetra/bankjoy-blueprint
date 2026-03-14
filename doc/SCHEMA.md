# Schema

## Planned Phase 1 Tables

### `profiles` (optional)
- `id` uuid primary key references auth.users(id)
- `email` text
- `full_name` text
- `role` text
- `created_at` timestamptz

### `accounts`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `name` text
- `type` text
- `account_number_masked` text
- `balance_cents` bigint
- `currency` text
- `created_at` timestamptz

### `transactions`
- `id` uuid primary key
- `account_id` uuid references accounts(id)
- `user_id` uuid references auth.users(id)
- `merchant_name` text
- `description` text
- `category` text
- `amount_cents` bigint
- `direction` text
- `status` text
- `occurred_at` timestamptz
- `created_at` timestamptz

### `transfers`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `from_account_id` uuid references accounts(id)
- `to_account_id` uuid nullable references accounts(id)
- `external_account_id` uuid nullable references external_accounts(id)
- `transfer_rail` text
- `amount_cents` bigint
- `memo` text
- `status` text
- `scheduled_for` date nullable
- `processed_at` timestamptz nullable
- `created_at` timestamptz

### `notifications`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `title` text
- `message` text
- `kind` text
- `is_read` boolean
- `created_at` timestamptz

### `statements`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `account_id` uuid references accounts(id)
- `period_label` text
- `period_start` date
- `period_end` date
- `opening_balance_cents` bigint
- `closing_balance_cents` bigint
- `format` text
- `status` text
- `file_name` text
- `generated_at` timestamptz
- `created_at` timestamptz

### `external_accounts`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `institution_name` text
- `account_name` text
- `account_type` text
- `status` text
- `routing_number_masked` text
- `account_number_masked` text
- `last_sync_at` timestamptz
- `created_at` timestamptz

### `bill_payments`
- `id` uuid primary key
- `user_id` uuid references auth.users(id)
- `from_account_id` uuid references accounts(id)
- `payee_name` text
- `payee_category` text
- `amount_cents` bigint
- `status` text
- `deliver_by` date
- `memo` text nullable
- `processed_at` timestamptz nullable
- `created_at` timestamptz

## Planned Optional Phase 1 Table

### `alerts`
- `id` uuid primary key
- `user_id` uuid nullable references auth.users(id)
- `kind` text
- `severity` text
- `message` text
- `created_at` timestamptz

## Implemented Migration
- `supabase/migrations/20260314114500_initial_mvp_schema.sql`
  - Creates `profiles`, `accounts`, `transactions`, `transfers`, `notifications`, and `alerts`
  - Enables RLS on all Phase 1 tables
  - Adds owner-scoped select/insert/update policies where applicable
  - Adds indexes for user and time-based access patterns
- `supabase/migrations/20260314121000_roles_and_demo_seed.sql`
  - Adds `public.is_admin()` for role-aware policies
  - Adds `public.handle_new_user()` trigger to create/update `profiles` from `auth.users`
  - Replaces owner-only read policies with member/admin-aware read policies
  - Adds `public.submit_internal_transfer()` to update balances and create ledger + notification rows atomically
  - Seeds 3 auth users, 4 accounts, 8 transactions, 2 transfers, 4 notifications, and 4 alerts
- `supabase/migrations/20260314145000_add_statements_and_account_downloads.sql`
  - Creates `statements`
  - Enables RLS and adds member/admin read access through `public.is_admin()`
  - Adds an account/time index for statement retrieval
  - Seeds 4 statement rows for the existing seeded member accounts
- `supabase/migrations/20260314153000_add_external_accounts.sql`
  - Creates `external_accounts`
  - Enables RLS with member-owned insert/select and admin visibility through `public.is_admin()`
  - Adds a user/time index for linked-account retrieval
  - Seeds 2 external account rows for the existing member data
- `supabase/migrations/20260314154500_expand_transfers_for_external_and_scheduled.sql`
  - Expands `transfers` for external destinations and scheduled execution metadata
  - Adds destination-shape checks for internal vs external rails
  - Adds `public.submit_transfer()` to handle internal completion, external pending review, and scheduled transfer creation
  - Seeds 2 additional transfer rows to demonstrate external pending-review and scheduled transfer states
- `supabase/migrations/20260314160000_add_bill_payments.sql`
  - Creates `bill_payments`
  - Enables RLS with member-owned insert/select and admin visibility through `public.is_admin()`
  - Adds a due-date index for bill-pay retrieval
  - Adds `public.submit_bill_payment()` to handle immediate and scheduled bill payments
  - Seeds 2 bill payment rows to demonstrate paid and scheduled states

## Seeded Demo Users
- `admin@bankjoy.demo` — role `admin`
- `member1@bankjoy.demo` — role `member`
- `member2@bankjoy.demo` — role `member`
