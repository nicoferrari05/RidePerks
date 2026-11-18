import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { requireBusiness } from "@/lib/platform/data";
import { loadBusinessBenefits } from "@/lib/platform/business-screens";
import type { Benefit } from "@/lib/platform/types";

// Beneficios (owners only): the business's benefits with their status, and
// proposals waiting for RidePerks, as /business/benefits lists them.
function statusLabel(b: Benefit, today: string): [string, "good" | "pending" | "plain"] {
  if (b.valid_until && b.valid_until < today) return ["Expirado", "plain"];
  if (b.admin_paused) return ["Pausado por RidePerks", "pending"];
  if (!b.is_active) return ["Pausado", "pending"];
  if (b.valid_from && b.valid_from > today) return ["Próximamente", "plain"];
  return ["Activo", "good"];
}

// The editable fields, as the web form fills them.
function form(p: Record<string, unknown>) {
  const text = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  return {
    title: text(p.title),
    discount_label: text(p.discount_label),
    description: text(p.description),
    category: text(p.category) || "otros",
    terms: text(p.terms),
    savings_amount: text(p.savings_amount),
    monthly_limit: text(p.monthly_limit),
    valid_from: text(p.valid_from),
    valid_until: text(p.valid_until),
  };
}

export const GET = appRoute(async () => {
  await requireAppProfile("business");
  const { business, role } = await requireBusiness();
  if (!business || role !== "owner")
    throw new AppError("Esta sección es solo para el responsable del comercio.", 403);
  const { benefits, revisions } = await loadBusinessBenefits(business.id);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Panama" });
  return {
    revisions: revisions.map((r) => ({
      id: r.id,
      benefit_id: r.benefit_id,
      editable: r.status !== "pending",
      payload: form(r.payload),
      title: r.payload.title,
      status:
        r.status === "pending" ? "En revisión" : r.status === "returned" ? "Requiere corrección" : "Borrador",
      tone: r.status === "returned" ? "pending" : "plain",
      notes: r.review_notes,
    })),
    benefits: benefits.map((b) => {
      const [label, tone] = statusLabel(b, today);
      return {
        id: b.id,
        title: b.title,
        discount_label: b.discount_label,
        status: label,
        tone,
        admin_paused: Boolean(b.admin_paused),
        is_active: b.is_active,
        has_revision: revisions.some((r) => r.benefit_id === b.id),
        payload: form(b as unknown as Record<string, unknown>),
      };
    }),
  };
});

export const OPTIONS = appOptions;
