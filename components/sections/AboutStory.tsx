export default function AboutStory() {
  return (
    <section className="px-5 sm:px-6">
      <div
        data-reveal
        className="mx-auto grid max-w-7xl gap-10 rounded-[32px] bg-lp-band px-7 py-14 text-lp-band-fg sm:px-14 sm:py-20 lg:grid-cols-[1fr_1.15fr]"
      >
        <h2 className="text-balance text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.035em]">
          Manejar ya tiene suficientes gastos.
        </h2>
        <div className="flex flex-col gap-5 text-pretty text-[17px] leading-relaxed text-lp-band-muted">
          <p>
            Gasolina, comida, mantenimiento, llantas, farmacia. Son gastos que
            salen directo de lo que ganas cada día y que no puedes dejar de
            hacer.
          </p>
          <p>
            RidePerks no te promete más viajes ni un algoritmo más inteligente.
            Hacemos algo más simple: nos aliamos con comercios para que pagues
            menos en lo que ya ibas a comprar.
          </p>
          <p className="text-lp-band-fg">
            Una sola membresía te da acceso a todos los beneficios activos. Sin
            puntos que acumular y sin cambiar la forma en la que trabajas.
          </p>
        </div>
      </div>
    </section>
  );
}
