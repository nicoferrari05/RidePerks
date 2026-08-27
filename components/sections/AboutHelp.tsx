import { FuelIcon, FoodIcon, WrenchIcon, HeartPulseIcon } from "@/components/icons";

const AREAS = [
  {
    label: "Combustible",
    Icon: FuelIcon,
    copy: "Descuentos en gasolineras aliadas, donde ya cargás cada semana.",
  },
  {
    label: "Comida",
    Icon: FoodIcon,
    copy: "Precios especiales en los lugares donde comés entre viaje y viaje.",
  },
  {
    label: "Taller",
    Icon: WrenchIcon,
    copy: "Mantenimiento y repuestos más baratos para el carro o la moto que es tu herramienta de trabajo.",
  },
  {
    label: "Salud",
    Icon: HeartPulseIcon,
    copy: "Acceso a chequeos y servicios de salud sin que te espante el precio.",
  },
];

const PLATFORMS = ["Uber", "InDrive", "PedidosYa", "Y las que sigan"];

export default function AboutHelp() {
  return (
    <section className="border-b border-line bg-bone px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div data-reveal className="max-w-xl">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            EN QUÉ TE AYUDAMOS
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Cuatro áreas donde ya estás gastando.
          </h2>
        </div>

        <div className="mt-14 flex flex-col divide-y divide-line">
          {AREAS.map(({ label, Icon, copy }) => (
            <div key={label} data-reveal className="flex items-start gap-5 py-6 first:pt-0 last:pb-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember-soft text-ember">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-navy">{label}</h3>
                <p className="mt-1 max-w-md text-[15px] leading-relaxed text-mute">{copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-16 rounded-2xl border border-line bg-paper p-7">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            PARA QUIÉN ES
          </span>
          <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-mute">
            Para cualquier conductor en Panamá que trabaje con plataformas de viajes o delivery,
            sin importar en cuál, o si trabajas en varias a la vez.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-line bg-bone-2 px-3.5 py-1.5 font-mono text-xs tracking-wide text-navy"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
