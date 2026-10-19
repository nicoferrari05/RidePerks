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
`<LogoMark variant="text" />`.

Icons and share card, all made from images the user supplied (resized only,
never redrawn):

- Browser tab (`app/icon.png`, `public/favicon.ico`): the mint "RP" circle cut
  out on a **transparent** background (the user asked for no black square).
- `apple-touch-icon.png`, `icon-192/512.png`: same art on its black field (iOS
  fills transparency with black anyway). `icon-maskable-512.png` shrinks the
  circle into Android's 80% safe zone.
- `app/layout.tsx` declares every icon link explicitly: setting `icons` in
  metadata suppresses Next's automatic link for `app/icon.png`.
- Share card: `public/share.jpg` (970×610, wordmark on the dot matrix), declared
  once in `lib/share.ts` and used by `/` and `/about`. Rename the file if it
  changes again: WhatsApp/Facebook/X cache by URL.
- `theme-color` is mint in light / black in dark; manifest colors are black.

Motion follows Emil Kowalski's guidance
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
2. **Auth screens** (`/login`, `/register`, `/recover`, business login/register,
   `/admin/login`, the `/pin` entry) — `components/ui/sign-in.tsx` `AuthShell`
   with class `.rp-auth`, which re-points the shadcn-style Tailwind tokens to
   the mint palette (light only). Their legacy controls (`.rp-field`,
   `.rp-button`, `.rp-access-switch`…) live in `app/auth.css`, every rule
   scoped to `.rp-auth`. The user asked to leave these screens as they are.
3. **Platform** (`/driver/*`, `/business/*`, `/pin` scanner,
   `/account/password`, all signed-in `/admin/*`, `/privacidad`, `/terminos`)
   — redesigned October 2026 in the spirit of Uber/Airbnb (the user supplied
   reference screenshots): **white background, soft gray cards with no
   borders, one big number or title per screen, few icons, green
   (`#85CB33`) only on actions**, black hero card for the key number. Plain
   CSS in `app/platform.css`, every rule scoped to `.rp-app` (CSS stays
   loaded across client navigation, so unscoped rules would leak into the
   auth screens). **Class names are the platform's API** — restyle there,
   don't rename. Dark mode = black (`#100B00`) with white text, chosen only
   in Cuenta → Apariencia (`ThemeSetting` in `components/platform/theme.tsx`;
   `localStorage` `rp_app_theme`; default light, the OS preference is
   ignored on purpose). No theme toggle in headers any more.
   - **Buttons**: `components/ui/button.tsx` (Base UI, supplied by the user)
     for every platform/admin button; it defaults to `type="button"`, so form
     submits need `type="submit"`. Links styled as buttons use
     `buttonVariants()` from `components/ui/button-variants.ts` (a plain
     module, callable from server components). Colors come from `--primary`,
     `--muted`, `--border`… set on `.rp-app`; inside gray cards `--muted`
     switches to white so secondary buttons stay visible.
   - **Navigation**: `components/ui/spotlight-dock.tsx`, a floating dock
     (icon + label, spotlight + sliding bar on the active tab), adapted from a
     component the user supplied: **light in light mode, dark in dark mode**
     (`--rp-dock*` tokens in `platform.css`). **Max four tabs.** Driver: Inicio ·
     Beneficios (Comercios is a segmented tab inside) · Actividad · Cuenta
     (membership, verification, help, password, profile edit, appearance).
     Business: Escanear · Actividad · Beneficios · Cuenta (staff only get
     Escanear · Cuenta); the portal lives in the route group
     `app/business/(portal)/`. Admin: Plataforma · Revisiones · Pagos · Más
     (`/admin/more`: access, waitlist, appearance, logout). Dock items are
     defined in client components (icons can't cross the server→client
     boundary as props).
   - Sub-pages use `SubHeader` (round back button + centered title, which is
     the page's `h1`); big titles under it are `h2.rp-title`. Settings rows
     use `.rp-menu` + `MenuLink`; longer content opens in place with
     `<details>`.
   - Screens are presentational views fed by thin pages:
     `components/platform/driver/views.tsx`, `driver/account-views.tsx`,
     `business/views.tsx`, `BusinessMetrics` (`loadBusinessStats`) and
     `BusinessBenefits` (`loadBusinessBenefits`). That is what makes the
     fake-data preview route pattern below cheap.
   - `money()` shows `$10.50` and `dateLabel()` `19 oct 2026`.
   - **Speed (the user asked for app-like, instant taps on low-end
     phones)**: the dock lights the tapped tab immediately (optimistic state,
     before the route arrives); every section has a `loading.tsx` skeleton
     (`LoadingBlocks`; admin ones render inside `AdminShell` so the dock
     stays); `experimental.staleTimes.dynamic = 30` keeps visited tabs in the
     client cache (server actions' `revalidatePath` still refreshes them);
     `proxy.ts` and `currentProfile()` verify the session with
     `auth.getClaims()` — local ES256 check, no Supabase Auth round trip per
     request — and `currentProfile()` treats `closed_at` accounts as signed
     out. Animations are transform/opacity only (no blur filters, no
     background-position shimmer). The unused Fraunces font was removed.
     Testing on `next dev` feels slow because each screen compiles on first
     visit; judge speed on a production build.
   - `.rp-app * { min-width: 0 }` lets flex children shrink below their text.

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
  Icons must be passed as rendered elements (server → client boundary). Front
  and panel share one grid cell, so the card is as tall as the longer of the
  two (an absolutely positioned panel clipped its text on phones).
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
- **Business PIN (scan without an account)**: sign-in has a third tab, PIN
  (`/pin`), for on-site staff (pump attendant, mechanic, waiter). They type
  the business's 6–8 digit PIN, the camera opens, and a scan registers the
  use at once (no preview step) under that business (`redeemed_via = 'pin'`,
  `redeemed_by` null; the owner's history shows "Confirmado con PIN"). Admins
  **type** each PIN in `/admin/platform` → Comercios → Editar comercio; the
  app never generates one. Only an HMAC of the PIN is stored (key:
  `ADMIN_SESSION_SECRET`, so rotating that secret invalidates every PIN). The
  device gets a signed 12h `rp_pin` cookie carrying the business's
  `pin_version`; changing/removing the PIN or pausing the business signs out
  every device. Logic in `lib/pinAuth.ts`, `lib/platform/pin-actions.ts`,
  `app/api/pin/redeem`, `rp_redeem_token_pin` (migration
  `202610130001_business_pins.sql`). Rate limits: 10 PIN attempts per IP and
  200 overall per 10 min.
- **Admin**: shared `ADMIN_PASSWORD` cookie for `/admin/*`, plus a personal
  identity in `rp_admin_users` (self-enroll at `/admin/access`) required for
  access grants, benefit/business reviews and manual payment credit. As of
  the last session nobody had enrolled yet; remind the user.
- **Payments**: `free_access = false` (billing live). Yappy's `<btn-yappy>` is
  an Angular element **without shadow DOM**, so our global CSS (Tailwind
  preflight) reaches its markup. Its payment `<dialog>` relies on the
  browser's `margin: auto` to center; `platform.css` restores it with
  `btn-yappy dialog { margin: auto }`. The dialog only exists during a real
  payment, so test layout changes with a replica, not a fake transaction.
  Daily Vercel cron
  `/api/cron/daily` (`vercel.json`, needs `CRON_SECRET`) expires pending
  orders older than 24h and emails renewal reminders. `/admin/payments` can
  credit an order manually with a reason (audited).
- **Email**: Resend. Supabase Auth SMTP is configured through Resend (sender
  `soporte@rideperks.app`); app emails (receipt, verification result,
  renewal reminder) go through `lib/email.ts` using `RESEND_API_KEY` /
  `EMAIL_FROM`. The branded password-reset template is
  `supabase/email-templates/recovery.html`, rebuilt in the current identity
  (plain wordmark, JoinCTA-style card, PillLink-style button, manifesto band,
  mono footer; solid hex colors because many mail clients drop `rgba`). The
  repo file doesn't sync: the user pastes it into Supabase → Auth → Emails →
  Templates → Reset Password. As of the last session that paste was pending.
- **Security**: optional Cloudflare Turnstile on registration (active only if
  both keys are set). HSTS on. CSP ships as **report-only** in
  `next.config.mjs`; switch to enforcing after confirming Yappy on
  `/driver/membership` shows no CSP warnings in the browser console.

## Database

Migrations in `supabase/migrations/`, applied manually in order via the SQL
Editor (`node scripts/prepare-supabase.mjs` bundles them into
`artifacts/ACTIVAR_RIDEPERKS.sql`, idempotent). Latest:
`202610130001_business_pins.sql` (business PINs, `redeemed_via`); before it
`202609120001_hardening_and_ops.sql` (admin_paused, catalog_live,
business-owner role check, `rp_business_changes`, payment expiry/credit).
Confirm with the user that it's applied in production before relying on it.
RLS is on everywhere with no anon/authenticated policies; all access goes
through server code with the service-role key.

## Verifying UI without credentials

Don't sign in to verify UI: a `.env.local` exists, but assume it points at
production data. Pattern used repeatedly: create a throwaway route (e.g.
`app/zz-preview/`) that renders the real components with fake data, screenshot
it with a small Playwright script (`artifacts/` is gitignored and holds such
scripts, e.g. `shot-mobile.mjs`, `shot-admin.mjs`), then **delete the route
before committing** and rebuild (stale `.next/types` will otherwise make `tsc`
complain about the deleted route).

- Client components that fetch (the waitlist `AdminDashboard`) can be fed fake
  data with Playwright's `page.route("**/api/admin/entries", …)`.
- `aria-current` depends on the real pathname; in a preview route, set it with
  `page.evaluate` (and wait ~300ms, or the screenshot catches the transition).
- The user reviews on an iPhone: check the iPhone 15 and iPhone SE (320px)
  viewports, light and dark.
- `next dev` shows an "N" / "Issue" badge bottom-left; it's dev-only.

Serving locally: `npm run build && npx next start -p 3100` (or `next dev`).
When restarting, kill whatever still listens on 3100 first (PowerShell:
`Get-NetTCPConnection -LocalPort 3100 -State Listen` → `Stop-Process`),
otherwise the old build keeps being served. A stale server from an earlier
session was found on 3100 once, returning 404 for new routes.

Committing: stage explicit paths, then check `git show --stat HEAD` **before**
pushing. A pathspec for an already-deleted file makes `git add` abort
entirely; that once pushed a commit containing only a deletion, which broke
the share image until a follow-up commit.

## Last session (September 23, 2026)

Mobile polish from the user's iPhone screenshots, all pushed to `main`:
landing InfoCard clipping, bottom nav active pill, mobile header inset
(`497d785`); every `/admin` screen moved to the new identity with
`AdminShell` (`3e72cc7`); new icons, share card, theme colors and recovery
email (`febb7fc` + `758c6af`); transparent round favicon (`8156d10`); Yappy
dialog centered (`00f927d`). The user keeps sending phone screenshots of
things that look off; expect more of that.

## Open items / ideas not done

- Paste the new `recovery.html` into Supabase (by the user).
- Confirm on a real phone that the Yappy payment dialog is centered.
- `public/offline.html` (PWA offline page) still uses the old navy/ember
  colors; the user was told and hasn't asked for it yet.
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
