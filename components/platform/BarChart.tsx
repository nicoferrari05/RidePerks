// Single-series column chart in plain HTML/CSS (no chart library): thin
// columns with a 4px rounded top on one baseline, the tallest one labeled,
// a hover/focus tooltip on every column and the same numbers as a table.
// One series, so no legend: the heading names what is plotted. Columns use
// --rp-chart-bar (validated green per theme) and text stays in text colors.

export type Bar = { label: string; value: number; tip?: string };

export default function BarChart({
  bars,
  title,
  unit,
  axis,
}: {
  bars: Bar[];
  /** Names the series; also the figure's accessible name. */
  title: string;
  /** Unit for tooltips and the table, e.g. "usos". */
  unit: string;
  /** Indexes of the bars whose label shows under the axis. */
  axis?: number[];
}) {
  const max = Math.max(...bars.map((b) => b.value), 0);
  const peak = max > 0 ? bars.findIndex((b) => b.value === max) : -1;
  const shown = new Set(
    axis ?? [0, Math.floor((bars.length - 1) / 2), bars.length - 1],
  );
  const total = bars.reduce((s, b) => s + b.value, 0);
  return (
    <figure className="rp-chart">
      <figcaption>
        <span>{title}</span>
        <strong>
          {total} {unit}
        </strong>
      </figcaption>
      <div
        className="rp-chart-plot"
        style={{ "--bars": bars.length } as React.CSSProperties}
      >
        {bars.map((b, i) => (
          <div
            key={b.label + i}
            className="rp-chart-col"
            tabIndex={0}
            aria-label={(b.tip || b.label) + ": " + b.value + " " + unit}
          >
            {i === peak && <span className="rp-chart-peak">{b.value}</span>}
            <span
              className="rp-chart-bar"
              style={{ height: max ? (b.value / max) * 100 + "%" : "0%" }}
            />
            <span className="rp-chart-tip" role="tooltip">
              {b.tip || b.label}: <strong>{b.value}</strong> {unit}
            </span>
          </div>
        ))}
      </div>
      <div className="rp-chart-axis" aria-hidden="true">
        {bars.map((b, i) => (
          <span key={b.label + i}>{shown.has(i) ? b.label : ""}</span>
        ))}
      </div>
      <details className="rp-chart-table">
        <summary>Ver como tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col">{unit[0].toUpperCase() + unit.slice(1)}</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((b, i) => (
              <tr key={b.label + i}>
                <td>{b.tip || b.label}</td>
                <td>{b.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

const short = new Intl.DateTimeFormat("es-PA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const long = new Intl.DateTimeFormat("es-PA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/**
 * Turns per-day counts ("YYYY-MM-DD" → n, days without uses missing) into
 * columns from `from` to `until` (Panama dates): one per day, or one per
 * week (starting Monday) when `weekly`.
 */
export function dayBars(
  counts: { day: string; value: number }[],
  from: string,
  until: string,
  weekly: boolean,
): Bar[] {
  const byDay = new Map(counts.map((c) => [c.day, Number(c.value) || 0]));
  const bars: Bar[] = [];
  const start = new Date(from + "T00:00:00Z");
  const end = new Date(until + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const value = byDay.get(key) || 0;
    if (!weekly) {
      bars.push({ label: short.format(d), tip: long.format(d), value });
      continue;
    }
    const monday = d.getUTCDay() === 1;
    if (monday || bars.length === 0)
      bars.push({
        label: short.format(d),
        tip: "Semana del " + short.format(d),
        value,
      });
    else bars[bars.length - 1].value += value;
  }
  return bars;
}
