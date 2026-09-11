import Link from "next/link";
import {
  Fuel,
  UtensilsCrossed,
  Wrench,
  HeartPulse,
  ArrowUpRight,
  Store,
  BadgePercent,
  ScanLine,
} from "lucide-react";
const BENEFITS = [
  {
    label: "Combustible",
    category: "combustible",
    description: "Para seguir en ruta.",
    Icon: Fuel,
    bg: "bg-sol",
    text: "text-navy",
  },
  {
    label: "Comida",
    category: "comida",
    description: "Tu pausa entre viajes.",
    Icon: UtensilsCrossed,
    bg: "bg-verde",
    text: "text-white",
  },
  {
    label: "Taller",
    category: "mantenimiento",
    description: "Cuida lo que te mueve.",
    Icon: Wrench,
    bg: "bg-ember",
    text: "text-white",
  },
  {
    label: "Salud",
    category: "salud",
    description: "También se trata de ti.",
    Icon: HeartPulse,
    bg: "bg-navy",
    text: "text-bone",
  },
];
export default function Benefits() {
  return (
    <section
      id="beneficios"
      className="scroll-mt-20 border-b border-line bg-bone px-6 py-14 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="max-w-xl">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            BENEFICIOS
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            Una membresía. Todo incluido.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ label, category, description, Icon, bg, text }) => (
            <Link
              key={category}
              href={"/driver/benefits?category=" + category}
              data-reveal
              className={`group flex min-h-[218px] flex-col justify-between rounded-2xl p-6 transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${bg} ${text}`}
            >
              <div className="flex items-start justify-between">
                <Icon size={38} strokeWidth={1.8} aria-hidden="true" />
                <ArrowUpRight size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="mt-7">
                <h3 className="text-xl font-semibold tracking-tight">
                  {label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div
          data-reveal
          className="mt-6 flex flex-col gap-8 rounded-2xl border border-line bg-white p-7 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="max-w-sm">
            <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
              PARA COMERCIOS
            </span>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-navy">
              ¿Tienes un comercio? <em className="font-accent italic text-ember">Súmate.</em>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-navy/60">
              A ti no te cuesta nada unirte — el conductor paga su membresía, no tu negocio. Tú
              eliges el descuento y las condiciones.
            </p>
            <Link
              href="/business/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-bone transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              Registra tu comercio
            </Link>
          </div>
          <ul className="flex flex-col gap-5">
            <li className="flex items-start gap-3">
              <Store
                size={20}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-ember"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-navy/70">
                Accedes a conductores que ya buscan dónde gastar en tu categoría.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <BadgePercent
                size={20}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-ember"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-navy/70">
                Tú propones el beneficio; nuestro equipo lo revisa antes de publicarlo.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ScanLine
                size={20}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-ember"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-navy/70">
                Confirmas el canje escaneando un código — sin cambiar cómo cobras.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
