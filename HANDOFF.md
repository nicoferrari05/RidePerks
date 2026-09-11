# RidePerks — Handoff

Written at the end of a Claude Code session, for whoever (human or AI) picks this
up next. Supersedes the old HANDOFF.md, which was a one-time "transfer this repo
to my brother" guide — that transfer already happened; this repo has since been
under active, ongoing development by multiple people/agents.

**Read this first if you're a fresh session.** It's oriented at getting you
productive fast, not at documenting every feature — for deployment/ops detail see
`PRODUCTION.md` and `YAPPY.md`; for the merchant/access system see
`docs/merchant-access.md`.

## The goal

RidePerks is a benefits club for gig drivers (Uber, InDrive, PedidosYa) in
Panama. The pitch: driving for these platforms is already the hard part —
RidePerks negotiates real discounts with local businesses (fuel, food,
maintenance, health) so a driver's existing spending goes further, instead of
promising more rides or a smarter algorithm.

It started as a waitlist landing page and has grown, commit by commit, into a
real three-sided platform: drivers redeem benefits, businesses honor them, and
RidePerks runs a paid membership on top. The underlying intent hasn't changed
since the first commit — "tu trabajo rinde más" — everything since has been
building out how that promise actually gets delivered and paid for.

## Current state of the code

**Public marketing site** (`app/page.tsx`, `app/about/page.tsx`,
`components/sections/*`): Hero, Benefits (one color per category), Manifesto,
HowItWorks, Pricing (a **static, blurred "coming soon" placeholder** with
illustrative plan names — not wired to real billing), Waitlist, Footer. Has a
once-per-session splash screen (`components/SplashScreen.tsx`) and a mobile
sticky CTA. Built with Tailwind directly; brand tokens live in
`app/globals.css` (ember/navy/bone/paper/sol/verde). Uses GSAP for scroll
reveals; the public bundle deliberately avoids react-three-fiber except for the
splash, which lazy-loads it.

**Driver platform** (`app/driver/*`): register/login with no email
confirmation (a deliberate launch decision — see `lib/platform/auth-actions.ts`
comments), dashboard with a "this month / total" savings toggle, benefit
browse + detail + redemption (QR code **and** a 6-character fallback code for
when the camera doesn't work), identity verification via photo upload
(admin-reviewed), history, profile, membership/payment page, help/support.

**Business/merchant platform** (`app/business/*`): register/login, a portal
with a scanner that does a **preview-then-confirm** redemption flow (consult
first, confirm second), staff invites (hashed single-use tokens, owner/staff
roles via `rp_business_members`), benefit proposals that go through admin
review before touching the live catalog, self-service business info edits,
owner-only stats, and a business switcher for people who belong to more than
one.

**Admin** (`app/admin/*`): `/admin` is the original waitlist dashboard (still
separate from the platform). `/admin/platform` manages verifications,
driver accounts, businesses, benefits, and support tickets.
`/admin/payments` shows the Yappy payment ledger. `/admin/reviews` is where
merchant benefit proposals get approved or returned. `/admin/access` is where
a named admin identity gets enrolled and where a driver's access can be
manually granted/suspended (trial, courtesy, extension, lifetime) independent
of payment.

**Payments** (`lib/payments/*`, `app/api/payments/yappy/*`): Yappy's Botón de
Pago, $15.00/month, manual renewal only (no auto-charging), HMAC-SHA256
signature-verified IPN webhook. **`rp_settings.free_access` is still `true`** —
nobody is being charged yet. That single row is the switch; flipping it to
`false` is the actual "go live with billing" moment (see YAPPY.md's
Activación section).

**Access model**: `rp_has_access()` / `rp_access_state()` (SQL) resolve to true
if `free_access` is on, OR the driver has an active paid membership, OR an
active admin-granted access window (trial/courtesy/extension/lifetime) — but
an admin suspend/cancel in `rp_access_controls` always wins over all of those.

**Database**: 6 migrations, applied in order, all additive:

```
supabase/migrations/202609080001_driver_platform.sql
supabase/migrations/202609080002_waitlist_privacy.sql
supabase/migrations/202609090001_qr_short_codes.sql
supabase/migrations/202609100001_yappy_memberships.sql
supabase/migrations/202609110001_merchant_roles.sql
supabase/migrations/202609110002_access_and_review.sql
```

`node scripts/prepare-supabase.mjs` bundles all of them (idempotent, safe to
re-run) into `artifacts/ACTIVAR_RIDEPERKS.sql` for pasting into Supabase's SQL
Editor. RLS is on everywhere with no anon/authenticated policies — every table
is service-role-only, reached exclusively through Next.js server code that
checks the session first.

**Tests**: `npm test` runs 33 PGlite-backed tests (no real Supabase needed) —
permissions, redemption races, payment idempotency, staff/invite scoping,
access-grant edge cases. All passing as of the last commit. `npm run
test:e2e` covers public routes. `npm run test:e2e:live` hits a real,
configured Supabase instance and needs `.env.local` + `ADMIN_PASSWORD`.

## Files actively being edited

None — the working tree is clean and `HEAD` matches `origin/main` at
`fe667e5` ("Add merchant management and flexible driver access"). Nothing was
left mid-change this session.

The most recently touched files, in case you want to see what's freshest:

- `app/admin/AdminDashboard.tsx`, `app/admin/platform/page.tsx`,
  `app/platform.css` — header spacing and status-pill dropdown arrow fixes
  (`fa59e6e`).
- `app/admin/login/page.tsx`, `components/SplashScreen.tsx`,
  `components/platform/YappyCheckout.tsx` — full-screen admin login
  background fix, new homepage splash, Yappy modal z-index fix (`c1be08d`).
- `supabase/migrations/202609110001_merchant_roles.sql` /
  `202609110002_access_and_review.sql`, `lib/platform/access-actions.ts`,
  `lib/platform/business-actions.ts` — the merchant/access system just
  reviewed and confirmed solid (`fe667e5`).

## Context a fresh start needs

**This repo is being worked on by more than one agent/session in parallel**,
all committing straight to `main` in this same local folder — there are no
feature branches or PRs. **Before doing anything, run `git fetch && git log
--oneline -10` and `git status`** — the local checkout may already reflect
commits from a session you weren't part of, exactly as happened repeatedly in
this one. Don't assume the code matches what you last remember.

**Established workflow this session used, worth continuing**: read/verify
before touching anything unfamiliar (this codebase rewards it — the SQL
functions in particular are dense and each has real security reasoning baked
in, not just CRUD); run `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm
run build` before every commit; commit directly to `main` with a descriptive
message; push only once the user has actually asked for it in that
conversation (don't assume standing permission carries over).

**Verifying UI changes without real credentials**: there's no `.env.local` in
this environment (by design — no real secrets here), so `/admin/*`,
`/driver/*`, and `/business/*` can't be logged into for a visual check. The
pattern used repeatedly this session: stand up a throwaway route under `app/`
(anything not starting with `_`, Next.js treats double-underscore-prefixed
folders as reserved) that imports the same CSS/JSX with fake data, screenshot
it with a local Playwright script, then delete the route before committing.
`npm test`'s PGlite suite is the other main lever — it spins up a real
Postgres in-memory and applies the actual migrations, so SQL-level behavior
can be verified exactly without any live project.

**Design system split, don't cross it accidentally**: the public marketing
site is Tailwind utility classes + brand tokens in `app/globals.css`, uses
GSAP for motion, and (mostly) lucide-react icons in Hero/Benefits — though
`components/icons.tsx` (a hand-drawn custom set) is still the intentional
choice for a few spots (Footer's Instagram glyph, WaitlistForm's
check/copy/WhatsApp icons). Everything under `/driver`, `/business`, and
`/admin/platform`+`/admin/payments`+`/admin/reviews`+`/admin/access` shares
one plain CSS file, `app/platform.css` (`.rp-*` class names, no Tailwind), and
Framer Motion only appears on the isolated `/admin/login` page. Don't
introduce Tailwind into `platform.css`'s territory or vice versa without a
reason — it's a deliberate split, not an accident.

**Two admin identity layers, both needed for the newer actions**: the
original shared `ADMIN_PASSWORD` cookie (`ADMIN_COOKIE_NAME`, checked in
`proxy.ts`) gates all of `/admin/*`. Separately, `rp_manage_access` and
`rp_review_benefit` also require the currently-logged-in personal
driver/business profile to be enrolled in `rp_admin_users` — done once via
`/admin/access`'s "Identidad administrativa" self-enroll. You need both to
grant/suspend driver access or approve a merchant's benefit proposal.

**Required env vars** (see `.env.local.example` for the full annotated list):
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (32+ chars), `SITE_URL`,
`SUPPORT_EMAIL` (optional), and for payments `YAPPY_ENABLED`,
`YAPPY_MERCHANT_ID`, `YAPPY_SECRET_KEY`, `YAPPY_DOMAIN`. None of these are
present in this environment — that's expected, not a bug to fix.

**Deployment**: Vercel project `ride-perks` (team
`nicoferraric-icloudcoms-projects`), domain `rideperks.app` /
`www.rideperks.app`, auto-deploys on push to `main`. Don't confuse it with the
similarly-named `rideperks` / `rideperks-landing` Vercel projects — those are
different projects entirely.

**Read next, in this order, if picking up real work**: `PRODUCTION.md`
(deployment + operations + security notes), `YAPPY.md` (payment integration
specifics and activation steps), `docs/merchant-access.md` (staff roles,
invites, benefit review, access grants), `PRODUCT.md` (brand register/voice,
used by the `impeccable` skill), and `AGENTS.md` (this project's Next.js
version has real breaking changes from training-data Next.js — it points at
`node_modules/next/dist/docs/` for the current API).
