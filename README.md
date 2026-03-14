# Bankjoy Blueprint

Bankjoy Blueprint is a Next.js 15 + Supabase banking demo that covers customer and operator flows in one app. It includes authentication, a protected dashboard, transaction history, internal and external transfers, bill payments, statements, notifications, MFA setup, password reset, and an admin operations monitor.

## What is included

- Member dashboard with account balances, recent activity, notifications, and search/filterable transactions
- Accounts workspace with statement downloads and external account linking
- Transfer center for internal transfers, external transfers, and scheduled transfers
- Bill payments with scheduled and paid states
- Security area for password reset and live Supabase MFA enrollment
- Admin monitoring view with categorized alerts and a triage queue
- Demo-mode fallback when Supabase env vars are missing
- Supabase SQL migrations with seeded banking data and seeded auth users

## Tech stack

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS v3
- Supabase Auth + Postgres + RLS
- Vitest
- Playwright
- `pnpm`

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run in demo mode

If you do not set Supabase env vars, the app runs in cookie-backed demo mode.

```bash
pnpm dev
```

Open `http://localhost:3000/login`.

Recommended demo logins:

| Role | Email | Password |
|---|---|---|
| Member | `member.demo@example.com` | `DemoPass123!` |
| Admin | `admin.demo@example.com` | `DemoPass123!` |

Notes:

- Demo mode is local-only and does not hit Supabase.
- The demo login path accepts any valid email/password pair, but any email containing `admin` is treated as an admin session. The two accounts above are the documented defaults used by the browser smoke tests.
- MFA enrollment is intentionally unavailable in demo mode because it depends on a live Supabase-authenticated session.

## Run with Supabase

Use this mode if you want real Supabase auth, RLS-backed queries, and the seeded SQL data.

### 1. Create env vars

Create a local env file from [.env.example](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/.env.example) and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` is used by the password reset flow and email template links.

### 2. Apply migrations

This repo ships SQL migrations in [supabase/migrations](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations). Apply them in timestamp order to your Supabase database:

1. [20260314114500_initial_mvp_schema.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314114500_initial_mvp_schema.sql)
2. [20260314121000_roles_and_demo_seed.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314121000_roles_and_demo_seed.sql)
3. [20260314145000_add_statements_and_account_downloads.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314145000_add_statements_and_account_downloads.sql)
4. [20260314153000_add_external_accounts.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314153000_add_external_accounts.sql)
5. [20260314154500_expand_transfers_for_external_and_scheduled.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314154500_expand_transfers_for_external_and_scheduled.sql)
6. [20260314160000_add_bill_payments.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314160000_add_bill_payments.sql)

You can run them through the Supabase SQL Editor or with the Supabase CLI after linking or initializing a local project.

### 3. Start the app

```bash
pnpm dev
```

Open `http://localhost:3000/login`.

### 4. Sign in with seeded live users

These users are inserted by [20260314121000_roles_and_demo_seed.sql](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/supabase/migrations/20260314121000_roles_and_demo_seed.sql):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bankjoy.demo` | `Admin@123` |
| Member | `member1@bankjoy.demo` | `Member@123` |
| Member | `member2@bankjoy.demo` | `Member@123` |

## Seeded data overview

After all migrations are applied, the database contains seeded demo data for:

- 3 auth users and matching `profiles`
- 4 accounts across 2 member users
- 8 transactions
- 4 statements
- 2 external accounts
- 4 transfers including completed, pending review, and scheduled states
- 2 bill payments including paid and scheduled states
- 4 notifications
- 4 alerts for the admin monitor

See [doc/SCHEMA.md](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/doc/SCHEMA.md) for the schema and migration summary.

## Useful commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

`pnpm test:e2e` runs the Playwright smoke suite against demo mode and overrides the public Supabase env vars to empty strings on purpose.

## Important behavior

- When Supabase env vars are missing, the app falls back to demo mode.
- When Supabase env vars are present, auth and data come from Supabase and RLS policies apply.
- Password reset uses the server-side confirmation flow in [app/auth/confirm/route.ts](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/app/auth/confirm/route.ts).
- Hosted reset email template guidance is documented in [doc/SUPABASE_AUTH_EMAILS.md](/Users/parthgajjar/Sites/localhost/bankjoy_blueprint_20260310_141525/doc/SUPABASE_AUTH_EMAILS.md).

## Verification

The current repository state has been verified with:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
