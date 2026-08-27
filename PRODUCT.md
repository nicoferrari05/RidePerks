# Product

## Register

brand

## Users

Gig drivers in Panama working for Uber, InDrive, PedidosYa (rideshare and delivery), often across
multiple platforms at once. They check the site on a phone, between rides or during downtime, in a
market where fuel and living costs eat directly into thin, per-ride margins. They're price-sensitive
and skeptical of anything that sounds like another app promising more work rather than more money
kept.

## Product Purpose

RidePerks is a benefits/discount membership club for gig drivers, not a ride-dispatch or
work-finding app. It negotiates real discounts with local businesses (fuel stations, food,
auto repair, health services) and passes them directly to registered members. The product is
pre-launch: the site's job right now is to grow a waitlist (with a referral queue that rewards
inviting other drivers) ahead of the app shipping. Success is measured in waitlist signups,
referral shares, and eventually paid/active membership once the app is live.

## Brand Personality

Directo, cálido, sin humo (direct, warm, no-hype). The reference point is a trustworthy membership
card, not a startup pitch deck: flat one-weight icons, no emoji, a "receipt voice" (JetBrains Mono)
for facts, IDs and savings math, and a serif italic accent reserved for exactly one emotional word
per section. Copy states the mechanism plainly ("es plata que dejás de gastar en lo que ya ibas a
gastar de todos modos") instead of leaning on excitement or urgency.

## Anti-references

- Not another "more rides / smarter algorithm" gig-work app — the /about page says this outright.
- Not generic venture-backed SaaS: no gradient-text hero, no stacked stat-tile dashboard cliché, no
  glassmorphism-as-decoration.
- Not a flashy discount/coupon app aesthetic (badges, countdown urgency, saturated primary colors
  everywhere) — the palette stays restrained (bone/paper neutrals, ember used as the one accent).
- Numbers are never invented. Where real prices/percentages aren't final yet (e.g. the Planes y
  Precios section), the UI says so honestly (blurred preview, "Por confirmar") rather than faking a
  number to look more finished.

## Design Principles

1. **Never promise more than is true.** No invented percentages, prices, or claims — visible in
   how Beneficios and Pricing were deliberately built without fabricated numbers.
2. **One membership, all your spend.** Fuel, food, repairs, health are one club, not four separate
   pitches — reinforced visually by grouping, not by fragmenting into more sections.
3. **Mobile-first, low friction.** The audience checks this between rides; forms are short,
   sections are skimmable, CTAs repeat rather than hide behind navigation.
4. **Restraint in motion and color.** GSAP reveals are explicitly "subtle... not a showcase for
   motion"; ember is the only saturated accent against navy/bone neutrals.
5. **The receipt voice.** Mono type carries facts (IDs, savings, labels); serif italic is spent on
   exactly one emotional word per section, never on body copy.

## Accessibility & Inclusion

Target WCAG AA. `prefers-reduced-motion` is already honored globally (GSAP reveals, CSS
transitions, scroll-behavior) — new components should follow the same pattern rather than adding
motion that ignores it. Interactive elements use visible focus outlines (`focus-visible:outline`)
in the brand's ember/navy colors; keep that convention rather than removing focus rings for style.
