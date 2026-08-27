export default function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(207,59,24,0.16), transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span
          data-reveal
          className="font-mono text-xs font-medium tracking-[0.14em] text-ember"
        >
          SOBRE RIDEPERKS
        </span>
        <h1
          data-reveal
          className="mt-5 text-balance text-[clamp(2.5rem,6vw,4.25rem)] font-bold leading-[1.02] tracking-tight text-navy"
        >
          Un club de beneficios para{" "}
          <em className="font-accent italic text-ember">conductores.</em>
        </h1>
        <div
          data-reveal
          className="mx-auto mt-6 flex max-w-xl flex-col gap-4 text-pretty text-lg text-ink/75 sm:text-xl"
        >
          <p>
            RidePerks reúne descuentos y beneficios pensados para personas que trabajan manejando
            con plataformas como Uber, InDrive y PedidosYa.
          </p>
          <p>No buscamos conseguirte más viajes. Buscamos ayudarte a gastar menos mientras trabajas.</p>
        </div>
      </div>
    </section>
  );
}
