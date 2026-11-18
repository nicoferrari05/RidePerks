import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { removeBusinessMedia } from "@/lib/platform/business-actions";

// Quitar logo o foto: the web's own removeBusinessMedia.
export const POST = appRoute(async (request) => {
  await requireAppProfile("business");
  const body = await readBody(request);
  const result = await runAction(removeBusinessMedia, { path: body.path });
  return { message: result.success };
});

export const OPTIONS = appOptions;
