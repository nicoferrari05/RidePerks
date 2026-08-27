export default function AboutStory() {
  return (
    <section className="border-b border-white/10 bg-navy px-6 py-14 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div data-reveal>
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            POR QUÉ EXISTIMOS
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
            Manejar ya tiene suficientes gastos.
          </h2>
        </div>

        <div
          data-reveal
          className="mt-8 flex flex-col gap-5 text-pretty text-[17px] leading-relaxed text-bone/70 sm:text-lg"
        >
          <p>
            Gasolina, comida, mantenimiento, llantas, farmacia… son gastos que salen de lo que
            ganas todos los días.
          </p>
          <p>Por eso creamos RidePerks.</p>
          <p>
            Nos aliamos con comercios para conseguir beneficios que realmente le sirvan al
            conductor en su día a día. Tú te registras, accedes a los beneficios disponibles y
            ahorras en gastos que probablemente ya ibas a tener.
          </p>
          <p>Sin puntos. Sin complicaciones. Sin cambiar la forma en la que trabajas.</p>
          <p className="text-bone">
            Tú manejas para ganar.{" "}
            <em className="font-accent italic text-ember">RidePerks te ayuda a gastar menos.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
