# Tasks

## Phase 1 - 6 Hour Core Build
- [x] [2026-03-14 11:55] [P1] Scaffold Next.js 15 app with Tailwind, TypeScript, and core project config
- [x] [2026-03-14 11:58] [P1] Connect Supabase and configure auth helpers
- [x] [2026-03-14 11:55] [P1] Build signup, login, logout, and protected routing
- [x] [2026-03-14 11:55] [P1] Create initial schema for accounts, transactions, transfers, notifications, and optional profiles
- [x] [2026-03-14 11:55] [P1] Build dashboard with account summary, balance overview, recent transactions, and alerts
- [x] [2026-03-14 11:55] [P1] Build transactions page with filter/search and detail panel
- [x] [2026-03-14 11:55] [P1] Build internal transfer flow with confirmation and history
- [x] [2026-03-14 11:55] [P1] Build realtime notification panel
- [x] [2026-03-14 11:55] [P1] Build basic admin monitoring dashboard
- [x] [2026-03-14 11:55] [P1] Add loading, empty, and error states across core screens
- [x] [2026-03-14 11:55] [P1] Run lint, typecheck, and tests for Phase 1
- [x] [2026-03-14 12:34] [P1] Fix responsive dashboard overlap points and hide admin navigation/routes for members
- [x] [2026-03-14 13:53] [P1] Redirect authenticated users away from auth screens and into the dashboard

## Phase 2 - 3 Hour Expansion
- [x] [2026-03-14 13:57] [P2] Add password reset
- [x] [2026-03-14 15:14] [P2] Add MFA based on confirmed priority
- [x] [2026-03-14 16:13] [P2] Fix MFA security-page QR rendering for raw SVG/data URL payloads
- [x] [2026-03-14 16:35] [P2] Add Playwright demo smoke coverage for member/admin flows and fix sidebar logout reachability
- [x] [2026-03-14 16:43] [P2] Expand demo smoke coverage for notification visibility and transaction search/filter behavior
- [x] [2026-03-14 14:52] [P2] Add account details and statements flow
- [x] [2026-03-14 15:18] [P2] Add external account linking
- [x] [2026-03-14 15:25] [P2] Add external and scheduled transfers
- [x] [2026-03-14 15:28] [P2] Add bill payments
- [x] [2026-03-14 15:31] [P2] Strengthen admin alerts and security handling
- [x] [2026-03-14 12:47] [P2] Create reusable branded email templates and admin preview screen for common banking emails

## Phase 3 - 1 Hour Nice To Have
- [x] [2026-03-14 17:05] [Ops] Prepare Vercel deployment configuration and deployment runbook
- [x] [2026-03-14 17:40] [Ops] Add a dedicated Playwright demo-video walkthrough flow
- [x] [2026-03-14 17:49] [Ops] Expand the demo walkthrough into a single captioned member-plus-admin showcase clip
- [x] [2026-03-14 18:25] [Ops] Re-run UI E2E smoke coverage across member/admin screens and regenerate captioned demo video in 1080p
- [x] [2026-03-14 18:38] [Ops] Add a persisted inventory of approved command permissions
- [x] [2026-03-14 18:49] [Ops] Deploy current local state to Vercel production
- [ ] [P3] Implement true realtime notification subscriptions; current notifications refresh on server re-render but no live client subscription exists
- [ ] [P3] Add later nice-to-have features after user confirmation
