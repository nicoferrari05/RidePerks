import type { Metadata } from "next";
import { CarFront, Fuel, HeartPulse, Plus, Store, UtensilsCrossed, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHARE_IMAGE } from "@/lib/share";
import SilkGradient from "@/components/site/SilkGradient";
import SiteShell from "@/components/site/SiteShell";
import { CONTAINER, Cta, H2, JoinCta, SECTION, d } from "@/components/site/ui";

const title = "Sobre RidePerks · El club de beneficios para conductores";
const description =
  "RidePerks es el club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá. Descubre por qué existimos y en qué áreas te ayudamos a gastar menos.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://rideperks.app/about",
    siteName: "RidePerks",
    locale: "es_PA",
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SHARE_IMAGE],
  },
};

/* ---------- Hero ---------- */

function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[80svh] flex-col overflow-hidden">
      <SilkGradient lift={0.12} />
      <div className={cn(CONTAINER, "relative flex flex-1 flex-col items-center pt-36 text-center sm:pt-44")}>
        <h1 className="rpx-in max-w-4xl text-balance text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[1.04] tracking-[-0.05em]">
          Un club de beneficios para conductores.
        </h1>
        <p
          className="rpx-in mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--muted)] sm:text-xl"
          style={d(120)}
        >
          RidePerks es una membresía para quienes trabajan manejando con Uber, InDrive o PedidosYa en Panamá. Negociamos
          descuentos con comercios locales para que lo que ya gastas cada semana rinda más.
        </p>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/0 to-white sm:h-24"
      />
    </section>
  );
}

/* ---------- Historia ---------- */

function AboutStory() {
  return (
    <section className="pt-24 sm:pt-36">
      <div className={CONTAINER}>
        <div
          data-rv
          className="rpx-featured grid gap-10 rounded-[32px] px-7 py-14 sm:px-14 sm:py-20 lg:grid-cols-[1fr_1.15fr]"
        >
          <h2 className="text-balance text-[clamp(2.2rem,4.5vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
            Manejar ya tiene suficientes gastos.
          </h2>
          <div className="flex flex-col gap-5 text-pretty text-[17px] leading-relaxed text-white/80">
            <p>
              Gasolina, comida, mantenimiento, llantas, farmacia. Son gastos que salen directo de lo que ganas cada día
              y que no puedes dejar de hacer.
            </p>
            <p>
              RidePerks no te promete más viajes ni un algoritmo más inteligente. Hacemos algo más simple: nos aliamos
              con comercios para que pagues menos en lo que ya ibas a comprar.
            </p>
            <p className="text-white">
              Una sola membresía te da acceso a todos los beneficios activos. Sin puntos que acumular y sin cambiar la
              forma en la que trabajas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Para quién ---------- */

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
        copy: "$15 al mes o $150 al año (2 meses gratis) con Yappy. La renovación es manual: no hay cargos automáticos.",
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

function AboutAudiences() {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <h2 data-rv className={cn(H2, "max-w-[16ch]")}>
          Un club que funciona para los dos lados.
        </h2>
        <div className="mt-12 grid gap-3 sm:mt-16 lg:grid-cols-2 lg:gap-4">
          {GROUPS.map(({ Icon, title, intro, cta, points }, i) => (
            <article
              key={title}
              data-rv
              style={d(i * 90)}
              className="flex flex-col rounded-[30px] bg-[var(--surface)] p-7 sm:p-10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--iris)] shadow-[0_8px_20px_-12px_rgba(11,18,32,0.3)]">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="mt-8 text-[1.75rem] font-semibold tracking-[-0.035em]">{title}</h3>
              <p className="mt-1.5 text-[var(--muted)]">{intro}</p>
              <ul className="mt-8 flex flex-1 flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {points.map((point) => (
                  <li key={point.title} className="py-5">
                    <p className="font-semibold tracking-[-0.01em]">{point.title}</p>
                    <p className="mt-1 text-pretty text-[15px] leading-relaxed text-[var(--muted)]">{point.copy}</p>
                  </li>
                ))}
              </ul>
              <Cta href={cta.href} className="mt-9 self-start">
                {cta.label}
              </Cta>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Cómo se usa ---------- */

const STEPS = [
  { title: "Eliges el beneficio", copy: "Revisas el comercio, el descuento y sus condiciones desde la app." },
  { title: "Generas tu código", copy: "Cuando te atienden, generas un QR de un solo uso." },
  { title: "El comercio lo confirma", copy: "Lo escanean, ven el beneficio y confirman el descuento." },
  { title: "Queda en tu historial", copy: "El uso se registra al instante, para ti y para el comercio." },
];

function AboutRedemption() {
  return (
    <section className="pb-24 sm:pb-36">
      <div className={CONTAINER}>
        <h2 data-rv className={cn(H2, "max-w-[14ch]")}>
          Así se usa un beneficio.
        </h2>
        <ol className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              data-rv
              style={d(i * 90)}
              className="flex min-h-[240px] flex-col justify-between rounded-[28px] bg-[var(--surface)] p-7"
            >
              <span className="text-sm font-semibold tabular-nums text-[var(--iris)]">0{i + 1}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">{step.title}</h3>
                <p className="mt-2 text-pretty text-[15px] leading-relaxed text-[var(--muted)]">{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Áreas ---------- */

const AREAS = [
  { label: "Combustible", Icon: Fuel, copy: "Descuentos en gasolineras aliadas, donde ya cargas cada semana." },
  { label: "Comida", Icon: UtensilsCrossed, copy: "Precios especiales donde comes entre viaje y viaje." },
  {
    label: "Taller",
    Icon: Wrench,
    copy: "Mantenimiento y repuestos para el carro o la moto que es tu herramienta de trabajo.",
  },
  { label: "Salud", Icon: HeartPulse, copy: "Chequeos y servicios de salud a un mejor precio." },
];

const PLATFORMS = ["Uber", "InDrive", "PedidosYa"];

function AboutHelp() {
  return (
    <section
      className={cn(SECTION, "bg-[linear-gradient(180deg,#fff_0%,var(--surface)_18%,var(--surface)_82%,#fff_100%)]")}
    >
      <div className={CONTAINER}>
        <div data-rv className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className={cn(H2, "max-w-[15ch]")}>Cuatro áreas donde ya estás gastando.</h2>
          <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-[var(--muted)] lg:pb-2">
            Estamos sumando comercios en cada área. Los beneficios disponibles aparecen en la app con todas sus
            condiciones.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {AREAS.map(({ label, Icon, copy }, i) => (
            <article
              key={label}
              data-rv
              style={d(i * 90)}
              className="flex min-h-[240px] flex-col justify-between rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(11,18,32,0.04),0_24px_50px_-34px_rgba(11,18,32,0.35)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--mist)] text-[var(--iris)]">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">{label}</h3>
                <p className="mt-2 text-pretty text-[15px] leading-relaxed text-[var(--muted)]">{copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div data-rv className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[var(--muted)]">Para conductores de</span>
          {PLATFORMS.map((platform) => (
            <span
              key={platform}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ring-[var(--line)]"
            >
              {platform}
            </span>
          ))}
          <span className="ml-1 text-[var(--muted)]">o de varias a la vez.</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Preguntas ---------- */

const QUESTIONS = [
  {
    q: "¿Cuánto cuesta?",
    a: "Crear la cuenta es gratis. La membresía cuesta $15 al mes, o $150 por un año en un solo pago, y se paga con Yappy. Tú decides cuándo renovar; no hay cargos automáticos.",
  },
  {
    q: "¿Qué necesito para usar los beneficios?",
    a: "Una cuenta verificada y la membresía activa. Para verificarte, subes una captura de tu perfil de conductor y el equipo la revisa.",
  },
  {
    q: "Trabajo en varias plataformas, ¿puedo unirme?",
    a: "Sí. RidePerks es para cualquier conductor o repartidor en Panamá, sin importar en qué plataforma trabajes.",
  },
  {
    q: "¿Cuánto le cuesta a un comercio?",
    a: "Nada. El comercio propone su beneficio, nosotros lo revisamos y, una vez publicado, valida los canjes desde su portal.",
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Tu captura de verificación es privada y se borra después de revisarla. Al canjear, el comercio solo ve tu nombre y el beneficio.",
  },
];

function AboutFAQ() {
  return (
    <section className={SECTION}>
      <div className={cn(CONTAINER, "grid gap-10 lg:grid-cols-12")}>
        <h2 data-rv className={cn(H2, "lg:col-span-5")}>
          Preguntas frecuentes.
        </h2>
        <div data-rv className="divide-y divide-[var(--line)] border-y border-[var(--line)] lg:col-span-7">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold tracking-[-0.015em] transition-opacity duration-150 hover:opacity-75 [&::-webkit-details-marker]:hidden">
                {q}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--iris)] transition-transform duration-200 ease-snappy group-open:rotate-45">
                  <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-xl pb-6 text-pretty text-[15px] leading-relaxed text-[var(--muted)]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutHero />
      <AboutStory />
      <AboutAudiences />
      <AboutRedemption />
      <AboutHelp />
      <AboutFAQ />
      <JoinCta />
    </SiteShell>
  );
}
