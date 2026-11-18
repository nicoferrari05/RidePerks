import {
  appOptions,
  appRoute,
  readBody,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { startPayment } from "@/lib/payments/membership";

// Starts a Yappy payment: Yappy sends the request to the driver's Yappy app
// and confirms it to /api/payments/yappy/ipn, exactly as from the web.
export const POST = appRoute(async (request) => {
  const p = await requireAppProfile("driver");
  const { orderId } = await startPayment(p, await readBody(request));
  return { order_id: orderId };
});

export const OPTIONS = appOptions;
