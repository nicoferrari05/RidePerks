import { Fuel, UtensilsCrossed, Wrench, HeartPulse } from "lucide-react";

const AREAS = [
  {
    label: "Combustible",
    Icon: Fuel,
    copy: "Descuentos en gasolineras aliadas, donde ya cargas cada semana.",
  },
  {
    label: "Comida",
    Icon: UtensilsCrossed,
    copy: "Precios especiales donde comes entre viaje y viaje.",
  },
  {
    label: "Taller",
    Icon: Wrench,
    copy: "Mantenimiento y repuestos para el carro o la moto que es tu herramienta de trabajo.",
  },
  {
    label: "Salud",
    Icon: HeartPulse,
    copy: "Chequeos y servicios de salud a un mejor precio.",
  },
];

const PLATFORMS = ["Uber", "InDrive", "PedidosYa"];

export default function AboutHelp() {
  return (
    <section className="px-5 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div
          data-reveal
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <h2 className="max-w-2xl text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]">
            Cuatro áreas donde ya estás gastando.
          </h2>
          <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-lp-muted">
            Estamos sumando comercios en cada área. Los beneficios disponibles
            aparecen en la app con todas sus condiciones.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {AREAS.map(({ label, Icon, copy }) => (
            <article
              key={label}
              data-reveal
              className="flex min-h-[220px] flex-col justify-between rounded-[28px] border border-lp-line bg-lp-surface p-7"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lp-surface-2">
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.03em]">{label}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-lp-muted">{copy}</p>
              </div>
            </article>
          ))}
        </div>

        <div data-reveal className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-lp-muted">Para conductores de</span>
          {PLATFORMS.map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-lp-line px-4 py-1.5 text-sm font-medium"
            >
              {platform}
            </span>
          ))}
          <span className="ml-1 text-lp-muted">o de varias a la vez.</span>
        </div>
      </div>
    </section>
  );
}
