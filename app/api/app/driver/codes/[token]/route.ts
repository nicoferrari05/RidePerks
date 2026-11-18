import { appOptions, appRoute, requireAppProfile } from "@/lib/platform/app-api";
import { codeStatus } from "@/lib/platform/codes";

// Polled while the QR is on screen: "used" once the counter confirms it.
export const GET = appRoute(
  async (_request, context: { params: Promise<{ token: string }> }) => {
    const p = await requireAppProfile("driver");
    return codeStatus(p.id, (await context.params).token);
  },
);

export const OPTIONS = appOptions;
