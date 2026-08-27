import { FuelIcon, FoodIcon, WrenchIcon, HeartPulseIcon, TagIcon } from "@/components/icons";

// No hardcoded percentages/prices here — those aren't final yet. Each
// card leans on its category icon plus a plain "hay descuento acá" chip
// instead, so the claim stays true without promising a number we'd have
// to walk back later.
const BENEFITS = [
  { label: "Combustible", Icon: FuelIcon, bg: "bg-sol", text: "text-navy", chip: "bg-navy/10" },
  { label: "Comida", Icon: FoodIcon, bg: "bg-verde", text: "text-white", chip: "bg-white/15" },
  { label: "Taller", Icon: WrenchIcon, bg: "bg-ember", text: "text-white", chip: "bg-white/15" },
  { label: "Salud", Icon: HeartPulseIcon, bg: "bg-navy", text: "text-bone", chip: "bg-white/10" },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 border-b border-line bg-bone px-6 py-14 sm:py-28">
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
          {BENEFITS.map(({ label, Icon, bg, text, chip }) => (
            <div
              key={label}
              data-reveal
              className={`flex min-h-[188px] flex-col justify-between rounded-2xl p-6 shadow-[0_16px_40px_-24px_rgba(4,20,41,0.4)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(4,20,41,0.45)] ${bg} ${text}`}
            >
              <div className="flex items-start justify-between">
                <div className="font-mono text-[11px] font-medium tracking-[0.14em] opacity-80">
                  {label.toUpperCase()}
                </div>
                <Icon className="h-6 w-6 opacity-90" />
              </div>

              <div
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide ${chip}`}
              >
                <TagIcon className="h-3.5 w-3.5" />
                Descuento activo
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
