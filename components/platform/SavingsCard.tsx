"use client";
import { useState } from "react";
import { money, MEMBERSHIP_PRICE_USD } from "@/lib/platform/types";

type Savings = { total: number; count: number };

// Inicio's one dark card: what the driver has saved, this month or in total,
// measured against the membership price.
export default function SavingsCard({
  monthly,
  total,
}: {
  monthly: Savings;
  total: Savings;
}) {
  const [tab, setTab] = useState<"monthly" | "total">("monthly");
  const active = tab === "monthly" ? monthly : total;
  const ratio = active.total / MEMBERSHIP_PRICE_USD;
  const progressPct = Math.max(0, Math.min(ratio, 1)) * 100;
  return (
    <section className="rp-hero" aria-label="Ahorro registrado">
      <div className="rp-segmented" role="tablist" aria-label="Periodo">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "monthly"}
          onClick={() => setTab("monthly")}
        >
          Este mes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "total"}
          onClick={() => setTab("total")}
        >
          Total
        </button>
      </div>
      <p className="rp-hero-label">Ahorraste</p>
      <p className="rp-hero-value">{money(active.total)}</p>
      <p className="rp-hero-label">
        {active.count}{" "}
        {active.count === 1 ? "beneficio usado" : "beneficios usados"}
      </p>
      <div
        className="rp-progress"
        role="progressbar"
        aria-label="Avance hacia el precio de la membresía"
        aria-valuenow={Math.round(progressPct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="rp-progress-bar" style={{ width: progressPct + "%" }} />
      </div>
      <p className="rp-progress-label">
        {ratio >= 1 ? (
          <>
            Tu membresía se pagó sola <strong>{ratio.toFixed(1)}x</strong>.
          </>
        ) : (
          <>
            Te faltan{" "}
            <strong>{money(MEMBERSHIP_PRICE_USD - active.total)}</strong> para
            que tu membresía se pague sola.
          </>
        )}
      </p>
    </section>
  );
}
