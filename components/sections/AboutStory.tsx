export default function AboutStory() {
  return (
    <section className="border-b border-white/10 bg-navy px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div data-reveal>
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            POR QUÉ EXISTIMOS
          </span>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
            Manejar para Uber, InDrive o PedidosYa ya es el trabajo duro.
          </h2>
        </div>

        <div
          data-reveal
          className="mt-8 flex flex-col gap-5 text-pretty text-[17px] leading-relaxed text-bone/70 sm:text-lg"
        >
          <p>
            Gasolina, comida en la calle, mantenimiento del carro o la moto, un chequeo médico que
            se sigue posponiendo: todo eso sale del mismo bolsillo que llenás viaje a viaje.
            Cuando sube el precio de la gasolina, no sube tu tarifa. El margen que te queda es el
            que absorbe todo.
          </p>
          <p>
            RidePerks nació para pelear esa parte del problema. Negociamos descuentos reales con
            comercios aliados (gasolineras, restaurantes, talleres, servicios de salud) y se los
            pasamos directo a los conductores que se registran. No es una promesa de más viajes ni
            un algoritmo nuevo. Es plata que dejás de gastar en lo que ya ibas a gastar de todos
            modos.
          </p>
          <p className="text-bone">
            Tú manejas para ganar más.{" "}
            <em className="font-accent italic text-ember">RidePerks te ayuda a gastar menos.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
