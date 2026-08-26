import GradientWaves from "@/components/GradientWaves";
import Counter from "@/components/Counter";

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

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
          CLUB DE CONDUCTORES · PANAMÁ
        </span>

        <h1 className="mt-5 text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tight text-navy">
          Tu trabajo rinde <em className="font-accent italic text-ember">más.</em>
        </h1>

        <p className="mt-6 max-w-lg text-lg text-ink/80 sm:text-xl">
          Descuentos reales en gasolina, comida y mantenimiento. En lo que ya gastas cada semana.
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
    </section>
  );
}
