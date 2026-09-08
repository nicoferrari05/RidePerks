import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import {
  requireDriver,
  getBenefits,
  getRedemptions,
  getMonthlySavings,
} from "@/lib/platform/data";
import { money, dateLabel, platforms, statuses } from "@/lib/platform/types";
import { BenefitCard, Empty, Logo } from "@/components/platform/ui";
export default async function Page() {
  const p = await requireDriver();
  const [benefits, history, monthly] = await Promise.all([
    getBenefits(),
    getRedemptions(p.id),
    getMonthlySavings(p.id),
  ]);
  return (
    <div className="rp-stack">
      <div className="rp-heading">
        <div>
          <p className="rp-muted mb-2">
            {new Intl.DateTimeFormat("es-PA", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "America/Panama",
            }).format(new Date())}
          </p>
          <h1>Hola, {p.full_name.split(" ")[0] || "conductor"}.</h1>
          <p className="rp-muted">Cada parada puede hacer rendir más tu día.</p>
        </div>
      </div>
      {p.status !== "verified" && (
        <div className="rp-callout">
          <ShieldCheck size={24} />
          <div>
            <h2>
              {p.status === "suspended"
                ? "Tu cuenta necesita atención"
                : "Un paso más para usar tus beneficios"}
            </h2>
            <p>
              {p.status === "suspended"
                ? "Contacta al equipo para revisar el estado de tu cuenta."
                : "Verifica que eres conductor activo. Mientras revisamos tu solicitud, puedes explorar los comercios y beneficios."}
            </p>
            <Link
              href={
                p.status === "suspended" ? "/driver/help" : "/driver/verify"
              }
              className="rp-button"
            >
              {p.status === "suspended"
                ? "Obtener ayuda"
                : "Verificar mi cuenta"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
      <div className="rp-summary">
        <section className="rp-balance" aria-label="Ahorro de este mes">
          <p>Tu ahorro registrado este mes</p>
          <strong>{money(monthly.total)}</strong>
          <p>
            {monthly.count}{" "}
            {monthly.count === 1
              ? "beneficio utilizado"
              : "beneficios utilizados"}
          </p>
          <div className="rp-balance-foot">
            <span>Solo usos confirmados por comercios</span>
            <Link className="rp-text-link" href="/driver/history">
              Ver historial <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="rp-panel rp-member">
          <Logo />
          <div>
            <p className="rp-member-name">{p.full_name}</p>
            <p className="rp-muted">
              {platforms[p.platform || ""] || "Conductor RidePerks"}
            </p>
          </div>
          <div className="flex justify-between items-center gap-3 mt-6">
            <span
              className={
                "rp-badge " + (p.status === "verified" ? "good" : "pending")
              }
            >
              {statuses[p.status]}
            </span>
            <span className="rp-muted">Acceso gratuito</span>
          </div>
        </section>
      </div>
      <section>
        <div className="rp-section-head">
          <h2>Para tu próxima parada</h2>
          <Link className="rp-text-link" href="/driver/benefits">
            Ver beneficios <ArrowRight size={16} />
          </Link>
        </div>
        {benefits.length ? (
          <div className="rp-grid">
            {benefits.slice(0, 4).map((b) => (
              <BenefitCard key={b.id} benefit={b} />
            ))}
          </div>
        ) : (
          <Empty title="Estamos sumando aliados">
            <p>
              Cuando haya beneficios disponibles, los encontrarás aquí con sus
              condiciones y ubicaciones.
            </p>
          </Empty>
        )}
      </section>
      <section>
        <div className="rp-section-head">
          <h2>Tus últimos usos</h2>
          <Link className="rp-text-link" href="/driver/history">
            Ver historial <ArrowRight size={16} />
          </Link>
        </div>
        {history.length ? (
          <div className="rp-list">
            {history.slice(0, 3).map((r) => (
              <div key={r.id} className="rp-list-row">
                <div>
                  <h3>{r.benefit_title}</h3>
                  <p className="rp-muted">
                    {r.business_name} · {dateLabel(r.redeemed_at)}
                  </p>
                </div>
                <span className="rp-amount">
                  {r.savings_amount === null
                    ? "Uso confirmado"
                    : money(Number(r.savings_amount))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="Tu primer ahorro está por venir">
            <p>
              Usa un beneficio en un comercio aliado. Cuando el comercio lo
              confirme, aparecerá en tu historial.
            </p>
          </Empty>
        )}
      </section>
    </div>
  );
}
