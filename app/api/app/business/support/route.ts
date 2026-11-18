import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { requestBusinessSupport } from "@/lib/platform/support-actions";

// Cuenta → Escríbenos for businesses: the web's own requestBusinessSupport.
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const result = await runAction(requestBusinessSupport, {
    topic: body.topic,
    message: body.message,
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
