import { MapPin } from "lucide-react";

// Placeholder for the future map of partner businesses (Beneficios →
// Comercios). There is no real map yet: a hand-drawn outline of streets, the
// bay and a few pins sits blurred behind a "Próximamente" note. Colors come
// from the platform tokens, so it follows light and dark mode.
const pins: [number, number][] = [
  [92, 62],
  [178, 96],
  [252, 58],
  [128, 150],
  [222, 132],
];

export default function MapPreview() {
  return (
    <section className="rp-map-soon" aria-labelledby="rp-map-soon-title">
      <svg
        className="rp-map-art"
        viewBox="0 0 360 220"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="360" height="220" fill="var(--rp-map-land)" />
        <path
          d="M170 220 C210 182 252 164 296 146 C326 134 346 118 360 108 L360 220 Z"
          fill="var(--rp-map-water)"
        />
        <ellipse cx="58" cy="168" rx="38" ry="24" fill="var(--rp-map-park)" />
        <rect
          x="268"
          y="14"
          width="60"
          height="34"
          rx="10"
          fill="var(--rp-map-park)"
        />
        <g
          fill="none"
          stroke="var(--rp-map-road)"
          strokeLinecap="round"
          strokeWidth="3"
        >
          <path d="M0 34 L360 6" />
          <path d="M0 112 L170 120" />
          <path d="M40 0 L58 220" />
          <path d="M176 0 L168 220" />
          <path d="M300 0 L286 140" />
          <path d="M0 196 L150 204" />
          <path d="M210 92 L360 82" />
        </g>
        <g
          fill="none"
          stroke="var(--rp-map-road)"
          strokeLinecap="round"
          strokeWidth="7"
        >
          <path d="M150 220 C196 176 246 158 296 138 C326 126 346 110 360 100" />
          <path d="M0 74 C80 86 160 104 240 66 L360 22" />
          <path d="M112 0 L138 220" />
          <path d="M236 0 L222 150" />
        </g>
        {pins.map(([x, y]) => (
          <g key={x + "-" + y}>
            <circle cx={x} cy={y} r="13" fill="var(--rp-green-soft)" />
            <circle cx={x} cy={y} r="6" fill="var(--rp-text)" />
            <circle cx={x} cy={y} r="2.5" fill="var(--rp-green-line)" />
          </g>
        ))}
      </svg>
      <div className="rp-map-note">
        <span className="rp-map-icon">
          <MapPin aria-hidden="true" />
        </span>
        <span className="rp-badge good">Próximamente</span>
        <h2 id="rp-map-soon-title">Mapa de comercios</h2>
        <p>Pronto verás aquí todos los comercios aliados cerca de ti.</p>
      </div>
    </section>
  );
}
