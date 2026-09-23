export default function AboutHero() {
  return (
    <section className="px-5 pb-16 pt-36 sm:px-6 sm:pb-24 sm:pt-48">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="lp-enter text-balance text-[clamp(2.75rem,7.5vw,6rem)] font-medium leading-[0.95] tracking-[-0.045em]">
          Un club de beneficios para conductores.
        </h1>
        <p
          style={{ "--enter-delay": "90ms" } as React.CSSProperties}
          className="lp-enter mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-lp-muted sm:text-xl"
        >
          RidePerks es una membresía para quienes trabajan manejando con Uber,
          InDrive o PedidosYa en Panamá. Negociamos descuentos con comercios
          locales para que lo que ya gastas cada semana rinda más.
        </p>
      </div>
    </section>
  );
}
