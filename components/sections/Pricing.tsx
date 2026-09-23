// Real, single membership plan: $15.00/month, manual renewal via Yappy (see
// YAPPY.md / app/driver/membership/page.tsx). No invented tiers or numbers,
// per PRODUCT.md.
import { CheckIcon } from "@/components/icons";
import PillLink from "@/components/landing/PillLink";

const FEATURES = [
  "Todos los beneficios activos",
  "Renovación manual con Yappy",
  "Sin cargos automáticos",
];

export default function Pricing() {
  return (
    <section id="planes" className="scroll-mt-24 px-5 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
        <h2
          data-reveal
          className="max-w-md text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Un precio. Sin sorpresas.
        </h2>

        <div
          data-reveal
          className="rounded-[28px] bg-lp-band p-7 text-lp-band-fg sm:rounded-[32px] sm:p-10"
        >
          <p className="flex items-baseline gap-2">
            <span className="text-[clamp(3.5rem,9vw,5.5rem)] font-medium leading-none tracking-[-0.05em]">
              $15
            </span>
            <span className="text-lp-band-muted">al mes</span>
          </p>
          <ul className="mt-7 flex flex-col gap-3.5 border-t border-lp-band-line pt-7 text-[15px] sm:mt-8 sm:pt-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lp-band-fg text-lp-band">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <PillLink href="/register" variant="pill" className="mt-8 w-full sm:mt-10">
            Empezar
          </PillLink>
        </div>
      </div>
    </section>
  );
}
