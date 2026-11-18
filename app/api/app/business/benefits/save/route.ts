import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { saveMerchantBenefit } from "@/lib/platform/business-actions";

// Crear o cambiar un beneficio: the web's own saveMerchantBenefit. Saves a
// draft, or sends it to RidePerks for approval (submit: "review").
const FIELDS = [
  "title",
  "discount_label",
  "description",
  "category",
  "terms",
  "savings_amount",
  "monthly_limit",
  "valid_from",
  "valid_until",
] as const;

export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const fields: Record<string, unknown> = {
    benefit_id: body.benefit_id || "",
    revision_id: body.revision_id || "",
    submit: body.submit === "review" ? "review" : "draft",
  };
  for (const key of FIELDS) fields[key] = body[key] ?? "";
  const result = await runAction(saveMerchantBenefit, fields);
  return {
    message: result.success,
    revision_id: result.revisionId,
    submitted: Boolean(result.submitted),
  };
});

export const OPTIONS = appOptions;
