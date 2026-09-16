"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { money, MEMBERSHIP_PRICE_USD } from "@/lib/platform/types";

type Savings = { total: number; count: number };

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
  const paidForItself = ratio >= 1;
  const progressPct = Math.max(0, Math.min(ratio, 1)) * 100;
  return (
    <section className="rp-balance" aria-label="Ahorro registrado">
      <div className="rp-savings-switch" role="tablist" aria-label="Periodo de ahorro">
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
          Ahorro total
        </button>
      </div>
      <p>{tab === "monthly" ? "Tu ahorro registrado este mes" : "Tu ahorro registrado en total"}</p>
      <strong>{money(active.total)}</strong>
      <p>
        {active.count}{" "}
        {active.count === 1 ? "beneficio utilizado" : "beneficios utilizados"}
      </p>
      <div className="rp-progress" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="rp-progress-bar" style={{ width: progressPct + "%" }} />
      </div>
      <p className="rp-progress-label">
        {paidForItself ? (
          <>
            Has recuperado <strong>{ratio.toFixed(1)}x</strong> el precio de tu
            membresía. Tu membresía se pagó sola.
          </>
        ) : (
          <>
            Llevas {money(active.total)} de {money(MEMBERSHIP_PRICE_USD)} en tu
            membresía. Te faltan {money(MEMBERSHIP_PRICE_USD - active.total)} para
            que se pague sola.
          </>
        )}
      </p>
      <div className="rp-balance-foot">
        <span>Solo usos confirmados por comercios</span>
        <Link className="rp-text-link" href="/driver/history">
          Ver historial <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
