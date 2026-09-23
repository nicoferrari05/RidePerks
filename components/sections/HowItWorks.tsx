import { UserRoundPlus, ShieldCheck, QrCode } from "lucide-react";
import InfoCard from "@/components/landing/InfoCard";

const STEPS = [
  {
    n: "01",
    title: "Crea tu cuenta",
    Icon: UserRoundPlus,
    detail:
      "Gratis y en un minuto: tu nombre, correo, WhatsApp y la plataforma en la que trabajas.",
  },
  {
    n: "02",
    title: "Verifica tu perfil",
    Icon: ShieldCheck,
    detail:
      "Sube una captura de tu perfil de Uber, InDrive o PedidosYa. El equipo la revisa y aprueba tu cuenta.",
  },
  {
    n: "03",
    title: "Muestra tu código",
    Icon: QrCode,
    detail:
      "En el comercio generas un QR de un solo uso. Lo escanean, confirman el descuento y tu ahorro queda registrado.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 px-5 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <h2
          data-reveal
          className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Tres pasos.
        </h2>

        <ol className="mt-10 grid gap-3 sm:mt-16 sm:gap-4 md:grid-cols-3">
          {STEPS.map(({ n, title, Icon, detail }, i) => (
            <li key={n} data-reveal>
              <InfoCard
                icon={<Icon size={34} strokeWidth={1.5} aria-hidden="true" />}
                label={n}
                title={title}
                detail={detail}
                highlight={i === 0}
                className="h-full"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
