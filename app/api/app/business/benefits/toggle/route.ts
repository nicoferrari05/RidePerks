import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { toggleMerchantBenefit } from "@/lib/platform/business-actions";

// Pausar o activar un beneficio aprobado: the web's own toggleMerchantBenefit.
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const result = await runAction(toggleMerchantBenefit, {
    id: body.id,
    active: body.active === true ? "true" : "false",
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
