const STEPS = [
  {
    title: "Eliges el beneficio",
    copy: "Revisas el comercio, el descuento y sus condiciones desde la app.",
  },
  {
    title: "Generas tu código",
    copy: "Cuando te atienden, generas un QR de un solo uso.",
  },
  {
    title: "El comercio lo confirma",
    copy: "Lo escanean, ven el beneficio y confirman el descuento.",
  },
  {
    title: "Queda en tu historial",
    copy: "El uso se registra al instante, para ti y para el comercio.",
  },
];

export default function AboutRedemption() {
  return (
    <section className="px-5 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2
          data-reveal
          className="max-w-2xl text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em]"
        >
          Así se usa un beneficio.
        </h2>
        <ol className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              className="flex min-h-[220px] flex-col justify-between rounded-[28px] border border-lp-line bg-lp-surface p-7"
            >
              <span className="font-mono text-sm text-lp-muted">0{i + 1}</span>
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-lp-muted">
                  {step.copy}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
