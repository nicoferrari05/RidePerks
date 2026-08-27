// Adapted from a generic dark SaaS "pricing-section" community component,
// ported to this project's brand tokens (navy/ember/bone instead of
// black/white) and voice. Tiers below are illustrative placeholders tied
// to the same categories as the Beneficios section — no real prices yet,
// so the whole preview is blurred and locked behind a "Próximamente"
// overlay rather than presented as a real, orderable plan.
import Link from "next/link";
import { CheckIcon, LockIcon } from "@/components/icons";

const PLANS = [
  {
    name: "Arranque",
    tagline: "Para empezar a ahorrar desde el día uno.",
    price: "Por confirmar",
    features: ["Descuentos en combustible", "Descuentos en comida", "Soporte por WhatsApp"],
  },
  {
    name: "Ruta Pro",
    tagline: "El plan pensado para quien maneja a diario.",
    price: "Por confirmar",
    featured: true,
    features: [
      "Todo lo de Arranque",
      "Descuentos en taller y repuestos",
      "Descuentos en salud",
      "Soporte prioritario",
    ],
  },
  {
    name: "Flota",
    tagline: "Para equipos y flotas de varios conductores.",
    price: "Por confirmar",
    features: [
      "Todo lo de Ruta Pro",
      "Panel para varios conductores",
      "Facturación centralizada",
      "Asesor de cuenta dedicado",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="planes" className="scroll-mt-20 relative overflow-hidden border-b border-white/10 bg-navy px-6 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, rgba(207,59,24,0.28), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            PLANES Y PRECIOS
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Elige tu ritmo de <em className="font-accent italic text-ember">ahorro.</em>
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-bone/60">
            Estamos afinando los planes junto con los primeros conductores de la lista. Así se van
            a ver.
          </p>
        </div>

        <div data-reveal className="relative mt-16">
          {/* Non-interactive preview — real content, just not live yet. */}
          <div
            aria-hidden="true"
            className="pointer-events-none grid select-none gap-4 opacity-40 blur-[3px] sm:grid-cols-3"
          >
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col rounded-2xl border p-7 ${
                  plan.featured ? "border-ember/60 bg-navy-2" : "border-white/10 bg-navy-2/60"
                }`}
              >
                <h3 className="text-lg font-semibold text-bone">{plan.name}</h3>
                <p className="mt-2 text-sm text-bone/50">{plan.tagline}</p>
                <div className="mt-6 text-3xl font-semibold tracking-tight text-bone">
                  {plan.price}
                </div>
                <div className="mt-6 h-px w-full bg-white/10" />
                <ul className="mt-6 flex flex-col gap-3 text-sm text-bone/70">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Overlay — the only interactive thing in this section. */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="flex max-w-xs flex-col items-center gap-4 rounded-3xl border border-white/10 bg-navy-2/95 px-8 py-9 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-bone/70">
                <LockIcon className="h-3.5 w-3.5" />
                PRÓXIMAMENTE
              </span>
              <p className="text-[15px] leading-relaxed text-bone/70">
                Los planes se activan cuando lancemos la app. Únete a la lista y sé de los primeros
                en verlos.
              </p>
              <Link
                href="/#waitlist"
                className="cursor-pointer rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
              >
                Avísenme cuando estén listos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
