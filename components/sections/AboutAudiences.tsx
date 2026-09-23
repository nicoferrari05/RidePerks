import { CarFront, Store } from "lucide-react";
import PillLink from "@/components/landing/PillLink";

const GROUPS = [
  {
    Icon: CarFront,
    title: "Para conductores",
    intro: "Tu membresía, en el teléfono.",
    cta: { href: "/register", label: "Crear mi cuenta" },
    points: [
      {
        title: "Descuentos en tus gastos de siempre",
        copy: "Combustible, comida y taller en comercios aliados, con las condiciones claras antes de ir.",
      },
      {
        title: "Un código para cada uso",
        copy: "Generas un QR desde la app. Si la cámara falla, el comercio escribe un código corto de 6 caracteres. Vence en 2 minutos y sirve una sola vez.",
      },
      {
        title: "Tu ahorro, registrado",
        copy: "Cada uso confirmado queda en tu historial, con lo que ahorraste este mes y en total.",
      },
      {
        title: "Pagas cuando quieres",
        copy: "$15 al mes con Yappy. La renovación es manual: no hay cargos automáticos.",
      },
      {
        title: "Un club verificado",
        copy: "Revisamos que cada miembro sea conductor activo. Así los comercios confían en el club.",
      },
    ],
  },
  {
    Icon: Store,
    title: "Para comercios",
    intro: "Clientes que ya están buscando dónde parar.",
    cta: { href: "/business/register", label: "Registra tu comercio" },
    points: [
      {
        title: "Sin costo para tu negocio",
        copy: "El conductor paga su membresía. Unirte a RidePerks no te cuesta nada.",
      },
      {
        title: "Tú defines el beneficio",
        copy: "Propones el descuento, las condiciones y los límites de uso. Nuestro equipo lo revisa antes de publicarlo.",
      },
      {
        title: "Canje en segundos",
        copy: "Escaneas el código del conductor, revisas el beneficio y confirmas. No cambias cómo cobras.",
      },
      {
        title: "Tu equipo, con acceso propio",
        copy: "Invitas a tu personal para que valide beneficios con su propia cuenta, sin compartir contraseñas.",
      },
      {
        title: "Resultados a la vista",
        copy: "Consultas cuántos conductores te visitaron y qué beneficio se usa más.",
      },
    ],
  },
];

export default function AboutAudiences() {
  return (
    <section className="px-5 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <h2
          data-reveal
          className="max-w-3xl text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Un club que funciona para los dos lados.
        </h2>

        <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-2">
          {GROUPS.map(({ Icon, title, intro, cta, points }) => (
            <article
              key={title}
              data-reveal
              className="flex flex-col rounded-[32px] border border-lp-line bg-lp-surface p-7 sm:p-10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lp-surface-2">
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-3xl font-medium tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-lp-muted">{intro}</p>
              <ul className="mt-8 flex flex-1 flex-col divide-y divide-lp-line border-y border-lp-line">
                {points.map((point) => (
                  <li key={point.title} className="py-5">
                    <p className="font-medium">{point.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-lp-muted">
                      {point.copy}
                    </p>
                  </li>
                ))}
              </ul>
              <PillLink href={cta.href} className="mt-8 self-start">
                {cta.label}
              </PillLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
