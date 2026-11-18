import "server-only";
import type { Benefit } from "./types";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  loadBusinessStats,
  periodRange,
  periods,
} from "@/components/platform/BusinessMetrics";

// What the business portal's Actividad shows, loaded once for the web page
// (/business/activity) and the phone app (/api/app/business/activity).

export function readPeriod(requested: string | null | undefined) {
  return periods.some(([v]) => v === requested) ? requested! : "30";
}

export async function businessActivityData(
  businessId: string,
  actorId: string,
  period: string,
) {
  const { from, until } = periodRange(period);
  const db = getSupabaseAdmin();
  const [stats, recent, ratings] = await Promise.all([
    loadBusinessStats(businessId, actorId, period),
    db
      .from("rp_redemptions")
      .select("id,benefit_title,redeemed_at,redeemed_via")
      .eq("business_id", businessId)
      .order("redeemed_at", { ascending: false })
      .limit(30),
    db
      .from("rp_redemption_feedback")
      .select("rating,applied")
      .eq("business_id", businessId)
      .gte("created_at", from.toISOString())
      .lt("created_at", until.toISOString())
      .limit(5000),
  ]);
  if (recent.error) throw new Error("No pudimos cargar los usos.");
  const rows = ratings.data || [];
  return {
    stats,
    recent: recent.data as {
      id: string;
      benefit_title: string;
      redeemed_at: string;
      redeemed_via?: string;
    }[],
    feedback: {
      count: rows.length,
      avg: rows.length
        ? rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length
        : null,
      notApplied: rows.filter((r) => !r.applied).length,
    },
  };
}

/** Inicio's goal: the next round number of drivers to reach. */
export function nextMilestone(drivers: number) {
  const milestones = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  return (
    milestones.find((m) => m > drivers) || Math.ceil((drivers + 1) / 5000) * 5000
  );
}

export type BenefitRevision = {
  id: string;
  benefit_id: string | null;
  status: "draft" | "pending" | "returned";
  review_notes: string | null;
  payload: Record<string, unknown> & { title: string };
};

/** A business's benefits and its proposals still open (Beneficios). */
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
    revisions: revisions.data as BenefitRevision[],
  };
}

