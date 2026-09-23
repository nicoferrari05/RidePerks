# RidePerks — Handoff

For whoever (human or AI) picks this up next. **Read this first if you're a
fresh session.** It gets you productive fast; it doesn't document every
feature. For deployment and operations see `PRODUCTION.md` (bottom section
covers the September 2026 changes) and `YAPPY.md`; for merchant roles and
access grants see `docs/merchant-access.md`; for brand voice see `PRODUCT.md`
(note: its color guidance is outdated, see "Brand identity" below).

## The goal

RidePerks is a benefits club for gig drivers (Uber, InDrive, PedidosYa) in
Panama. It negotiates real discounts with local businesses (fuel, food,
maintenance, health) so a driver's existing spending goes further. It's a
three-sided platform: drivers redeem benefits, businesses honor them, and
RidePerks runs a paid membership ($15/month, Yappy, manual renewal) on top.

## Before you touch anything

- Several sessions/agents commit straight to `main` in this folder; there are
  no feature branches. Run `git fetch && git log --oneline -10 && git status`
  first.
- Push only when the user asks in *that* conversation. `main` auto-deploys to
  production (Vercel project `ride-perks`, team
  `nicoferraric-icloudcoms-projects`, domain `rideperks.app`). The
  `rideperks` / `rideperks-landing` Vercel projects are unrelated.
- The local Vercel CLI is logged in as `giancoferrari`, which does **not** have
  access to that team, so env vars are set by the user in the dashboard.
- Before every commit: `npx tsc --noEmit`, `npm run lint`, `npm test`
  (37 PGlite tests), `npm run build`. With a server on :3100,
  `npx playwright test` (11 public e2e tests).
- The user writes in Spanish (Latin American, tuteo, never voseo). All UI copy
  is Spanish with tuteo.
- `AGENTS.md`: this Next.js (16) has breaking changes vs. training data
  (middleware is `proxy.ts`); check `node_modules/next/dist/docs/`.

## Brand identity (current, September 2026)

Chosen after trying several palettes. **Monochrome base + one green action
color. No orange (ember), no italics, no serif accent word** — the user
explicitly removed all of them. Minimal copy on the landing; "Nosotros" is the
one page with long-form text.

| Role | Color |
| --- | --- |
| Pitch black (text, dark bands) | `#100B00` |
| Yellow green (primary buttons, active states) | `#85CB33` |
| Frosted mint (light background) | `#EFFFC8` |
| Dark khaki (dark-mode bands, secondary surfaces) | `#3B341F` |
| Ash grey `#A5CBC3` | Part of the palette but **intentionally unused**; the user asked to avoid it |

Font: Geist (`next/font`), wordmark "RIDEPERKS" as plain text (no pill) via
`<LogoMark variant="text" />`. Motion follows Emil Kowalski's guidance
(`/emil-design-eng` skill): buttons scale to 0.97 on press in 160ms with
`ease-snappy` (`cubic-bezier(0.23,1,0.32,1)`); on-screen movement uses
`ease-move`; panels use `ease-drawer`; hover effects only on pointer devices;
UI animations stay under 300ms; `prefers-reduced-motion` disables motion.
Curves are Tailwind tokens in `app/globals.css` (`ease-snappy`, `ease-move`,
`ease-drawer`).

## Three styling systems (don't cross them by accident)

1. **Landing** (`/`, `/about`) — Tailwind + CSS variables `--lp-*` scoped to
   `.lp` (see `components/landing/LandingShell.tsx`). Three themes via
   `html[data-lp-theme="light|dark|dim"]`, chosen with the liquid-glass
   switcher (`components/ui/apple-liquid-glass-switcher.tsx`, CSS-only glass;
   the original 21st.dev SVG filter was dropped). Theme is stored in
   `localStorage` `rp_lp_theme`, applied pre-paint by an inline script, and
   cleared when leaving the landing (`ThemeSync`). Tokens live in
   `app/globals.css`; use `bg-lp-bg`, `text-lp-fg`, `bg-lp-accent`, etc.
2. **Auth screens** (`/login`, `/register`, `/recover`, business login/register)
   — `components/ui/sign-in.tsx` `AuthShell` with class `.rp-auth`, which
   re-points the shadcn-style Tailwind tokens to the palette (light only). The
   layout/design of these screens is intentionally unchanged; only colors.
3. **Platform** (`/driver/*`, `/business/*`, `/account/password`,
   `/admin/platform|payments|reviews|access`, `/privacidad`, `/terminos`) —
   plain CSS in `app/platform.css`, `.rp-*` class names, no Tailwind colors.
   Tokens `--rp-*` on `.rp-app` (shared with `.rp-auth`). Light/dark only via
   `html[data-rp-theme]`, `localStorage` `rp_app_theme`, set by
   `components/platform/ThemeScript.tsx` + toggle in
   `components/platform/theme.tsx`. Driver and business shells have the
   toggle; admin pages are light. **Class names are the platform's API** —
   restyle in `platform.css`, don't rename. Mobile-first: sticky glass header
   and a floating pill bottom nav under 700px.

`/admin` (waitlist) and `/admin/login` keep their older Tailwind/navy look.

## Landing structure

`app/page.tsx`: Splash (first visit per session; text logo on black; the hero
entrance animation waits for it via `:has()`), Nav, Hero, Benefits,
Manifesto, HowItWorks, Pricing, JoinCTA (`#unete`), Footer, MobileCTA.

- `components/Nav.tsx` (client): logo, pill nav whose shaded indicator slides
  to the clicked link (plus scroll-spy on `/`), "Comercios", theme switcher,
  "Iniciar sesión". Once the page scrolls the whole header becomes a glass
  tab (`.lp-tab`) so it never overlaps content.
- `components/landing/InfoCard.tsx`: card with icon + title; hover shades it,
  tapping slides up a detail panel (Escape/close button dismisses). Used by
  Benefits (with a link to `/driver/benefits?category=…`) and HowItWorks.
  Icons must be passed as rendered elements (server → client boundary).
- `components/landing/PillLink.tsx`: the one CTA shape (pill + arrow circle).
- The funnel is **create account**, not the waitlist. `Waitlist.tsx`,
  `WaitlistForm.tsx`, `Counter.tsx` are unused but kept; `/api/waitlist`
  still works.
- `/about` has the long-form content: what RidePerks is, for drivers vs.
  businesses (`AboutAudiences`), how a redemption works, the four areas, FAQ.

## Platform state

- **Driver**: register/login (no email confirmation, a launch decision),
  dashboard with month/total savings, verification by photo upload
  (admin-reviewed; the photo is deleted after review), membership (Yappy),
  history, directory, profile, help.
- **Catalog is hidden**: `rp_settings.catalog_live = false`. Drivers see
  "Próximamente" in Benefits/Comercios and benefit detail 404s. Toggle it in
  `/admin/platform` when approved benefits exist. Live e2e tests
  (`tests/live/*`) need it `true`.
- **Business**: scanner (preview then confirm), staff invites, benefit
  proposals reviewed in `/admin/reviews`, name/address/category changes also
  reviewed (`rp_business_changes`), stats, help form. A benefit paused by an
  admin (`admin_paused`) can't be reactivated by the merchant.
- **Admin**: shared `ADMIN_PASSWORD` cookie for `/admin/*`, plus a personal
  identity in `rp_admin_users` (self-enroll at `/admin/access`) required for
  access grants, benefit/business reviews and manual payment credit. As of
  the last session nobody had enrolled yet; remind the user.
- **Payments**: `free_access = false` (billing live). Daily Vercel cron
  `/api/cron/daily` (`vercel.json`, needs `CRON_SECRET`) expires pending
  orders older than 24h and emails renewal reminders. `/admin/payments` can
  credit an order manually with a reason (audited).
- **Email**: Resend. Supabase Auth SMTP is configured through Resend (sender
  `soporte@rideperks.app`); app emails (receipt, verification result,
  renewal reminder) go through `lib/email.ts` using `RESEND_API_KEY` /
  `EMAIL_FROM`. The branded password-reset template is
  `supabase/email-templates/recovery.html` (paste it into Supabase → Auth →
  Emails → Templates → Reset Password).
- **Security**: optional Cloudflare Turnstile on registration (active only if
  both keys are set). HSTS on. CSP ships as **report-only** in
  `next.config.mjs`; switch to enforcing after confirming Yappy on
  `/driver/membership` shows no CSP warnings in the browser console.

## Database

Migrations in `supabase/migrations/`, applied manually in order via the SQL
Editor (`node scripts/prepare-supabase.mjs` bundles them into
`artifacts/ACTIVAR_RIDEPERKS.sql`, idempotent). Latest:
`202609120001_hardening_and_ops.sql` (admin_paused, catalog_live,
business-owner role check, `rp_business_changes`, payment expiry/credit).
Confirm with the user that it's applied in production before relying on it.
RLS is on everywhere with no anon/authenticated policies; all access goes
through server code with the service-role key.

## Verifying UI without credentials

There's no `.env.local` here, so logged-in pages can't be opened directly.
Pattern used repeatedly: create a throwaway route (e.g. `app/zz-preview/`)
that renders the real components with fake data, screenshot it with a small
Playwright script (`artifacts/` is gitignored and holds such scripts), then
**delete the route before committing** and rebuild (stale `.next/types` will
otherwise make `tsc` complain about the deleted route).

Serving locally: `npm run build && npx next start -p 3100`. When restarting,
kill whatever still listens on 3100 first (PowerShell:
`Get-NetTCPConnection -LocalPort 3100 -State Listen` → `Stop-Process`),
otherwise the old build keeps being served.

## Open items / ideas not done

- Enforce the CSP (see above).
- Admin enrollment in `rp_admin_users` (one-time, by the user).
- Turn on `catalog_live` once there are approved benefits.
- Real-device checks: QR scanning between two phones, Yappy payment, PWA
  install.
- `PRODUCT.md` and `README.md` still describe the old navy/ember identity and
  waitlist-first funnel; update them if they matter to the next task.
- Ideas raised but not implemented: per-person admin accounts with 2FA
  replacing the shared password, Google sign-in, Sentry, funnel analytics,
  a staging Supabase project + PR-based workflow.
