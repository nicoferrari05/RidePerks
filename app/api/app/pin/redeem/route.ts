import { headers } from "next/headers";
import { appOptions, appRoute, readBody } from "@/lib/platform/app-api";
import { redeemWithPin } from "@/lib/platform/counter";
import { pinBusinessFrom } from "@/lib/platform/data";

// A scan from a phone signed in with the business PIN registers the use at
// once, as on the web's /pin.
export const POST = appRoute(async (request) => {
  const business = await pinBusinessFrom((await headers()).get("x-rp-pin"));
  const body = await readBody(request);
  return redeemWithPin(business, body.token);
});

export const OPTIONS = appOptions;
