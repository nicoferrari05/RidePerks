import Link from "next/link";
import { BadgeCheck, Fuel } from "lucide-react";
import HeroBackdrop from "@/components/landing/HeroBackdrop";
import PillLink from "@/components/landing/PillLink";
import PhoneFrame from "@/components/landing/PhoneFrame";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pt-28 text-center sm:px-6 sm:pt-36">
        <p className="lp-enter lp-glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium text-lp-fg sm:mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-lp-accent" />
          Club de beneficios para conductores en Panamá
        </p>

        <h1
          style={{ "--enter-delay": "60ms" } as React.CSSProperties}
          className="lp-enter max-w-5xl text-balance text-[clamp(3rem,10.5vw,8rem)] font-medium leading-[1.02] tracking-[-0.045em] text-lp-fg"
        >
          Tu trabajo rinde más.
        </h1>

        <p
          style={{ "--enter-delay": "120ms" } as React.CSSProperties}
          className="lp-enter mt-5 max-w-xs text-pretty text-lg text-lp-muted sm:mt-6 sm:max-w-md sm:text-xl"
        >
          Descuentos reales en gasolina, comida y taller, desde tu teléfono.
        </p>

        <div
          style={{ "--enter-delay": "180ms" } as React.CSSProperties}
          className="lp-enter mt-9 flex w-full flex-col items-center gap-3 sm:mt-10 sm:w-auto sm:flex-row"
        >
          <PillLink href="/register" className="w-full max-w-xs sm:w-auto">
            Crear mi cuenta
          </PillLink>
          <Link
            href="/#como-funciona"
            className="lp-glass w-full max-w-xs rounded-full px-6 py-3.5 text-center text-[15px] font-medium text-lp-fg transition-transform duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg sm:w-auto"
          >
            Cómo funciona
          </Link>
        </div>

        {/* The app itself, rising out of the fold, with two moments of a
            real redemption floating beside it. */}
        <div
          style={{ "--enter-delay": "260ms" } as React.CSSProperties}
          className="lp-enter relative mt-14 w-full max-w-[300px] sm:mt-20 sm:max-w-[340px]"
        >
          <div className="lp-hero-phone">
            <PhoneFrame
              src="/landing/app-inicio.png"
              alt="Pantalla de inicio de la app RidePerks: ahorraste $32.50 este mes con 11 beneficios usados."
              sizes="(min-width: 640px) 340px, 300px"
              priority
            />
          </div>

          <div className="lp-float lp-glass absolute -left-4 top-[22%] flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4 text-left shadow-lg sm:-left-44 sm:top-[30%] sm:py-3 sm:pl-3 sm:pr-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lp-accent text-lp-accent-fg sm:h-10 sm:w-10">
              <Fuel size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold leading-tight text-lp-fg sm:text-sm">
                Ahorraste $2.00
              </span>
              <span className="text-xs text-lp-muted">en combustible</span>
            </span>
          </div>

          <div
            style={{ animationDelay: "-3s" }}
            className="lp-float lp-glass absolute -right-4 top-[52%] flex items-center gap-2.5 rounded-2xl py-2.5 pl-2.5 pr-4 text-left shadow-lg sm:-right-40 sm:top-[46%] sm:py-3 sm:pl-3 sm:pr-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lp-fg text-lp-bg sm:h-10 sm:w-10">
              <BadgeCheck size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold leading-tight text-lp-fg sm:text-sm">
                Beneficio confirmado
              </span>
              <span className="text-xs text-lp-muted">queda en tu actividad</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
