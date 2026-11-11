// Slow, endless strip of facts about the club. Pure CSS (transform only);
// stops for prefers-reduced-motion. The list is rendered twice so the loop
// is seamless; the copy is hidden from assistive tech.
const ITEMS = [
  "Combustible",
  "Comida",
  "Taller",
  "Salud",
  "Pago con Yappy",
  "Sin cargos automáticos",
  "Código QR de un solo uso",
  "Hecho en Panamá",
];

export default function Marquee() {
  return (
    <div className="lp-marquee relative overflow-hidden border-y border-lp-line py-4 sm:py-5">
      <p className="sr-only">{ITEMS.join(", ")}</p>
      <div aria-hidden="true" className="lp-marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-6 pr-6 text-lg font-medium tracking-[-0.02em] text-lp-fg sm:gap-8 sm:pr-8 sm:text-2xl"
              >
                {item}
                <span className="h-2 w-2 rounded-full bg-lp-accent" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
