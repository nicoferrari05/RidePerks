import { FuelIcon, FoodIcon, WrenchIcon, HeartPulseIcon } from "@/components/icons";

const BENEFITS = [
  { icon: FuelIcon, label: "Gasolina", copy: "Menos por galón, en estaciones aliadas." },
  { icon: FoodIcon, label: "Comida", copy: "Descuentos en fondas y restaurantes." },
  { icon: WrenchIcon, label: "Mantenimiento", copy: "Repuestos, llantas y talleres." },
  { icon: HeartPulseIcon, label: "Salud", copy: "Farmacias y consultas a mejor precio." },
];

export default function Benefits() {
  return (
    <section className="border-b border-line bg-bone px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="max-w-xl">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            BENEFICIOS
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            Menos gasto. Más para ti.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, label, copy }) => (
            <div
              key={label}
              data-reveal
              className="rounded-2xl border border-line bg-white p-6 transition-transform duration-200 ease-out hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ember-soft text-ember">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">{label}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
