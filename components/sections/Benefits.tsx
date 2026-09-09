import Link from "next/link";
import {
  Fuel,
  UtensilsCrossed,
  Wrench,
  HeartPulse,
  ArrowUpRight,
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
      </div>
    </section>
  );
}
