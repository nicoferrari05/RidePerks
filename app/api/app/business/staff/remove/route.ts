import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { removeStaff } from "@/lib/platform/business-actions";

// Retirar acceso: the web's own removeStaff.
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const result = await runAction(removeStaff, { user_id: body.user_id });
  return { message: result.success };
});

export const OPTIONS = appOptions;
