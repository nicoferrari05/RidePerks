import { getSupabaseAdmin } from "@/lib/supabase-server";
import { MerchantBenefitForm, MerchantToggle } from "./MerchantForms";
import type { Benefit } from "@/lib/platform/types";
export default async function BusinessBenefits({
  businessId,
}: {
  businessId: string;
}) {
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
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Panama",
  });
  return (
    <section id="beneficios" className="rp-stack">
      <h2>Beneficios de tu comercio</h2>
      <p className="rp-muted">
        RidePerks revisa los nuevos beneficios y las ediciones antes de
        publicarlos. La versión aprobada sigue disponible mientras revisamos tus
        cambios, salvo que la pauses.
      </p>
      <details>
        <summary>Crear un beneficio</summary>
        <MerchantBenefitForm />
      </details>
      {revisions.data.map((r) => (
        <article className="rp-panel rp-stack" key={r.id}>
          <h3>{r.payload.title}</h3>
          <span className="rp-badge">
            {r.status === "pending"
              ? "Pendiente de aprobación"
              : r.status === "returned"
                ? "Requiere corrección"
                : "Borrador"}
          </span>
          {r.review_notes && <p>{r.review_notes}</p>}
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
      {benefits.data.map((b: Benefit) => {
        const expired = Boolean(b.valid_until && b.valid_until < today),
          future = Boolean(b.valid_from && b.valid_from > today);
        const revision = revisions.data.some((r) => r.benefit_id === b.id);
        return (
          <article className="rp-panel rp-stack" key={b.id}>
            <h3>{b.title}</h3>
            <span className="rp-badge">
              {expired
                ? "Expirado"
                : !b.is_active
                  ? "Pausado"
                  : future
                    ? "Aprobado, próximamente"
                    : "Activo"}
            </span>
            <p>{b.discount_label}</p>
            <p className="rp-muted whitespace-pre-line">{b.terms}</p>
            <MerchantToggle id={b.id} active={b.is_active} />
            {!revision && (
              <details>
                <summary>Proponer cambios</summary>
                <MerchantBenefitForm benefitId={b.id} payload={b} />
              </details>
            )}
          </article>
        );
      })}
    </section>
  );
}
