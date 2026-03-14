# Progress

[2026-03-14 11:42] codex — Initialized required /doc files and recorded the agreed phased roadmap and MVP scope.
[2026-03-14 11:55] codex — Built the Phase 1 Next.js banking MVP with auth flows, dashboard, transactions, transfers, notifications, admin monitor, Supabase wiring, and migration scaffolding.
[2026-03-14 11:58] codex — Verified `.env` Supabase connectivity; publishable-key access reached the project and `accounts` table query returned successfully.
[2026-03-14 12:11] codex — Applied schema and seed migrations, verified demo auth users, confirmed member/admin RLS behavior, and validated the live transfer RPC path.
[2026-03-14 12:18] codex — Redesigned the desktop dashboard shell, transactions, transfers, and admin views to use the available width and feel closer to a real banking/admin workspace.
[2026-03-14 12:34] codex — Fixed early-breakpoint overlap in key dashboard panels, hid admin navigation for members, and blocked non-admin access to the admin route.
[2026-03-14 12:38] codex — Replaced fragile flex header layouts with explicit grid columns across overview, transactions, transfers, admin, and workspace headers to stop desktop overlap in the hero sections.
[2026-03-14 12:42] codex — Rewrote visible product copy across auth, dashboard, transfers, admin, and metadata to remove internal build language and present the app as a real banking product.
[2026-03-14 12:47] codex — Added a reusable Bankjoy HTML email template system, common email variants, an admin-only preview page, and template unit tests.
[2026-03-14 12:55] codex — Fixed the app hydration warning by suppressing root-level attribute mismatches caused by browser-injected client attributes on `html` and `body`.
[2026-03-14 13:53] codex — Redirected authenticated sessions away from `/login` and `/signup` at the auth layout level so signed-in users go straight to `/dashboard`.
[2026-03-14 13:57] codex — Implemented password reset request and update flows with reset pages, recovery-session handling, server actions, login links, and validation tests.
[2026-03-14 14:03] codex — Replaced the client-side recovery exchange with a server-side `/auth/confirm` token-hash verification route and documented the required Supabase recovery email template change.
[2026-03-14 14:05] codex — Expanded the Supabase recovery email handoff doc with a full Bankjoy-branded HTML template that matches the app theme and uses the SSR-safe confirmation route.
[2026-03-14 14:08] codex — Added the hosted Supabase recovery-template HTML directly to the admin email screen so the copy-paste version is available inside the app.
[2026-03-14 14:19] codex — Removed remaining platform wording and sample-style content from visible screens, updated page titles to Bankjoy, and replaced low-trust placeholder text with production-style copy.
[2026-03-14 14:27] codex — Updated the admin email screen so the password reset message is shown as rendered email content alongside the copy-paste HTML source.
[2026-03-14 14:40] codex — Fixed password recovery compatibility so reset links landing on `/reset-password/update` with recovery params are handed off to `/auth/confirm` and completed server-side.
[2026-03-14 14:52] codex — Added the accounts workspace, statement downloads, a live `statements` table + seed data, and secure CSV statement exports for the seeded accounts.
[2026-03-14 15:04] codex — Marked the next Phase 2 auth expansion task as blocked because the required MFA-vs-OAuth priority decision is not documented.
[2026-03-14 15:14] codex — Added TOTP MFA enrollment and verification flows, enforced MFA redirects after password login, introduced a dashboard security center, and verified lint, typecheck, and tests.
[2026-03-14 15:18] codex — Added external account linking with a new `external_accounts` migration, masked-detail storage, demo/live linking flows, accounts-page UI, and passing lint, typecheck, and tests.
[2026-03-14 15:25] codex — Added external and scheduled transfers with a transfer-rail migration, scheduled/pending statuses, a new unified transfer server action, refreshed transfer UI, and passing lint, typecheck, and tests.
[2026-03-14 15:28] codex — Added bill payments with a new `bill_payments` migration, live/demo submission flows, a dedicated payments dashboard page, and passing lint, typecheck, and tests.
[2026-03-14 15:31] codex — Strengthened admin alerts and security handling with categorized alert summaries, a prioritized triage queue, and Phase 2 completion-level verification via lint, typecheck, and tests.
[2026-03-14 16:13] codex — Fixed MFA QR rendering on `/dashboard/security` by trimming and encoding raw SVG/data URL payloads before passing them to `next/image`, then re-ran lint, typecheck, and tests.
[2026-03-14 16:35] codex — Added Playwright demo smoke tests for member/admin browser flows, forced the E2E web server into demo mode, fixed desktop sidebar overflow so logout remains reachable, and verified lint, typecheck, and Playwright passes.
[2026-03-14 16:43] codex — Expanded demo Playwright coverage to assert notification visibility and transaction search/filter behavior, and confirmed notifications are server-refreshed rather than true realtime subscriptions.
[2026-03-14 16:55] codex — Re-ran lint, typecheck, unit tests, and Playwright demo smoke coverage on the full Phase 2 change set before committing and pushing.
[2026-03-14 17:05] codex — Added Vercel deployment documentation, completed the missing production app-URL env wiring, and prepared the Supabase/Vercel redirect configuration checklist.
[2026-03-14 17:40] codex — Added a dedicated headed Playwright demo-video flow with slower walkthrough pacing and saved-video output for reusable demo recordings.
[2026-03-14 17:49] codex — Expanded the demo recorder into one captioned member/admin walkthrough covering dashboard, accounts, statements, transfers, payments, transactions, security, admin monitor, and email previews.
[2026-03-14 18:25] codex — Re-ran Playwright UI smoke tests across member/admin screens (pass), upgraded demo-video recording output to 1920x1080 with scaled captions, and generated a fresh high-resolution walkthrough video.
[2026-03-14 18:38] codex — Added `doc/PERMISSIONS.md` with all currently approved command prefixes (existing and session-added) for explicit permission tracking.
