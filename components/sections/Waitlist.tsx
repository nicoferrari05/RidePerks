import WaitlistForm from "@/components/WaitlistForm";

export default function Waitlist() {
  return (
    <section id="waitlist" className="scroll-mt-20 bg-navy px-6 py-20 sm:py-28">
      <div data-reveal className="mx-auto flex max-w-6xl flex-col items-start gap-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            ACCESO ANTICIPADO
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-bone sm:text-5xl">
            Anótate a la lista de espera.
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-bone/60">
            Te avisamos apenas la app esté lista. Invita a otros conductores para subir en la fila.
          </p>
        </div>

        <WaitlistForm tone="dark" />
      </div>
    </section>
  );
}
