import {
  AppError,
  appOptions,
  appRoute,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { emailForUser } from "@/lib/email";
import { receiptData, receiptRows } from "@/lib/payments/membership";
import { money } from "@/lib/platform/types";

// A paid order as a receipt, with the rows /driver/membership/receipt shows.
export const GET = appRoute(
  async (_request, context: { params: Promise<{ id: string }> }) => {
    const p = await requireAppProfile("driver");
    const o = await receiptData(p, (await context.params).id);
    if (!o) throw new AppError("No encontramos este recibo.", 404);
    const email = await emailForUser(p.id);
    return {
      total: money(o.amount_cents / 100),
      plan_label: o.plan === "annual" ? "plan anual, 12 meses" : "1 mes",
      rows: receiptRows(o, p.full_name, email),
    };
  },
);

export const OPTIONS = appOptions;
