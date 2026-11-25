import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bell, Check, Fuel, PiggyBank, Receipt, UtensilsCrossed, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import SilkGradient from "@/components/site/SilkGradient";
import SiteShell from "@/components/site/SiteShell";
import { CONTAINER, Chip, Cta, H2, JoinCta, Phone, SECTION, d } from "@/components/site/ui";

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden sm:h-[100svh] sm:min-h-[660px]"
    >
      <SilkGradient lift={0.08} />
      <div className={cn(CONTAINER, "relative flex min-h-0 flex-1 flex-col pt-28 sm:pt-36 lg:pt-40")}>
        <div className="grid gap-7 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="rpx-in text-[clamp(3.1rem,8.2vw,6.6rem)] font-semibold leading-[1.08] tracking-[-0.05em] lg:col-span-7">
            <span className="block">Tu trabajo</span>
            <span className="block text-[var(--iris)]">rinde más.</span>
          </h1>
          <div className="rpx-in lg:col-span-5 lg:pb-3" style={d(120)}>
            <p className="max-w-md text-pretty text-[17px] leading-relaxed text-[var(--muted)] sm:text-lg">
              <span className="block font-medium text-[var(--ink)]">
                La plataforma de beneficios y descuentos para conductores de apps de transporte y delivery en Panamá.
              </span>
              <span className="mt-2 block">Ahorra en gasolina, comida y taller desde tu teléfono.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta href="/register">Crear mi cuenta</Cta>
              <Cta href="#como-funciona" tone="light">
                Cómo funciona
              </Cta>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-12 h-[400px] w-[250px] flex-none sm:mt-14 sm:h-auto sm:min-h-[200px] sm:w-[330px] sm:flex-1">
          <Phone
            src="/brand/screens/app-inicio.png"
            alt="Pantalla de inicio de la app RidePerks: ahorraste $32.50 este mes con 11 beneficios usados."
            sizes="(min-width: 640px) 330px, 250px"
            priority
            className="rpx-rise"
          />
          <div className="rpx-in absolute -left-8 top-[290px] z-10 sm:-left-[190px] sm:top-[110px]" style={d(900)}>
            <div className="rpx-float origin-left scale-[0.86] sm:scale-100">
              <Chip
                icon={<Fuel size={18} strokeWidth={1.75} aria-hidden="true" />}
                title="Ahorraste $2.00"
                text="en combustible"
              />
            </div>
          </div>
          <div className="rpx-in absolute -right-[200px] top-[250px] z-10 hidden sm:block" style={d(1050)}>
            <div className="rpx-float origin-right scale-[0.86] sm:scale-100" style={{ "--f": "-3s" } as CSSProperties}>
              <Chip
                icon={<BadgeCheck size={18} strokeWidth={1.75} aria-hidden="true" />}
                title="Beneficio confirmado"
                text="queda en tu actividad"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/0 to-white sm:h-24"
      />
    </section>
  );
}

/* ---------- Manifesto ---------- */

function Manifesto() {
  return (
    <section className="py-28 sm:py-40">
      <div className="mx-auto max-w-[1120px] px-6 text-center">
        <span data-rv aria-hidden="true" className="rpx-mark rpx-mark-grad mx-auto w-12 sm:w-14" />
        <h2
          data-rv
          style={d(100)}
          className="mt-10 text-[clamp(1.9rem,4.4vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.035em]"
        >
          <span className="block text-balance text-[var(--faint)]">Tú manejas para ganar más.</span>
          <span className="block text-balance">
            Nosotros te ayudamos a <span className="text-[var(--iris)]">gastar menos.</span>
          </span>
        </h2>
      </div>
    </section>
  );
}

/* ---------- Beneficios ---------- */

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
    detail: "Precios especiales en los lugares donde comes entre viaje y viaje, sin cambiar tu ruta.",
  },
  {
    title: "Taller",
    category: "mantenimiento",
    Icon: Wrench,
    detail: "Mantenimiento y repuestos más baratos para el carro o la moto que es tu herramienta de trabajo.",
  },
];

function Benefits() {
  return (
    <section id="beneficios" className={cn(SECTION, "pt-0 sm:pt-0")}>
      <div className={CONTAINER}>
        <h2 data-rv className={cn(H2, "max-w-[14ch]")}>
          Una membresía. Todo incluido.
        </h2>
        <div className="mt-12 grid gap-3 sm:mt-16 md:grid-cols-3 md:gap-4">
          {BENEFITS.map(({ title, category, Icon, detail }, i) => (
            <Link
              key={category}
              href={"/driver/benefits?category=" + category}
              data-rv
              style={d(i * 90)}
              className="rpx-card-link group flex min-h-[340px] flex-col rounded-[28px] bg-[var(--surface)] p-7 transition-colors duration-300 hover:bg-[#ebf1f8] sm:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--iris)] shadow-[0_8px_20px_-12px_rgba(11,18,32,0.3)]">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="mt-10 text-2xl font-semibold sm:mt-16 tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[var(--muted)]">{detail}</p>
              <span className="mt-auto inline-flex pt-8 items-center gap-2 text-sm font-semibold">
                Ver beneficios
                <span className="rpx-btn-icon flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-white">
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div data-rv className="relative mt-3 overflow-hidden rounded-[28px] bg-[var(--mist)] p-7 sm:p-10 md:mt-4">
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.035em]">
                ¿Tienes un comercio?
              </h3>
              <p className="mt-2 text-lg text-[var(--muted)]">Unirte no le cuesta nada a tu negocio.</p>
            </div>
            <Cta href="/business/register" className="self-start sm:self-auto">
              Registra tu comercio
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Cómo funciona ---------- */

const STEPS = [
  {
    title: "Crea tu cuenta",
    detail: "Gratis y en un minuto: tu nombre, correo, WhatsApp y la plataforma en la que trabajas.",
  },
  {
    title: "Verifica tu perfil",
    detail: "Sube una captura de tu perfil de Uber, InDrive o PedidosYa. El equipo la revisa y aprueba tu cuenta.",
  },
  {
    title: "Muestra tu código",
    detail:
      "En el comercio generas un QR de un solo uso. Lo escanean, confirman el descuento y tu ahorro queda registrado.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className={SECTION}>
      <div className={cn(CONTAINER, "grid items-center gap-14 lg:grid-cols-12 lg:gap-10")}>
        <div className="lg:col-span-6">
          <h2 data-rv className={H2}>
            Tres pasos.
          </h2>
          <ol className="mt-10 border-t border-[var(--line)] sm:mt-14">
            {STEPS.map(({ title, detail }, i) => (
              <li
                key={title}
                data-rv
                style={d(i * 90)}
                className="grid grid-cols-[3.25rem_1fr] gap-x-2 border-b border-[var(--line)] py-7 sm:grid-cols-[4.5rem_1fr]"
              >
                <span className="pt-1 text-sm font-semibold tabular-nums text-[var(--iris)]">0{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">{title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div data-rv className="lg:col-span-5 lg:col-start-8">
          <div className="rpx-silk-still relative h-[520px] overflow-hidden rounded-[32px] sm:h-[600px]">
            <Phone
              src="/brand/screens/app-qr.png"
              alt="Código QR para mostrar en el comercio, con cuenta regresiva y código corto de respaldo."
              sizes="(min-width: 640px) 300px, 250px"
              className="absolute left-1/2 top-16 w-[250px] -translate-x-1/2 sm:top-20 sm:w-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- La app ---------- */

const SCREENS = [
  {
    title: "Encuentra",
    text: "Busca por categoría o mira qué está abierto ahora.",
    src: "/brand/screens/app-beneficios.png",
    alt: "Lista de beneficios con buscador y filtros: combustible, almuerzos, cambio de aceite y medicinas.",
  },
  {
    title: "Elige",
    text: "Condiciones, límites y horario claros antes de ir.",
    src: "/brand/screens/app-detalle.png",
    alt: "Detalle de un beneficio: $0.10 menos por galón, abierto hasta las 22:00.",
  },
  {
    title: "Muestra tu código",
    text: "Un QR de un solo uso que vence en dos minutos.",
    src: "/brand/screens/app-qr.png",
    alt: "Código QR para mostrar en el comercio, con cuenta regresiva y código corto de respaldo.",
  },
  {
    title: "Listo",
    text: "El comercio confirma y tu ahorro queda registrado.",
    src: "/brand/screens/app-confirmado.png",
    alt: "Pantalla de beneficio confirmado: el comercio lo registró en tu actividad.",
  },
];

function AppShowcase() {
  return (
    <section
      id="app"
      className={cn(SECTION, "bg-[linear-gradient(180deg,#fff_0%,var(--surface)_18%,var(--surface)_82%,#fff_100%)]")}
    >
      <div className={CONTAINER}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 data-rv className={H2}>
            Todo desde tu teléfono.
          </h2>
          <p data-rv style={d(80)} className="mx-auto mt-5 max-w-md text-pretty text-lg text-[var(--muted)]">
            Del beneficio al ahorro en cuatro toques. Sin cupones de papel ni tarjetas.
          </p>
        </div>
        <div className="rpx-no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 sm:scroll-px-8 lg:scroll-px-0 gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:mt-16 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
          {SCREENS.map((s, i) => (
            <article
              key={s.title}
              data-rv
              style={d(i * 90)}
              className="flex w-[76vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04),0_24px_50px_-34px_rgba(11,18,32,0.35)] lg:w-auto lg:max-w-none"
            >
              <div className="relative h-[290px] overflow-hidden bg-[radial-gradient(90%_70%_at_50%_115%,rgba(141,195,232,0.6),rgba(141,195,232,0)_100%),linear-gradient(180deg,#fff,var(--mist))]">
                <Phone
                  src={s.src}
                  alt={s.alt}
                  sizes="200px"
                  className="absolute left-1/2 top-8 w-[200px] -translate-x-1/2 shadow-[0_40px_70px_-40px_rgba(0,70,150,0.7),0_0_0_1px_rgba(11,18,32,0.9)]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <span className="text-sm font-semibold tabular-nums text-[var(--iris)]">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{s.text}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-[var(--faint)]">
          Pantallas de ejemplo: los comercios y montos son ilustrativos.
        </p>
      </div>
    </section>
  );
}

/* ---------- Ahorro ---------- */

const SAVINGS = [
  { Icon: Bell, title: "Un aviso cada vez que ahorras", text: "Sabes al momento cuánto te descontaron y dónde." },
  { Icon: PiggyBank, title: "Tu ahorro del mes y el total", text: "Y cuántas veces tu membresía ya se pagó sola." },
  { Icon: Receipt, title: "Historial y recibos", text: "Cada uso y cada pago, guardados en tu cuenta." },
];

function Savings() {
  return (
    <section className={SECTION}>
      <div className={cn(CONTAINER, "grid items-center gap-14 lg:grid-cols-12 lg:gap-10")}>
        <div data-rv className="order-2 lg:order-1 lg:col-span-5">
          <div className="rpx-silk-still relative h-[520px] overflow-hidden rounded-[32px] sm:h-[600px]">
            <Phone
              src="/brand/screens/app-aviso.png"
              alt="Notificación de RidePerks: usaste descuento en combustible y ahorraste $2.00. Tu ahorro del mes subió a $34.50."
              sizes="(min-width: 640px) 300px, 250px"
              className="absolute left-1/2 top-16 w-[250px] -translate-x-1/2 sm:top-20 sm:w-[300px]"
            />
          </div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <h2 data-rv className={cn(H2, "max-w-[12ch]")}>
            Ve cuánto ahorras, siempre.
          </h2>
          <ul className="mt-10 flex flex-col gap-3 sm:mt-14">
            {SAVINGS.map(({ Icon, title, text }, i) => (
              <li
                key={title}
                data-rv
                style={d(i * 90)}
                className="flex items-start gap-5 rounded-[24px] bg-[var(--surface)] p-5 sm:p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--iris)] shadow-[0_8px_20px_-12px_rgba(11,18,32,0.3)]">
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-[var(--muted)]">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Planes ---------- */

const FREE = [
  "Crear tu cuenta y verificar tu perfil",
  "Ver los beneficios y comercios aliados",
  "Guardar favoritos y recibir avisos",
];
const MEMBER = [
  "Usar todos los beneficios con tu código QR",
  "Tu ahorro del mes y el total, al día",
  "Recibo de cada pago",
  "Sin cargos automáticos: tú decides cuándo renovar",
];

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    unit: "",
    note: "Para conocer el club antes de pagar.",
    features: FREE,
    cta: "Crear cuenta gratis",
  },
  {
    name: "Anual",
    price: "$150",
    unit: "/año",
    badge: "2 meses gratis",
    note: "Un solo pago por 12 meses. Equivale a $12.50 al mes: ahorras $30.",
    features: MEMBER,
    cta: "Empezar con el plan anual",
    featured: true,
  },
  {
    name: "Mensual",
    price: "$15",
    unit: "/mes",
    note: "Pagas mes a mes con Yappy. Sin cargos automáticos.",
    features: MEMBER,
    cta: "Empezar con el plan mensual",
  },
];

function Pricing() {
  return (
    <section id="planes" className={SECTION}>
      <div className={CONTAINER}>
        <h2 data-rv className={cn(H2, "text-center")}>
          Planes
        </h2>
        <div className="mx-auto mt-12 grid max-w-[1080px] items-stretch gap-3 sm:mt-20 md:grid-cols-3 md:gap-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              data-rv
              style={d(i * 90)}
              className={cn(
                "relative flex flex-col rounded-[30px] p-7 sm:p-8",
                plan.featured ? "rpx-featured md:-my-6 md:py-12" : "bg-[var(--surface)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.badge && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/25">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-[-0.045em] sm:text-[3.5rem]">{plan.price}</span>
                {plan.unit && (
                  <span className={cn("text-base", plan.featured ? "text-white/70" : "text-[var(--muted)]")}>
                    {plan.unit}
                  </span>
                )}
              </p>
              <p
                className={cn(
                  "mt-3 min-h-[3rem] text-[15px] leading-relaxed",
                  plan.featured ? "text-white/80" : "text-[var(--muted)]",
                )}
              >
                {plan.note}
              </p>
              <ul
                className={cn(
                  "mt-7 flex flex-1 flex-col gap-3.5 border-t pt-7 text-[15px]",
                  plan.featured ? "border-white/20" : "border-[var(--line)]",
                )}
              >
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        plan.featured ? "bg-white text-[var(--iris)]" : "bg-[var(--ink)] text-white",
                      )}
                    >
                      <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span className={plan.featured ? "text-white" : undefined}>{f}</span>
                  </li>
                ))}
              </ul>
              <Cta
                href="/register"
                tone={plan.featured ? "white" : "dark"}
                className="mt-9 w-full gap-3 pl-6 text-[14px]"
              >
                {plan.cta}
              </Cta>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Manifesto />
      <Benefits />
      <HowItWorks />
      <AppShowcase />
      <Savings />
      <Pricing />
      <JoinCta />
    </SiteShell>
  );
}
