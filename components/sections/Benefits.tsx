import { Fuel, UtensilsCrossed, Wrench } from "lucide-react";
import PillLink from "@/components/landing/PillLink";
import InfoCard from "@/components/landing/InfoCard";

const BENEFITS = [
  {
    title: "Combustible",
    category: "combustible",
    Icon: Fuel,
    detail:
      "Descuentos en gasolineras aliadas, donde ya cargas cada semana. Cada beneficio muestra sus condiciones y límites antes de ir.",
  },
  {
    title: "Comida",
    category: "comida",
    Icon: UtensilsCrossed,
    detail:
      "Precios especiales en los lugares donde comes entre viaje y viaje, sin cambiar tu ruta.",
  },
  {
    title: "Taller",
    category: "mantenimiento",
    Icon: Wrench,
    detail:
      "Mantenimiento y repuestos más baratos para el carro o la moto que es tu herramienta de trabajo.",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-24 px-5 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <h2
          data-reveal
          className="max-w-2xl text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Una membresía. Todo incluido.
        </h2>

        <div className="mt-10 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4">
          {BENEFITS.map(({ title, category, Icon, detail }) => (
            <div key={category} data-reveal>
              <InfoCard
                icon={<Icon size={34} strokeWidth={1.5} aria-hidden="true" />}
                title={title}
                detail={detail}
                link={{ href: "/driver/benefits?category=" + category, label: "Ver beneficios" }}
                className="h-full"
              />
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="mt-3 flex flex-col gap-6 rounded-[28px] bg-lp-band p-7 text-lp-band-fg sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:p-12"
        >
          <div>
            <h3 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.05] tracking-[-0.03em]">
              ¿Tienes un comercio?
            </h3>
            <p className="mt-2 text-lp-band-muted sm:mt-3">Unirte no le cuesta nada a tu negocio.</p>
          </div>
          <PillLink href="/business/register" variant="pill" className="self-start sm:self-auto">
            Registra tu comercio
          </PillLink>
        </div>
      </div>
    </section>
  );
}
