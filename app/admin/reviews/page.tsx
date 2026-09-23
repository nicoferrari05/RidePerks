import Link from "next/link";
import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  BenefitReview,
  BusinessChangeReview,
} from "@/components/platform/AccessForms";
import { Heading } from "@/components/platform/ui";
import { categories } from "@/lib/platform/types";
import "../../platform.css";
export default async function Page() {
  await requireAdmin();
  const { data, error } = await getSupabaseAdmin()
    .from("rp_benefit_revisions")
    .select("*,rp_businesses(name)")
    .eq("status", "pending")
    .order("created_at")
    .limit(50);
  if (error) throw new Error("No pudimos cargar las propuestas.");
  const changes = await getSupabaseAdmin()
    .from("rp_business_changes")
    .select("*,rp_businesses(name,address,category)")
    .eq("status", "pending")
    .order("created_at")
    .limit(50);
  if (changes.error) throw new Error("No pudimos cargar los cambios.");
  return (
    <main className="rp-app rp-main rp-stack">
      <Link href="/admin/platform" className="rp-text-link">
        ← Administración
      </Link>
      <Heading title="Beneficios por aprobar">
        Propuestas recibidas de los comercios, de la más antigua a la más
        reciente.
      </Heading>
      <Link href="/admin/access" className="rp-text-link">
        Vincular mi identidad administrativa
      </Link>
      {!data.length && !changes.data.length && (
        <p>No hay propuestas pendientes.</p>
      )}
      {changes.data.map((c) => (
        <article key={c.id} className="rp-panel rp-stack">
          <h2>Cambio de datos: {c.rp_businesses.name}</h2>
          <p className="rp-muted">
            Actual: {c.rp_businesses.name} · {c.rp_businesses.address} ·{" "}
            {categories[c.rp_businesses.category]}
          </p>
          <p>
            <strong>Propuesto:</strong> {c.payload.name} · {c.payload.address}{" "}
            · {categories[c.payload.category]}
          </p>
          <BusinessChangeReview id={c.id} />
        </article>
      ))}
      {data.map((r) => (
        <article key={r.id} className="rp-panel rp-stack">
          <h2>{r.payload.title}</h2>
          <p>
            {r.rp_businesses.name} ·{" "}
            {r.benefit_id ? "Cambio a beneficio existente" : "Beneficio nuevo"}
          </p>
          <p>
            <strong>{r.payload.discount_label}</strong> ·{" "}
            {categories[r.payload.category]}
          </p>
          <p>{r.payload.description}</p>
          <p className="whitespace-pre-line">{r.payload.terms}</p>
          <p className="rp-muted">
            Desde {r.payload.valid_from || "sin fecha inicial"} hasta{" "}
            {r.payload.valid_until || "sin fecha final"}. Límite mensual:{" "}
            {r.payload.monthly_limit || "sin límite"}. Ahorro fijo:{" "}
            {r.payload.savings_amount === ""
              ? "sin importe"
              : r.payload.savings_amount}
            .
          </p>
          <BenefitReview id={r.id} />
        </article>
      ))}
    </main>
  );
}
