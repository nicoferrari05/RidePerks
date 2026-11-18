import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
  runAction,
} from "@/lib/platform/app-api";
import { leaveFeedback } from "@/lib/platform/app-actions";

// Rating a use: the web's own leaveFeedback.
export const POST = appRoute(async (request) => {
  await requireAppProfile("driver");
  const body = await readBody(request);
  const result = await runAction(leaveFeedback, {
    id: body.id,
    rating: body.rating,
    applied:
      body.applied === true ? "true" : body.applied === false ? "false" : "",
    comment: typeof body.comment === "string" ? body.comment : "",
  });
  return { message: result.success };
});

export const OPTIONS = appOptions;
