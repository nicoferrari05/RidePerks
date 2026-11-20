import PhoneFrame from "@/components/landing/PhoneFrame";

// Real screens of the driver app, in the order of one redemption. On phones
// they scroll sideways (snap); on wide screens they sit in a staggered row.
const SCREENS = [
  {
    n: "01",
    title: "Encuentra",
    text: "Busca por categoría o mira qué está abierto ahora.",
    src: "/landing/app-beneficios.png",
    alt: "Lista de beneficios con buscador y filtros: combustible, almuerzos, cambio de aceite y medicinas.",
  },
  {
    n: "02",
    title: "Elige",
    text: "Condiciones, límites y horario claros antes de ir.",
    src: "/landing/app-detalle.png",
    alt: "Detalle de un beneficio: $0.10 menos por galón, abierto hasta las 22:00.",
  },
  {
    n: "03",
    title: "Muestra tu código",
    text: "Un QR de un solo uso que vence en dos minutos.",
    src: "/landing/app-qr.png",
    alt: "Código QR para mostrar en el comercio, con cuenta regresiva y código corto de respaldo.",
  },
  {
    n: "04",
    title: "Listo",
    text: "El comercio confirma y tu ahorro queda registrado.",
    src: "/landing/app-confirmado.png",
    alt: "Pantalla de beneficio confirmado: el comercio lo registró en tu actividad.",
  },
];

export default function AppShowcase() {
  return (
    <section id="app" className="scroll-mt-24 py-16 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            data-reveal
            className="max-w-xl text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
          >
            Todo desde tu teléfono.
          </h2>
          <p data-reveal className="max-w-sm text-pretty text-lg text-lp-muted">
            Del beneficio al ahorro en cuatro toques. Sin cupones de papel ni
            tarjetas.
          </p>
        </div>
      </div>

      <ol className="lp-rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:mt-16 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
        {SCREENS.map((s, i) => (
          <li
            key={s.n}
            data-reveal
            className={
              "w-[68vw] max-w-[280px] shrink-0 snap-center lg:w-auto lg:max-w-none " +
              (i % 2 === 1 ? "lg:mt-14" : "")
            }
          >
            <PhoneFrame
              src={s.src}
              alt={s.alt}
              sizes="(min-width: 1024px) 280px, 68vw"
            />
            <div className="mt-5 flex gap-3 px-1">
              <span className="font-mono text-xs tracking-[0.14em] text-lp-muted">
                {s.n}
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.01em]">
                  {s.title}
                </h3>
                <p className="mt-1 text-[15px] text-lp-muted">{s.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-4 max-w-7xl px-5 text-xs text-lp-muted sm:px-6 lg:mt-20">
        Pantallas de ejemplo: los comercios y montos son ilustrativos.
      </p>
    </section>
  );
}
