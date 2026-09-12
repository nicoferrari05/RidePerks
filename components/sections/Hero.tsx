import GradientWaves from "@/components/GradientWaves";
import Counter from "@/components/Counter";
import LogoMark from "@/components/LogoMark";
import Link from "next/link";
import { Fuel, UtensilsCrossed, Wrench, ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      {/* Background: brand-toned, near-static (barely-there drift, no
          mouse parallax, no grain) so it stays a backdrop, not a
          distraction. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <GradientWaves
          horizonColor="#F5F1EA"
          waveColor="#041429"
          crestColor="#CF3B18"
          speed={0.05}
          amplitude={2.0}
          waveScale={0.5}
          waveRatio={0.85}
          swell={24}
          turbulence={12}
          tilt={1.18}
          zoom={1.05}
          height={5.9}
          fogDepth={12}
          detail="medium"
          brightness={1.0}
          opacity={0.85}
          mouseInteraction={false}
          grain={false}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_55%,var(--color-paper)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-14 pt-28 sm:pb-28 sm:pt-40 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            CLUB DE CONDUCTORES · PANAMÁ
          </span>

          <h1 className="mt-5 text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-navy">
            Tu trabajo rinde{" "}
            <em className="font-accent italic text-ember">más.</em>
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-lg text-ink/80 sm:text-xl">
            Descuentos reales en gasolina, comida y mantenimiento. En lo que ya
            gastas cada semana.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="cursor-pointer rounded-full bg-ember px-7 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              Únete a la lista
            </a>
            <Counter />
          </div>
        </div>

        <div
          data-reveal
          className="hidden w-full max-w-[420px] lg:ml-auto lg:block"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-navy text-bone shadow-[0_30px_70px_-28px_rgba(4,20,41,0.45)]">
            <div className="flex items-center justify-between border-b border-white/15 px-7 py-6">
              <LogoMark size="sm" />
              <span className="rounded-full border border-white/25 px-3 py-1 text-xs font-medium">
                Club de conductores
              </span>
            </div>
            <div className="px-7 py-8">
              <h2 className="max-w-[12ch] text-[2.3rem] font-semibold leading-[1.12] tracking-tight">
                Tus beneficios, a mano.
              </h2>
              <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-[#c4cbd4]">
                Un solo pase para las paradas de todos los días.
              </p>
              <div className="mt-8 flex gap-6 border-t border-white/15 pt-6">
                {[
                  { Icon: Fuel, label: "Gasolina" },
                  { Icon: UtensilsCrossed, label: "Comida" },
                  { Icon: Wrench, label: "Taller" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col gap-2 text-sm">
                    <Icon
                      size={24}
                      strokeWidth={1.8}
                      className="text-ember"
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/register"
              className="flex items-center justify-between bg-ember px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-ember-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-white"
            >
              Crear mi cuenta
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-4 text-right text-xs text-navy/75">
            Para quienes mueven Panamá.
          </p>
        </div>
      </div>
    </section>
  );
}
