const STEPS = [
  { n: "01", title: "Únete a la lista", copy: "Tu nombre y correo. Invita a otros y sube en la fila." },
  { n: "02", title: "Te avisamos", copy: "Por correo o WhatsApp, apenas la app esté lista." },
  { n: "03", title: "Ahorra", copy: "Muestra tu QR RidePerks en comercios aliados." },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-line px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="max-w-xl">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            CÓMO FUNCIONA
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            Tres pasos. Ya.
          </h2>
        </div>

        {/* Connected stepper instead of a generic 3-up card row: a single
            line runs through the numbered nodes, content sits offset
            below each one. */}
        <div data-reveal className="relative mt-20">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-line sm:block"
            aria-hidden="true"
          />
          <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                    i === 0 ? "bg-ember text-white" : "border border-line bg-paper text-navy"
                  }`}
                >
                  {step.n}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 max-w-[26ch] text-[15px] leading-relaxed text-mute">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
