import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { issueCode } from "@/lib/platform/codes";

// A one-time code for a benefit (the QR shown at the counter).
export const POST = appRoute(async (request) => {
  const p = await requireAppProfile("driver");
  const body = await readBody(request);
  return issueCode(p, body.benefit_id);
});

export const OPTIONS = appOptions;
