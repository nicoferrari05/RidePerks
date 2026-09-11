// Real, single membership plan: $15.00/month, manual renewal via Yappy (see
// YAPPY.md / app/driver/membership/page.tsx). Previously a blurred
// "coming soon" preview with illustrative tiered plans — replaced now that a
// real plan/price exists, per PRODUCT.md's "never invent numbers" principle.
import Link from "next/link";
import { CheckIcon } from "@/components/icons";

const FEATURES = [
  "Acceso a todos los beneficios activos: combustible, comida, taller y salud.",
  "Un mes de acceso desde la confirmación del pago.",
  "Renovación manual con Yappy — vos decidís cuándo pagar, sin cargos automáticos.",
  "Renovás antes del vencimiento y el mes se suma al tiempo que te queda.",
];

export default function Pricing() {
  return (
    <section id="planes" className="scroll-mt-20 relative overflow-hidden border-b border-white/10 bg-navy px-6 py-16 sm:py-32">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, rgba(207,59,24,0.28), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            PLANES Y PRECIOS
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Un precio. Sin <em className="font-accent italic text-ember">sorpresas.</em>
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-bone/60">
            Una sola membresía, con acceso a todos los beneficios activos.
          </p>
        </div>

        <div data-reveal className="mx-auto mt-10 max-w-md sm:mt-16">
          <div className="flex flex-col rounded-2xl border border-ember/60 bg-navy-2 p-8">
            <h3 className="text-lg font-semibold text-bone">Membresía RidePerks</h3>
            <p className="mt-2 text-sm text-bone/50">
              Para conductores verificados de Uber, InDrive y PedidosYa.
            </p>
            <div className="mt-6 flex items-baseline gap-1 text-bone">
              <span className="text-4xl font-semibold tracking-tight">$15.00</span>
              <span className="text-sm text-bone/50">/ mes</span>
            </div>
            <div className="mt-6 h-px w-full bg-white/10" />
            <ul className="mt-6 flex flex-col gap-3 text-sm text-bone/70">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 cursor-pointer rounded-full bg-ember px-6 py-3 text-center text-sm font-semibold text-white transition-[transform,background-color] duration-150 ease-out hover:bg-ember-2 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            >
              Únete y empieza a ahorrar
            </Link>
            <p className="mt-4 text-center text-xs text-bone/40">
              Necesitás verificar tu perfil de conductor para canjear beneficios.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
