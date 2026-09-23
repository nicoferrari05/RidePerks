import Link from "next/link";
import HeroBackdrop from "@/components/landing/HeroBackdrop";
import PillLink from "@/components/landing/PillLink";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 pb-20 pt-28 text-center sm:px-6 sm:pb-16 sm:pt-32">
        <h1 className="lp-enter max-w-5xl text-balance text-[clamp(3rem,10.5vw,8rem)] font-medium leading-[1.02] tracking-[-0.045em] text-lp-fg">
          Tu trabajo rinde más.
        </h1>

        <p style={{ "--enter-delay": "90ms" } as React.CSSProperties} className="lp-enter mt-5 max-w-xs text-pretty text-lg text-lp-muted sm:mt-6 sm:max-w-md sm:text-xl">
          Descuentos reales en gasolina, comida y taller.
        </p>

        <div style={{ "--enter-delay": "180ms" } as React.CSSProperties} className="lp-enter mt-9 flex w-full flex-col items-center gap-3 sm:mt-10 sm:w-auto sm:flex-row">
          <PillLink href="/register" className="w-full max-w-xs sm:w-auto">
            Crear mi cuenta
          </PillLink>
          <Link
            href="/#como-funciona"
            className="lp-glass w-full max-w-xs rounded-full px-6 py-3.5 text-center text-[15px] sm:w-auto font-medium text-lp-fg transition-transform duration-[160ms] ease-snappy active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg"
          >
            Cómo funciona
          </Link>
        </div>
      </div>
    </section>
  );
}
