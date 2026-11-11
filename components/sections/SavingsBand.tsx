import { BellRing, ChartNoAxesColumn, Receipt } from "lucide-react";
import PhoneFrame from "@/components/landing/PhoneFrame";

const POINTS = [
  {
    Icon: BellRing,
    title: "Un aviso cada vez que ahorras",
    text: "Sabes al momento cuánto te descontaron y dónde.",
  },
  {
    Icon: ChartNoAxesColumn,
    title: "Tu ahorro del mes y el total",
    text: "Y cuántas veces tu membresía ya se pagó sola.",
  },
  {
    Icon: Receipt,
    title: "Historial y recibos",
    text: "Cada uso y cada pago, guardados en tu cuenta.",
  },
];

export default function SavingsBand() {
  return (
    <section className="px-3 sm:px-4">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 overflow-hidden rounded-[28px] bg-lp-band px-6 pt-14 text-lp-band-fg sm:rounded-[36px] sm:px-12 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:px-20 lg:py-0">
        <div className="lg:py-24">
          <h2
            data-reveal
            className="max-w-md text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
          >
            Ve cuánto ahorras, siempre.
          </h2>
          <ul className="mt-10 flex flex-col gap-7 sm:mt-12">
            {POINTS.map(({ Icon, title, text }) => (
              <li key={title} data-reveal className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lp-accent text-lp-accent-fg">
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-lp-band-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="mx-auto w-full max-w-[320px] lg:mt-20 lg:self-end">
          <div className="lp-band-phone">
            <PhoneFrame
              src="/landing/app-aviso.png"
              alt="Notificación de RidePerks: usaste descuento en combustible y ahorraste $2.00. Tu ahorro del mes subió a $34.50."
              sizes="320px"
              className="shadow-[0_0_0_1px_rgba(239,255,200,0.14)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
