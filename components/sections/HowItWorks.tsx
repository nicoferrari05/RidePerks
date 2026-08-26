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

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} data-reveal className="border-t border-line pt-6">
              <span className="font-mono text-sm text-ember">{step.n}</span>
              <h3 className="mt-3 text-xl font-semibold text-navy">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
