import "server-only";
import { canRate } from "./driver-rules";
import { panamaDate } from "./app-api";
import type { Benefit, Redemption } from "./types";

// The shapes the phone app receives for driver screens: only what it draws,
// with dates already written the way the web writes them.

export function dateLabel(value: string) {
  return panamaDate(value, { day: "numeric", month: "short", year: "numeric" });
}

export function redemptionRow(r: Redemption, now: number) {
  return {
    id: r.id,
    benefit_title: r.benefit_title,
    business_name: r.business_name,
    savings_amount: r.savings_amount === null ? null : Number(r.savings_amount),
    date_label: dateLabel(r.redeemed_at),
    can_rate: canRate(r, now),
  };
}

export function benefitTile(
  b: Benefit & { logo?: string | null; status?: string | null },
) {
  return {
    id: b.id,
    title: b.title,
    description: b.description,
    category: b.category,
    discount_label: b.discount_label,
    business: { name: b.rp_businesses.name, address: b.rp_businesses.address },
    logo: b.logo ?? null,
    status: b.status ?? null,
  };
}
