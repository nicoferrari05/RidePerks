import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { toggleFavorite } from "@/lib/platform/app-actions";

// The heart on a benefit or a business: the web's own toggleFavorite.
export const POST = appRoute(async (request) => {
  await requireAppProfile("driver");
  const body = await readBody(request);
  const result = await runAction(toggleFavorite, {
    kind: body.kind,
    id: body.id,
    saved: body.saved === true ? "true" : "false",
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
