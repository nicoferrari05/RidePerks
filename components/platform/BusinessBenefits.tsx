import { getSupabaseAdmin } from "@/lib/supabase-server";
import { MerchantBenefitForm, MerchantToggle } from "./MerchantForms";
import type { Benefit } from "@/lib/platform/types";

type Revision = {
  id: string;
  benefit_id: string | null;
  status: "draft" | "pending" | "returned";
  review_notes: string | null;
  payload: NonNullable<
    React.ComponentProps<typeof MerchantBenefitForm>["payload"]
  > & { title: string };
};

export async function loadBusinessBenefits(businessId: string) {
  const db = getSupabaseAdmin();
  const [benefits, revisions] = await Promise.all([
    db
      .from("rp_benefits")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
    db
      .from("rp_benefit_revisions")
      .select("*")
      .eq("business_id", businessId)
      .in("status", ["draft", "pending", "returned"])
      .order("created_at", { ascending: false }),
  ]);
  if (benefits.error || revisions.error)
    throw new Error("No pudimos consultar tus beneficios.");
  return {
    benefits: benefits.data as Benefit[],
    revisions: revisions.data as Revision[],
  };
}

function statusLabel(b: Benefit, today: string) {
  if (b.valid_until && b.valid_until < today) return ["Expirado", ""];
  if (b.admin_paused) return ["Pausado por RidePerks", "pending"];
  if (!b.is_active) return ["Pausado", "pending"];
  if (b.valid_from && b.valid_from > today) return ["Próximamente", ""];
  return ["Activo", "good"];
}

export default function BusinessBenefits({
  benefits,
  revisions,
}: {
  benefits: Benefit[];
  revisions: Revision[];
}) {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  return (
    <div className="rp-stack">
      <div className="rp-heading">
        <div>
          <h1>Beneficios</h1>
          <p className="rp-muted">
            RidePerks revisa cada beneficio nuevo y cada cambio antes de
            publicarlo.
          </p>
        </div>
      </div>
      <section className="rp-menu">
        <details>
          <summary>Crear un beneficio</summary>
          <MerchantBenefitForm />
        </details>
      </section>
      {revisions.map((r) => (
        <article className="rp-panel rp-stack tight" key={r.id}>
          <span
            className={"rp-badge " + (r.status === "returned" ? "pending" : "")}
          >
            {r.status === "pending"
              ? "En revisión"
              : r.status === "returned"
                ? "Requiere corrección"
                : "Borrador"}
          </span>
          <h2>{r.payload.title}</h2>
          {r.review_notes && <p className="rp-muted">{r.review_notes}</p>}
          {r.status !== "pending" && (
            <details>
              <summary>Editar propuesta</summary>
              <MerchantBenefitForm
                revisionId={r.id}
                benefitId={r.benefit_id || ""}
                payload={r.payload}
              />
            </details>
          )}
        </article>
      ))}
      {benefits.map((b) => {
        const [label, tone] = statusLabel(b, today);
        const revision = revisions.some((r) => r.benefit_id === b.id);
        return (
          <article className="rp-panel rp-stack tight" key={b.id}>
            <span className={"rp-badge " + tone}>{label}</span>
            <h2>{b.discount_label}</h2>
            <p className="rp-muted">{b.title}</p>
            {b.admin_paused ? (
              <p className="rp-muted">
                Para reactivarlo, escríbenos desde Cuenta → Ayuda.
              </p>
            ) : (
              <MerchantToggle id={b.id} active={b.is_active} />
            )}
            {!revision && (
              <details>
                <summary>Proponer cambios</summary>
                <MerchantBenefitForm benefitId={b.id} payload={b} />
              </details>
            )}
          </article>
        );
      })}
      {!benefits.length && !revisions.length && (
        <p className="rp-muted">
          Todavía no tienes beneficios. Crea el primero arriba.
        </p>
      )}
    </div>
  );
}
