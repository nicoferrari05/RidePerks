const BENEFITS = [
  { label: "Combustible", value: "20%", bg: "bg-sol", text: "text-navy" },
  { label: "Comida", value: "$5", bg: "bg-verde", text: "text-white" },
  { label: "Taller", value: "15%", bg: "bg-ember", text: "text-white" },
  { label: "Salud", value: "10%", bg: "bg-navy", text: "text-bone" },
];

export default function Benefits() {
  return (
    <section className="border-b border-line bg-bone px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="max-w-xl">
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-ember">
            BENEFICIOS
          </span>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            Una membresía. Todo incluido.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ label, value, bg, text }) => (
            <div
              key={label}
              data-reveal
              className={`rounded-2xl p-6 shadow-[0_16px_40px_-24px_rgba(4,20,41,0.4)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_rgba(4,20,41,0.45)] ${bg} ${text}`}
            >
              <div className="font-mono text-[11px] font-medium tracking-[0.14em] opacity-80">
                {label.toUpperCase()}
              </div>
              <div className="mt-3 text-4xl font-bold tracking-tight">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
