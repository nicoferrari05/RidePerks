import GradientWaves from "@/components/GradientWaves";
import Counter from "@/components/Counter";
import { SteeringWheelIcon } from "@/components/icons";

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

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-32 sm:pb-28 sm:pt-40 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            CLUB DE CONDUCTORES · PANAMÁ
          </span>

          <h1 className="mt-5 text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-navy">
            Tu trabajo rinde <em className="font-accent italic text-ember">más.</em>
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-lg text-ink/80 sm:text-xl">
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

        {/* Membership card — the same "plate" motif from the brand
            identity board, brought into the hero so the split isn't just
            text-over-background. */}
        <div data-reveal className="mx-auto w-full max-w-[340px] lg:mx-0 lg:ml-auto">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-navy p-7 text-bone shadow-[0_40px_90px_-30px_rgba(4,20,41,0.55)]">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-90"
              style={{ background: "radial-gradient(circle, rgba(207,59,24,0.55), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ember">
                  <SteeringWheelIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-mono text-[10px] tracking-[0.15em] text-bone/50">
                  N° 001 · FOUNDERS
                </span>
              </div>

              <div>
                <span className="font-mono text-[11px] tracking-[0.15em] text-bone/50">MEMBER</span>
                <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
                  Carlos
                  <br />
                  Rodríguez
                </h2>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.1em] text-bone/50">
                      DRIVER · UBER · INDRIVE
                    </div>
                    <div className="mt-1 font-mono text-sm">PA-0420-2601</div>
                  </div>
                  <span className="font-accent italic text-bone/70">rideperks.app</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
