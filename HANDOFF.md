# RidePerks — Handoff

For whoever (human or AI) picks this up next. **Read this first if you're a
fresh session.** Sections are ordered by how soon you need them:

1. [Rules](#1-rules-read-before-touching-anything) — read before touching anything
2. [Where we are now](#2-where-we-are-now) — current project and next steps
3. [App Store / Play readiness checklist](#3-app-store--google-play-readiness-checklist-pending) — pending work
4. [What RidePerks is](#4-what-rideperks-is) and [architecture](#5-architecture-in-one-page)
5. Reference: brand, web styling, landing, platform features, phone app,
   database, verifying UI, open items, session history

Other docs: `PRODUCTION.md` (deployment and operations, per-month change
notes), `YAPPY.md` (payments), `docs/merchant-access.md` (merchant roles and
access grants), `mobile/README.md` (running the phone app), `PRODUCT.md`
(brand voice only: its colors and waitlist funnel are outdated, see §6).

---

## 1. Rules (read before touching anything)

**Every platform change applies to the web app *and* the phone app**
(user's rule, November 18, 2026). A new feature, screen change, copy or rule
change for drivers or businesses is done on the web *and* in `mobile/` in the
same piece of work, unless the user says otherwise. Shared rules go in
`lib/platform` once; screens are built on both sides. Admin stays web only.
The phone app is one codebase for iOS and Android (EAS builds each);
platform-specific code only when truly needed.

**Git and deploys**
- Several sessions/agents commit straight to `main` in this folder; there are
  no feature branches. Run `git fetch && git log --oneline -10 && git status`
  first.
- Push only when the user asks in *that* conversation. `main` auto-deploys to
  production (Vercel project `ride-perks`, team
  `nicoferraric-icloudcoms-projects`, domain `rideperks.app`). The
  `rideperks` / `rideperks-landing` Vercel projects are unrelated.
- The local Vercel CLI is logged in as `giancoferrari`, which does **not** have
  access to that team, so env vars are set by the user in the dashboard.
- Commit by staging explicit paths, then check `git show --stat HEAD`
  **before** pushing. A pathspec for an already-deleted file makes `git add`
  abort entirely; that once pushed a commit containing only a deletion, which
  broke the share image until a follow-up commit.

**Checks before every commit**
- `npx tsc --noEmit`, `npm run lint`, `npm test` (54 tests at last count,
  most on PGlite), `npm run build`.
- With a server on :3100 (or `TEST_BASE_URL`): `npx playwright test` (15
  public e2e tests, including `tests/e2e/app-api.spec.ts`).
- If `mobile/` changed: `cd mobile && npx tsc --noEmit && npx expo lint`.

**Data and database**
- Never sign in to verify things: `.env.local` (repo root) may point at
  production data. Use fake-data previews (§12). The user signs in with test
  accounts themself.
- A new migration must be applied in production (by the user, SQL Editor)
  **before** the code that uses it is pushed. Confirm with the user.

**Language and frameworks**
- The user writes in Spanish (Latin American, **tuteo, never voseo**). All UI
  copy is Spanish with tuteo. This file stays in English.
- `AGENTS.md`: this Next.js (16) has breaking changes vs. training data
  (middleware is `proxy.ts`); check `node_modules/next/dist/docs/`.
- `mobile/AGENTS.md`: Expo changes every SDK; read the versioned docs for
  SDK 58 and install packages with `npx expo install`.

---

## 2. Where we are now

As of November 18, 2026 the current project is **the native phone app**
(iOS + Android, React Native with Expo, in `mobile/`). Details in §10.

- **Done and pushed** (`6d3777f`): every driver and business screen of the
  web, rebuilt natively, on the same backend through `/api/app/*`. The user
  tried it on their iPhone with Expo Go and said it looks right; the only
  fix asked for was removing the dock's dark glow (done).
- **Done, not pushed** (November 20): sign-up, password recovery and the
  welcome screens inside the app (§10).
- **Not tested for real yet:** a Yappy payment from the app, scanning a QR
  between two phones, uploads (verification, logo/photos), the CSV share
  sheet on a device, and creating a real new account from the app (only
  tested with simulated server answers, since local dev uses the production
  database).
- **Next, in this order:**
  1. **Accounts (user).** Apple Developer ($99/yr), Google Play ($25) and the
     company's D-U-N-S (Apple needs it to enroll as an organization). Plan:
     the user's brother may hold the Apple Developer account and invite the
     user (Admin role in App Store Connect); EAS then builds and submits from
     this PC. Ask whether accounts are ready before building.
  2. **Code work for store approval** — the AI items in §3, all doable
     before the accounts exist.
  3. **EAS.** `npx eas-cli@latest login` (Expo account `giancoferrari`,
     already signed in on this PC), `eas init`, an `eas.json` with
     development / preview / production profiles, then builds for TestFlight
     and Play internal testing. Also set up **EAS Update** (`expo-updates`,
     not installed yet) so JS-only changes reach phones without a store
     release; native changes (new native package, permission, icon) still
     need a new store build.
  4. **Store listings and submission** (§3), both stores together.
- **How the user tests:** `npm run dev` in the repo root (port 3000) plus
  `npx expo start` in `mobile/`, then Expo Go on the iPhone (same Wi-Fi).
  The AI can start both in the user's Terminal panel; the computer's Expo
  CLI is signed in as `giancoferrari` (required by Expo Go on iOS).
  `.claude/launch.json` also has preview configs: `rideperks-dev-3000`,
  `rideperks-prod-3200`, `rideperks-mobile-web` (Expo web on 8081).

---

## 3. App Store / Google Play readiness checklist (pending)

Agreed with the user on November 18, 2026 to avoid an Apple rejection. **None
of it is done yet.** Ordered by rejection risk. Tick items off here as they
land.

### High risk (most likely rejection causes)

- [ ] **Yappy membership vs. in-app purchase (guideline 3.1).** Apple requires
  IAP for digital goods; the exception 3.1.3(e) covers services consumed in
  the real world, which is RidePerks (discounts used at gas stations,
  workshops, restaurants). *AI:* make the Membresía screen say plainly that
  it's access to discounts at physical businesses. *Both:* explain it in the
  review notes. **Plan B** if rejected: the iOS app shows membership status
  but payment happens on the web.
- [ ] **Catalog must be live (guideline 2.1, incomplete app).** With
  `rp_settings.catalog_live = false` the reviewer sees "Próximamente" in
  Beneficios and Comercios and rejects. *User:* real approved benefits, then
  Más → Catálogo on. (The "map coming soon" placeholder is gone: the real
  map replaced it on November 20, 2026, and it only shows once a business
  has a point.)
- [ ] **Google Maps key for Android.** The app's map (`react-native-maps`)
  works in Expo Go, but an Android store build needs a Google Maps API key
  (`android.config.googleMaps.apiKey` in `mobile/app.json`). *User:* create
  it in Google Cloud (Maps SDK for Android). iOS uses Apple Maps, no key.
- [ ] **Demo accounts for the reviewer.** *User* creates them in production:
  a verified driver with an active membership (the reviewer won't pay or
  verify), a business owner, and a test PIN. They go in App Store Connect.
- [x] **Registration and password recovery inside the app** (November 20,
  2026). `mobile/src/app/register.tsx` (driver and business owner, terms and
  privacy policy linked), `recover.tsx` and the driver welcome screens
  `welcome.tsx`. Same rules as the web through `lib/platform/signup-core.ts`.
  Not yet tried on a real phone with a real new account (§2).
- [ ] **Guideline 4.2 (not just a website).** Camera, haptics, keychain and
  PDF printing already exist. *AI:* add **push notifications**
  (`expo-notifications`, a device-token table + migration, send from the
  places that create `rp_notifications`, i.e. the DB triggers and
  announcements). Deep links / universal links for `rideperks.app` help too.

### Technical requirements

- [ ] **1024×1024 icon, no transparency.** `mobile/assets/images/icon.png` is
  512 px (RGB, no alpha: good). *User* supplies the 1024 px original (icons
  are only ever resized from the user's images, never redrawn); *AI* wires
  it plus store assets.
- [ ] **Photos permission text.** The `expo-image-picker` string in
  `mobile/app.json` only mentions the driver's verification screenshot, but
  businesses also pick logo/photos. *AI:* cover both uses (Apple requires
  accurate purpose strings).
- [ ] **Export compliance.** *AI:* add
  `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` to `app.json` (HTTPS
  only) so each build skips the encryption question.
- [ ] **Privacy.** Policy already linked in Cuenta (driver and business);
  add it to the sign-up screen. *User* fills App Store privacy labels
  (name, email, phone, verification photo, purchase history, ratings/
  comments; no tracking, so no ATT prompt). Check the build's privacy
  manifest (Expo modules ship theirs).
- [x] Already compliant: in-app account deletion (driver and business);
  Sign in with Apple not required (email/password only); ratings aren't
  public, so no user-generated-content moderation rules apply; offline
  screen exists.

### Store listing (user, with AI drafting)

- [ ] **Third-party trademarks (guideline 5.2).** No "Uber", "InDrive" or
  "PedidosYa" in the app name, subtitle or keywords. Description: "conductores
  de apps de transporte y delivery" plus "No afiliado a Uber, InDrive ni
  PedidosYa".
- [ ] Real iPhone 6.9" screenshots with coherent demo data; support URL,
  privacy URL, age rating, category Lifestyle (Estilo de vida); no mention of
  Android in iOS metadata.
- [ ] **Review notes** (*AI* drafts): what Yappy is and why the membership is
  a real-world service, the demo accounts, how to test the scanner (QR on the
  driver account, or type the code), how the staff PIN mode works.

### Google Play (same codebase)

- [ ] Data safety form (mirror of Apple's labels), account-deletion URL
  (`https://rideperks.app/account/delete`), content rating.
- [ ] If the Play account is a *personal* one, Google requires a closed test
  with 12+ testers for 14 days before production; an *organization* account
  (D-U-N-S) avoids it.

---

## 4. What RidePerks is

A benefits club for gig drivers (Uber, InDrive, PedidosYa) in Panama. It
negotiates real discounts with local businesses (fuel, food, maintenance,
health) so a driver's existing spending goes further. Three-sided platform:
drivers redeem benefits, businesses honor them, and RidePerks runs a paid
membership on top: $15/month, or $150 once for 12 months (annual plan, "2
meses gratis"), both via Yappy with manual renewal.

---

## 5. Architecture in one page

- **Web:** Next.js 16 (App Router, `proxy.ts` as middleware) on Vercel.
  Supabase for auth, Postgres and storage. RLS is on everywhere with no
  anon/authenticated policies; all access goes through server code with the
  service-role key. Email via Resend. Daily Vercel cron.
- **Phone app:** Expo SDK 58 + Expo Router in `mobile/`, one codebase for
  iOS and Android.
- **One backend, two entrances.** The web reads and writes through server
  components and server actions with a cookie session. The app calls
  `/api/app/*` (JSON) with `Authorization: Bearer <Supabase access token>`.
  `sessionUserId()` in `lib/platform/supabase.ts` accepts either, so
  `currentProfile()` and every function in `lib/platform` serve both. Admin
  changes (announcements, approvals, catalog switch) land in the same
  database, so both apps see them; the app refetches when a screen comes
  into focus and on pull-to-refresh.
- **Repo map:**
  - `app/` — web routes: landing (`/`, `/about`), auth screens, `/driver/*`,
    `/business/(portal)/*`, `/pin`, `/account/*`, `/admin/*`, `/api/*`
    (`/api/app/*` is the phone app's API).
  - `lib/platform/` — business rules shared by web and app (data, actions,
    loaders, counter, codes, catalog, hours…). `lib/payments/` — Yappy and
    membership.
  - `components/` — `landing/`, `sections/` (landing sections), `platform/`
    (driver/business/admin views), `ui/` (shared primitives).
  - `supabase/migrations/` — SQL, applied by hand (§11).
  - `tests/` — `*.test.mjs` (node:test, PGlite), `e2e/` (public Playwright),
    `live/` (need real data and `catalog_live = true`).
  - `mobile/` — the phone app (§10).
  - `artifacts/` — gitignored helper scripts and screenshots, only on this PC.

---

## 6. Brand identity (current since September 2026)

Chosen after trying several palettes. **Monochrome base + one green action
color. No orange (ember), no italics, no serif accent word** — the user
explicitly removed all of them. Minimal copy on the landing; "Nosotros" is the
one page with long-form text.

| Role | Color |
| --- | --- |
| Pitch black (text, dark bands) | `#100B00` |
| Yellow green (landing only: buttons, active states) | `#85CB33` |
| Frosted mint (soft surface: landing cards, pricing) | `#EFFFC8` |
| Dark khaki (dark-mode bands, secondary surfaces) | `#3B341F` |
| Ash grey `#A5CBC3` | Part of the palette but **intentionally unused**; the user asked to avoid it |

**White backgrounds since November 20, 2026**: the landing and every
sign-in screen (web and app) moved from mint to white at the user's request.
Mint stays as the soft surface for cards. The landing's look now comes from
the footer the user supplied: **giant outlined type** (`.lp-outline`,
`.lp-outline-strong`) and **yellow-green or black panels with a fluted-glass
shader** (`components/ui/fluted-glass-backdrop.tsx`).

Font: Geist (`next/font`; `@expo-google-fonts/geist` in the app), wordmark
"RIDEPERKS" as plain text (no pill) via `<LogoMark variant="text" />`.

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

Motion follows Emil Kowalski's guidance (`/emil-design-eng` skill): buttons
scale to 0.97 on press in 160ms with `ease-snappy`
(`cubic-bezier(0.23,1,0.32,1)`); on-screen movement uses `ease-move`; panels
use `ease-drawer`; hover effects only on pointer devices; UI animations stay
under 300ms; `prefers-reduced-motion` disables motion. Curves are Tailwind
tokens in `app/globals.css`. The app mirrors them (`PressScale`, `Enter`).

---

## 7. Web: three styling systems (don't cross them by accident)

1. **Landing** (`/`, `/about`) — Tailwind + CSS variables `--lp-*` scoped to
   `.lp` (see `components/landing/LandingShell.tsx`). **Light only** (the
   user removed the theme switcher and the dark/dim themes on November 11,
   2026). `ThemeSync` sets `html[data-lp-theme="light"]` (white body
   background for overscroll) and removes it when leaving the landing.
   Tokens live in `app/globals.css`; use `bg-lp-bg`, `text-lp-fg`,
   `bg-lp-accent`, etc.
2. **Auth screens** (`/login`, `/register`, `/recover`, business login/register,
   `/admin/login`, the `/pin` entry) — `components/ui/sign-in.tsx` `AuthShell`
   with class `.rp-auth`, which re-points the shadcn-style Tailwind tokens to
   a white background (mint until November 20, 2026, changed at the user's
   request; the app's `auth` tokens match), with black buttons (no green).
   Their legacy controls (`.rp-field`, `.rp-button`, `.rp-access-switch`…)
   live in `app/auth.css`, every rule scoped to `.rp-auth`. Otherwise **the
   user asked to leave these screens as they are.**
3. **Platform** (`/driver/*`, `/business/*`, `/pin` scanner,
   `/account/password`, all signed-in `/admin/*`, `/privacidad`, `/terminos`)
   — redesigned October 2026 in the spirit of Uber/Airbnb: **white
   background, soft gray cards with no borders, one big number or title per
   screen, few icons, monochrome base**, black hero card for the key number.
   Actions (buttons) are black in light mode, white in dark mode. **Soft
   green accents** (tokens `--rp-green-soft/-text/-line/-fill` in
   `platform.css`) only for what is positive: savings amounts, success
   badges/messages, progress bars, confirmation checks, avatar, category
   icons, numbered steps and the dock's active-tab bar. **Never on buttons.**
   Plain CSS in `app/platform.css`, every rule scoped to `.rp-app` (CSS stays
   loaded across client navigation, so unscoped rules would leak into the
   auth screens). **Class names are the platform's API** — restyle there,
   don't rename. Dark mode = black (`#100B00`) with white text, chosen only
   in Cuenta → Apariencia (`ThemeSetting` in `components/platform/theme.tsx`;
   `localStorage` `rp_app_theme`; default light, the OS preference is
   ignored on purpose). No theme toggle in headers.
   - **Buttons**: `components/ui/button.tsx` (Base UI, supplied by the user)
     for every platform/admin button; it defaults to `type="button"`, so form
     submits need `type="submit"`. Links styled as buttons use
     `buttonVariants()` from `components/ui/button-variants.ts` (a plain
     module, callable from server components). Colors come from `--primary`,
     `--muted`, `--border`… set on `.rp-app`; inside gray cards `--muted`
     switches to white so secondary buttons stay visible.
   - **Navigation**: `components/ui/spotlight-dock.tsx`, a floating dock
     (icon + label, spotlight + sliding bar on the active tab): **light in
     light mode, dark in dark mode** (`--rp-dock*` tokens). **Max four
     tabs.** Driver: Inicio · Beneficios (Comercios is a segmented tab
     inside) · Actividad · Cuenta. Business: Escanear · Actividad ·
     Beneficios · Cuenta (staff only get Escanear · Cuenta); the portal
     lives in the route group `app/business/(portal)/`. Admin: Plataforma ·
     Revisiones · Pagos · Más (`/admin/more`). Dock items are defined in
     client components (icons can't cross the server→client boundary as
     props).
   - Sub-pages use `SubHeader` (round back button + centered title, which is
     the page's `h1`); big titles under it are `h2.rp-title`. Settings rows
     use `.rp-menu` + `MenuLink`; longer content opens in place with
     `<details>`.
   - Screens are presentational views fed by thin pages:
     `components/platform/driver/views.tsx`, `driver/account-views.tsx`,
     `business/views.tsx`, `BusinessMetrics` and `BusinessBenefits`. That is
     what makes fake-data preview routes cheap (§12).
   - `money()` shows `$10.50` and `dateLabel()` `19 oct 2026`.
   - **Speed (the user wants app-like, instant taps on low-end phones)**:
     the dock lights the tapped tab immediately (optimistic state); every
     section has a `loading.tsx` skeleton (`LoadingBlocks`; admin ones render
     inside `AdminShell` so the dock stays); `experimental.staleTimes.dynamic
     = 30` keeps visited tabs in the client cache (server actions'
     `revalidatePath` still refreshes them); `proxy.ts` and
     `currentProfile()` verify the session with `auth.getClaims()` (local
     ES256 check, no Supabase Auth round trip) and `currentProfile()` treats
     `closed_at` accounts as signed out. Animations are transform/opacity
     only. Judge speed on a production build, not `next dev`.
   - `.rp-app * { min-width: 0 }` lets flex children shrink below their text.

---

## 8. Landing

`app/page.tsx`: Nav, Hero (the app's home screen in a phone, two floating
cards, and a giant outlined "RIDEPERKS" behind the phone from 640px up),
Benefits (mint cards; "¿Tienes un comercio?" is a green fluted panel),
HowItWorks (big outlined step numbers), AppShowcase (`#app`, four real
screens, outlined numbers), SavingsBand (black band with fluted glass),
Manifesto (first line outlined), Pricing (the Membresía card has fluted
glass), Footer, MobileCTA. **No loading animation**: the splash screen was
removed on November 20, 2026 at the user's request (the marquee and hero tag
went in `170c20e`; JoinCTA was folded into the footer).

- **Footer** (`components/ui/footer-section-5.tsx`, adapted from the
  21st.dev component the user supplied; `components/sections/Footer.tsx`
  passes the contact address): giant outlined "RIDEPERKS" sinking into a
  yellow-green panel with the fluted-glass shader. The panel holds the last
  call to action (`#unete`, which MobileCTA watches), **"Contáctanos"**
  (`mailto:` `SUPPORT_EMAIL`, falling back to `soporte@rideperks.app`),
  Instagram and the link columns. Used by `/` and `/about`.
- **Fluted glass** (`@paper-design/shaders-react` `FlutedGlass`): static
  WebGL, loaded only near the screen, pixel count capped. It's on four
  panels (business band, SavingsBand, Membresía card, footer); don't add
  many more, each one is a WebGL context.

- **App screenshots**: `public/landing/app-*.png` (1170×2532, supplied by the
  user), shown with `components/landing/PhoneFrame.tsx`. The businesses and
  amounts in them are examples; AppShowcase says so in a note under the
  screens. Keep that note if the screens change.
- **Pricing** (`components/ui/pricing-section.tsx`, adapted from a 21st.dev
  component the user supplied): Mensual/Anual switch, NumberFlow price, two
  plans (Gratis, Membresía). Helpers `ui/card`, `ui/vertical-cut-reveal`,
  `ui/timeline-animation` use `framer-motion` and render statically with
  reduced motion. "¿Ya tienes cuenta?" links to
  `/driver/membership?plan=monthly|annual`, which preselects the plan.
- `components/Nav.tsx` (client): logo, pill nav whose shaded indicator slides
  to the clicked link (plus scroll-spy on `/`), "Comercios", "Iniciar
  sesión". Once the page scrolls the header becomes a glass tab (`.lp-tab`).
- `components/landing/InfoCard.tsx`: card with icon + title; tapping slides
  up a detail panel. Used by Benefits (links to
  `/driver/benefits?category=…`) and HowItWorks. Icons must be passed as
  rendered elements. Front and panel share one grid cell, so the card is as
  tall as the longer of the two.
- `components/landing/PillLink.tsx`: the one CTA shape (pill + arrow circle).
- The funnel is **create account**, not the waitlist. `Waitlist.tsx`,
  `WaitlistForm.tsx`, `Counter.tsx` are unused but kept; `/api/waitlist`
  still works.
- `/about` has the long-form content: what RidePerks is, drivers vs.
  businesses (`AboutAudiences`), how a redemption works, the four areas, FAQ.

---

## 9. Platform features (web; the app mirrors driver and business)

### Driver
- Register/login (no email confirmation, a launch decision), dashboard with
  month/total savings, verification by photo upload (admin-reviewed; the
  photo is deleted after review), membership (Yappy), history, directory,
  profile, help.
- **Setup checklist** on Inicio (`components/ui/setup-progress.tsx`, on Base
  UI's Progress) until every step is done: cuenta, perfil, verificación ("En
  revisión" while pending), membresía, primer beneficio. Steps come from
  `driverSetupSteps()` (`lib/platform/driver-rules.ts`). Server component:
  never pass functions to `Progress` (client).
- **Welcome**: new drivers (`rp_profiles.onboarded_at` null) are sent from
  Inicio to `/driver/welcome` (3 steps, dock hidden).
- **Favorites**: `rp_favorite_benefits` / `rp_favorite_businesses`, heart on
  the benefit detail and each business card; "Favoritos" filter chip.
- **Search and filters**: Beneficios and Comercios take `?q=`, `category`,
  `open=1`, `saved=1` (filtered on the server, accent-insensitive;
  `lib/platform/catalog.ts`). No distance filter: that needs a real map.
- **Feedback**: after a use, Actividad offers "Calificar este uso" (stars,
  was it applied, comment) for 30 days, once (`rp_leave_feedback`).
- **Receipts**: `/driver/membership/receipt/[id]` for paid orders, printable.
  Not a fiscal invoice (says so).
- **Business map** (November 20, 2026): Beneficios → Comercios shows a map
  of Panama City (`components/platform/map/`) with a pin and name label per
  business; a pin scrolls to and flashes that business's card. Built on the
  user-supplied mapcn component (`components/ui/mapcn-marker-label.tsx`,
  MapLibre GL) with **OpenFreeMap** tiles (free, no key, commercial use OK;
  CARTO's free tier isn't). Hidden until at least one business has a point.
  Kept fast: lazy-loaded, locked to Panama City (`lib/platform/map-area.ts`),
  no rotation/pitch, pixel ratio ≤ 2, two-finger panning on touch screens
  (measured steady 60 fps while panning). MapLibre's worker is set with
  `setWorkerUrl(new URL(..., import.meta.url))` because the bundler doesn't
  place it next to the module. The admin places each business in its editor
  (`LocationPicker`: tap or drag the pin, "Quitar ubicación"); `saveBusiness`
  writes `latitude`/`longitude` after `rp_save_business`. "Cómo llegar" uses
  the exact point when there is one. CSP allows `tiles.openfreemap.org`.

### Business
- Scanner (preview then confirm), staff invites, benefit proposals reviewed
  in `/admin/reviews`, name/address/category changes also reviewed
  (`rp_business_changes`), stats, help form. A benefit paused by an admin
  (`admin_paused`) can't be reactivated by the merchant.
- **Hours, logo, photos**: `rp_businesses.hours` (7 days from domingo, each
  null or ["HH:MM","HH:MM"]; `lib/platform/hours.ts` computes open-now in
  Panama time, overnight and 24h), `logo_path`, `photo_paths` (≤6) in the
  **public** bucket `rp-business-media` (2 MB). Owners edit them in Cuenta;
  they publish without review.
- **Charts and CSV**: Actividad shows a column chart
  (`components/platform/BarChart.tsx`, plain CSS) and downloads
  `/business/activity/export?period=` (CSV with BOM, formula cells
  neutralized, no driver names; `lib/platform/business-csv.ts`). Owners see
  rating average and "no se aplicó" count.
- **PIN (scan without an account)**: sign-in has a third tab, PIN (`/pin`),
  for on-site staff. They type the business's 6–8 digit PIN, the camera
  opens, and a scan registers the use at once (`redeemed_via = 'pin'`,
  `redeemed_by` null; history shows "Confirmado con PIN"). Admins **type**
  each PIN in `/admin/platform` → Comercios → Editar comercio; the app never
  generates one. Only an HMAC of the PIN is stored (key:
  `ADMIN_SESSION_SECRET`, so rotating it invalidates every PIN). The device
  gets a signed 12h `rp_pin` cookie carrying `pin_version`; changing/removing
  the PIN or pausing the business signs out every device. Logic in
  `lib/pinAuth.ts`, `lib/platform/pin-actions.ts`, `lib/platform/counter.ts`,
  `app/api/pin/redeem`, `rp_redeem_token_pin`. Rate limits: 10 PIN attempts
  per IP and 200 overall per 10 min.

### Shared
- **Notifications**: `rp_notifications`, written by **database triggers**
  (redemption → driver, payment paid → driver, verification reviewed →
  driver, benefit revision / business change reviewed → the proposing
  merchant) and by announcements. Bell with unread count on Inicio and the
  business Escanear screen; opening the list marks all read. **No push or
  email for these yet** (push is in §3).
- **Delete account**: `/account/delete` (drivers and businesses) asks for the
  password, then runs the same closure as the admin
  (`lib/platform/account-closure.ts`): login banned, personal data,
  favorites, notifications and feedback comments erased, history kept.
- **Catalog is hidden**: `rp_settings.catalog_live = false`. Drivers see
  "Próximamente" in Beneficios/Comercios and benefit detail 404s. Toggle in
  `/admin/more` (Más → Catálogo) once approved benefits exist. Live e2e tests
  (`tests/live/*`) need it `true`. **Must be on before store review** (§3).
- Hardening: driver/business queries select explicit business columns
  (`BUSINESS_PUBLIC` in `data.ts`), so `pin_hash` never reaches a browser.

### Admin (web only)
- `/admin` redirects to `/admin/platform` (`PlatformView.tsx`): count tiles
  that double as tabs (Verificaciones, Ayuda, Cuentas, Comercios,
  Beneficios; red dot when something waits), compact rows, actions folded
  into "Acciones". Also `/admin/reviews`, `/admin/payments`,
  `/admin/metrics` (`rp_admin_metrics()`), `/admin/announcements`
  (`rp_send_announcement` fans out one notification per non-closed account
  of the audience), `/admin/more` (access, catalog, appearance, logout).
- Shared `ADMIN_PASSWORD` cookie for `/admin/*`, plus a personal identity in
  `rp_admin_users` (self-enroll at `/admin/access`) required for access
  grants, reviews, announcements and manual payment credit. As of the last
  check nobody had enrolled; remind the user.

### Payments
- `free_access = false` (billing live). Two plans
  (`rp_payment_orders.plan`): `monthly` $15.00 → 1 month, `annual` $150.00 →
  12 months, one payment, no auto-renewal. Amounts are fixed per plan by a
  DB check and by `PLANS` in `lib/payments/yappy-protocol.ts`;
  `rp_create_payment` takes `p_plan` (defaults to monthly). 7-day renewal
  window for both. Shared logic: `lib/payments/membership.ts`.
- The web checkout (`YappyCheckout`) has a plan picker. Yappy's `<btn-yappy>`
  is an Angular element **without shadow DOM**, so global CSS reaches its
  markup; `platform.css` restores `btn-yappy dialog { margin: auto }`. The
  dialog only exists during a real payment, so test layout with a replica.
- Daily cron `/api/cron/daily` (`vercel.json`, needs `CRON_SECRET`) expires
  pending orders older than 24h and emails renewal reminders.
  `/admin/payments` can credit an order manually with a reason (audited).

### Email and security
- **Email**: Resend. Supabase Auth SMTP goes through Resend (sender
  `soporte@rideperks.app`); app emails (receipt, verification result, renewal
  reminder) use `lib/email.ts` (`RESEND_API_KEY` / `EMAIL_FROM`). The branded
  reset template `supabase/email-templates/recovery.html` doesn't sync: the
  user pastes it into Supabase → Auth → Emails → Reset Password (pending).
- **Security**: optional Cloudflare Turnstile on registration (active only
  if both keys are set). HSTS on. CSP ships as **report-only** in
  `next.config.mjs`; enforce it after confirming Yappy on
  `/driver/membership` shows no CSP warnings.

---

## 10. Phone app (iOS + Android, `mobile/`)

Decided November 18, 2026: native store apps with **React Native (Expo SDK
58, Expo Router)**, alongside the web, which keeps working as is. The user
ruled out Capacitor (a web view inside an app). Same backend, same look.

- **API.** `/api/app/*` routes are thin wrappers built with `appRoute()`
  (`lib/platform/app-api.ts`: JSON, no-store, 401 means "sign in again"; dev
  CORS only for Expo web on :8081). Web form actions are reused through
  `runAction()` (owner refusals map to 403). Sign-in rules are shared through
  `lib/platform/login-core.ts` and sign-up rules (`createAccount`,
  `markOnboarded`) through `lib/platform/signup-core.ts`, both kept out of
  "use server" files on purpose. `appSession()` builds the tokens + profile
  answer for login and register.
- **Endpoints:** auth: `POST auth/login` (same checks as the web, returns
  tokens), `auth/register` (driver or business owner; returns tokens like
  login), `auth/recover` (same email as the web; the link opens the web to
  pick the new password), `auth/refresh`, `auth/logout` (revokes only that
  phone's session); `GET me`; driver: `onboarding` (POST, welcome seen),
  `home`, `benefits`, `benefits/[id]`,
  `directory`, `history`, `account`, `favorites`, `feedback`, `codes`
  (POST), `codes/[token]`, `profile`, `verification` (GET, multipart POST),
  `support`, `membership`, `membership/pay`, `receipts/[id]`;
  `notifications`, `notifications/read`; `account/password`,
  `account/delete`; business: `home`, `preview`, `redeem`, `activity`,
  `export`, `benefits`, `benefits/save`, `benefits/toggle`, `manage`, `info`,
  `hours`, `media`, `media/remove`, `staff/invite`, `staff/remove`,
  `support`; staff PIN: `pin/session`, `pin/redeem`.
- **Client.** `mobile/src/lib/api.ts` adds the token, renews it shortly
  before it expires (or once after a 401), and sends `X-RP-Business` (chosen
  business, read by `requireBusiness`) and `X-RP-Pin` (staff PIN session,
  `pinBusinessFrom` in data.ts). Tokens live in the keychain/keystore
  (`expo-secure-store`, `tokens-store.ts`). `use-api.ts` shows cached data
  and refetches on screen focus and pull-to-refresh. Notification links and
  setup steps arrive as web paths; `mobile/src/lib/routes.ts` maps them.
- **Shared server code:** `lib/platform/driver-screens.ts` (driver screen
  loaders for web pages and `/api/app/driver/*`), `driver-rules.ts`,
  `codes.ts` (QR codes), `counter.ts` (preview, redeem, PIN redeem, PIN
  check), `business-screens.ts` (Actividad, `loadBusinessBenefits`),
  `self-service.ts` (password, `closeOwnAccount`),
  `lib/payments/membership.ts`.
- **Same look:** `mobile/src/theme/tokens.ts` copies the web's colors
  (`.rp-app` light/dark and `.rp-auth`). `tests/mobile-tokens.test.mjs` fails
  if they drift, so change a color in both places. Font Geist, icons
  `lucide-react-native`, `PressScale` and `Enter` mirror the web's motion.
- **Driver screens:** sign-in (driver/business/PIN tabs); the floating dock
  (`Dock.tsx`, sliding green bar, no spotlight glow: it showed as a dark
  smudge on iOS); Inicio (checklist, savings card, featured rail, recent
  uses); Beneficios with Comercios; benefit detail with the one-time QR
  (keeps the screen awake, polls for "used", copy code); Actividad with
  ratings; Notificaciones; Cuenta (Claro/Oscuro) and `src/app/settings/`:
  Datos personales, Membresía (plan picker, Yappy number, consent,
  payments), recibo (`receipt/[id]`, PDF via expo-print), Verificación
  (shrinks the screenshot to 1600px JPEG, multipart upload), Ayuda,
  Contraseña, Eliminar cuenta.
- **Business map:** `src/components/platform/BusinessMap.tsx` above the
  Comercios list (Apple Maps on iPhone, Google Maps on Android, via
  `react-native-maps`, which works in Expo Go). Pins drawn once
  (`tracksViewChanges` off); the bubble opens directions. Android locks the
  camera to Panama City; `BusinessMap.web.tsx` hides it in the Expo web
  preview (no web version). Needs a store build (native module) and, for
  Android, a Google Maps key (§3).
- **Sign-up and welcome:** `register.tsx` (Conductor/Comercio switch without
  PIN, platform as pills, terms checkbox; `?audience=business` from the
  login's Comercio tab) and `recover.tsx`, both signed-out only. A new
  driver (`onboarded_at` null) is sent by `(tabs)/_layout.tsx` to
  `welcome.tsx` (3 steps like the web's `/driver/welcome`); Saltar or the
  last button POST `driver/onboarding`, so the web won't show it again
  either. The last button opens Verificación. **No Turnstile in the app**
  (a native app can't show it): instead `auth/register` allows 10 accounts
  per IP per hour (`app-signup-ip:`), plus the usual sign-in limits. Mobile
  carriers share IPs, so raise it if real sign-ups get blocked.
- **Business screens (`src/app/business/`, `src/app/manage/`):** owners get
  Escanear, Actividad, Beneficios, Cuenta; staff get Escanear, Cuenta.
  Escanear uses expo-camera (QR only) plus the typed-code field, then
  preview → confirm. Actividad: periods, metrics, chart (bars computed on
  the server), ratings, last uses, CSV (expo-file-system + expo-sharing).
  Beneficios: create, edit, pause/activate, propose changes (dates typed
  AAAA-MM-DD). Manage: info, hours, logo and photos, staff (invite link,
  remove). Cuenta: business switcher, Apariencia, Contraseña,
  Notificaciones, Escríbenos, sign out, delete.
- **Staff PIN:** `/api/app/pin/session` checks the PIN (same limits as the
  web) and returns the same signed session the web keeps in its cookie; the
  phone stores it and sends `X-RP-Pin`. A changed PIN sends the phone back
  to sign-in.
- **Yappy in the app:** the request goes to the driver's Yappy app from the
  server (`payment-wc` with `aliasYappy`), and only the IPN marks it paid.
  The app calls `membership/pay` (same `startPayment` as the web) and polls
  `membership` every 4 s while pending. Inferred from Yappy's script, **not
  yet confirmed with a real payment**; check it on the first one.
- Detail screens (benefit, notifications) hide the dock and slide in; on the
  web the dock stays visible there.
- **Updates:** one codebase; EAS builds the iOS and Android binaries
  separately. JS-only changes can go out with EAS Update (to set up); native
  changes need a new store build on both stores.
- **Backend URL:** in development the app talks to `npm run dev` on port 3000
  of the same computer, so `/api/app` changes don't need a deploy. Store
  builds use `https://rideperks.app`, so the API must be pushed before them
  (and must stay compatible with older app versions people haven't updated).
  Override with `mobile/.env.local` (`EXPO_PUBLIC_API_URL` or
  `EXPO_PUBLIC_API_PORT`).
- **Identifiers:** bundle id / package `app.rideperks`, scheme `rideperks`.
  The bundle id can't change once published. `supportsTablet: false`.
- **Previewing without an account:** `artifacts/mobile-screens.mjs <dir>
  [--dark | --settings]` (driver) and `artifacts/mobile-business.mjs <dir>`
  (business, PIN) drive Expo web (:8081) with every `/api/app` call faked.
  The in-app browser pane may be hidden (animations freeze there), so use
  these headless scripts for screenshots.
- The user can borrow a Mac, but EAS builds both apps in the cloud from
  Windows; the Mac is only for the iOS simulator.

---

## 11. Database

Migrations in `supabase/migrations/`, applied manually in order via the SQL
Editor (`node scripts/prepare-supabase.mjs` bundles them into
`artifacts/ACTIVAR_RIDEPERKS.sql`, idempotent). **All are applied in
production** (latest confirmed by the user on November 20, 2026):

| Migration | What |
| --- | --- |
| `202611200001_business_location.sql` | `latitude`/`longitude` on `rp_businesses` (both or neither, inside Panama); applied November 20, 2026 |
| `202611110001_annual_plan.sql` | annual plan; 4-argument `rp_create_payment` whose plan defaults to monthly |
| `202610200001_app_features.sql` | notifications, announcements, favorites, hours/media, feedback, onboarding, admin metrics |
| `202610130001_business_pins.sql` | business PINs, `redeemed_via` |
| `202609120001_hardening_and_ops.sql` | admin_paused, catalog_live, owner role check, `rp_business_changes`, payment expiry/credit |
| earlier `202609*` | driver platform, waitlist privacy, QR short codes, Yappy, merchant roles, access/review, profile closure |

Push notifications (§3) will need a new migration (device tokens); apply it
in production before pushing the code.

---

## 12. Verifying UI without credentials

Don't sign in to verify UI. Pattern used repeatedly: create a throwaway route
(e.g. `app/zz-preview/`) that renders the real components with fake data,
screenshot it with a small Playwright script (`artifacts/` holds such
scripts, e.g. `shot-mobile.mjs`, `shot-admin.mjs`), then **delete the route
before committing** and rebuild (stale `.next/types` makes `tsc` complain
about the deleted route). For the phone app use the scripts in §10.

- Client components that fetch can be fed fake data with Playwright's
  `page.route(...)`.
- `aria-current` depends on the real pathname; in a preview route, set it with
  `page.evaluate` (and wait ~300ms, or the screenshot catches the transition).
- The user reviews on an iPhone: check the iPhone 15 and iPhone SE (320px)
  viewports, light and dark.
- `next dev` shows an "N" / "Issue" badge bottom-left; it's dev-only.

Serving locally: `npm run build && npx next start -p 3100` (or `next dev`).
When restarting, kill whatever still listens on 3100 first (PowerShell:
`Get-NetTCPConnection -LocalPort 3100 -State Listen` → `Stop-Process`),
otherwise the old build keeps being served.

---

## 13. Open items

**Phone app:** everything in §2 and §3.

**By the user (one-time):**
- Paste the new `recovery.html` into Supabase.
- Enroll in `rp_admin_users` (`/admin/access`).
- Turn on `catalog_live` once there are approved benefits.

**Checks and small fixes:**
- Real-device checks: QR scanning between two phones, Yappy payment (web
  dialog centered, and the app's polling flow), uploads, CSV share sheet,
  PWA install.
- Enforce the CSP (§9).
- Confirm the "Contáctanos" inbox receives mail (`SUPPORT_EMAIL` on Vercel,
  else `soporte@rideperks.app`, which today is a Resend sender address).
- `public/offline.html` (PWA offline page) still uses the old navy/ember
  colors; the user was told and hasn't asked for it yet.
- `PRODUCT.md` and `README.md` still describe the old navy/ember identity and
  waitlist-first funnel; update them if they matter to the next task.

**Ideas pending by the user's choice (October 20, 2026)**, in order of
interest: the driver's own location on the map ("cerca de ti", distance
filter; the businesses already have lat/lng since November 20); verifying email or WhatsApp
with a one-time code; monthly savings summary (email/push); sound or
notification for merchants when a use is registered; per-person admin
accounts with 2FA replacing the shared password; Sentry; usage analytics
(PostHog/Plausible; if added to the app, nothing that counts as tracking,
or Apple requires the ATT prompt).

**Dropped for now (user decision):** Google/Apple sign-in, referrals,
staging environment, offline mode.

---

## 14. Session history

- **November 20, 2026 (later)** — Landing redesign around the footer the
  user supplied (white background, outlined type, fluted-glass panels,
  contact button), splash removed, sign-in screens white (web and app),
  and the business map (web MapLibre + OpenFreeMap, app react-native-maps,
  admin location picker, migration `202611200001`, applied in production).
- **November 20, 2026** — Sign-up (driver and business), password recovery
  and the welcome screens inside the app, on shared server rules
  (`signup-core.ts`). Also fixed the PIN field filter in `login.tsx`
  (`/D/` → `/\D/`) and two typed-route paths (`/business`, `/(tabs)`).
- **November 18, 2026** — Built the whole phone app (`6d3777f`): `/api/app`
  with bearer tokens over the same `lib/platform` code, shared loaders/rules
  pulled out of web pages (the web uses them too, same behavior), all driver
  and business screens, staff PIN, Yappy, uploads, CSV. The user reviewed it
  on their iPhone with Expo Go. Then: agreed the web+app rule (§1), the App
  Store readiness checklist (§3), and reorganized this file.
- **November 11, 2026** — Landing: theme switcher removed (light only), app
  screenshots, new pricing with monthly/annual; marquee and hero tag removed
  later (`170c20e`). Annual plan end to end (migration, Yappy order, checkout
  picker, receipts, admin payments, terms/FAQ copy). Driver setup checklist.
  Admin: waitlist screen removed, opens on Plataforma (count tiles).
- **October 20, 2026** — Blurred map placeholder and soft green accents
  (`e5a78d6`). "App features" batch (`7e4cf19`): welcome, notifications,
  announcements, favorites, search/filters, hours/logo/photos, feedback,
  receipts, account deletion, business chart + CSV, admin metrics. Earlier
  in October: business PIN (`256a195`), mobile redesign with the dock
  (`1d17262`), green removed (`54ca745`).
- **September 23, 2026** — Mobile polish from the user's iPhone screenshots
  (`497d785`), every `/admin` screen on the new identity (`3e72cc7`), new
  icons, share card and recovery email (`febb7fc`, `758c6af`), transparent
  favicon (`8156d10`), Yappy dialog centered (`00f927d`). The user often
  sends phone screenshots of things that look off; expect more of that.
