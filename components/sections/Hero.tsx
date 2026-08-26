import GradientWaves from "@/components/GradientWaves";
import WaitlistForm from "@/components/WaitlistForm";
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
          waveColor="#0F1B3D"
          crestColor="#E8502A"
          speed={0.05}
          amplitude={1.4}
          waveScale={0.5}
          waveRatio={0.85}
          swell={16}
          turbulence={8}
          tilt={1.18}
          zoom={1.05}
          height={5.9}
          fogDepth={12}
          detail="medium"
          brightness={1.0}
          opacity={0.5}
          mouseInteraction={false}
          grain={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/10 via-paper/60 to-paper" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
          PARA CONDUCTORES DE UBER E INDRIVE · PANAMÁ
        </span>

        <h1 className="mt-5 text-[clamp(2.75rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tight text-navy">
          Tu trabajo rinde <em className="font-accent italic text-ember">más.</em>
        </h1>

        <p className="mt-6 max-w-lg text-lg text-ink/80 sm:text-xl">
          Descuentos reales en gasolina, comida y mantenimiento. En lo que ya gastas cada semana.
        </p>

        <div id="waitlist" className="mt-10 w-full scroll-mt-24">
          <WaitlistForm />
        </div>

        <div className="mt-6">
          <Counter />
        </div>
      </div>
    </section>
  );
}
