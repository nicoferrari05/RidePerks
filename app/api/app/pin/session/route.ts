import { headers } from "next/headers";
import { AppError, appOptions, appRoute, readBody } from "@/lib/platform/app-api";
import { checkPin } from "@/lib/platform/counter";
import { pinBusinessFrom } from "@/lib/platform/data";
import { createPinSession } from "@/lib/pinAuth";

// Escanear con PIN, for on-site staff without an account. POST checks the
// PIN (same limits as /pin) and returns the device session the web keeps in
// a cookie; the phone keeps it in its keychain and sends it as X-RP-Pin.
// GET says whether that session still works (the PIN may have changed).
export const POST = appRoute(async (request) => {
  const body = await readBody(request);
  const business = await checkPin(body.pin);
  const session = createPinSession(business.id, business.pin_version);
  const current = await pinBusinessFrom(session);
  if (!current) throw new AppError("No pudimos comprobar el PIN. Intenta nuevamente.", 503);
  return { pin_session: session, business: { name: current.name, address: current.address } };
});

export const GET = appRoute(async () => {
  const business = await pinBusinessFrom((await headers()).get("x-rp-pin"));
  if (!business) throw new AppError("El PIN ya no es válido. Ingrésalo de nuevo.", 401);
  return { business: { name: business.name, address: business.address } };
});

export const OPTIONS = appOptions;
