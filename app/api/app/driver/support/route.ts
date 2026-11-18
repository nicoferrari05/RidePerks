import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { requestSupport } from "@/lib/platform/support-actions";

// Ayuda → Escríbenos: the web's own requestSupport.
export const GET = appRoute(async () => {
  await requireAppProfile("driver");
  return { email: process.env.SUPPORT_EMAIL || null };
});

export const POST = appRoute(async (request) => {
  await requireAppProfile("driver");
  const body = await readBody(request);
  const result = await runAction(requestSupport, {
    topic: body.topic,
    message: body.message,
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
