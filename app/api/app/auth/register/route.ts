import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createStatelessClient } from "@/lib/platform/supabase";
import { passwordSignIn } from "@/lib/platform/login-core";
import { createAccount } from "@/lib/platform/signup-core";
import { rateLimit } from "@/lib/platform/data";
import {
  AppError,
  appOptions,
  appRoute,
  appSession,
  readBody,
  tooMany,
} from "@/lib/platform/app-api";

// The app's sign-up (driver or business owner): the same rules and
// messages as the web form (lib/platform/signup-core.ts), then the new
// account is signed in and the session goes back as tokens.
//
// The web also asks for Cloudflare Turnstile, which a native app can't
// show. In its place, an address can create at most 10 accounts an hour
// from the app (on top of the sign-in limits every attempt counts against).
async function appSignupLimit() {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  await rateLimit("app-signup-ip:" + createHash("sha256").update(ip).digest("hex"), 10, 3600);
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

export const POST = appRoute(async (request) => {
  const body = await readBody(request);
  const audience = body.audience === "business" ? "business" : "driver";
  const created = await createAccount(
    {
      full_name: text(body.full_name),
      email: text(body.email),
      password: text(body.password),
      phone: text(body.phone),
      platform: text(body.platform),
      terms: body.terms === true ? "on" : "",
    },
    audience,
    appSignupLimit,
  ).catch(tooMany);
  if ("error" in created) throw new AppError(created.error);
  const signed = await passwordSignIn(
    createStatelessClient(),
    created.email,
    created.password,
    audience,
  );
  // Rare: the account exists but signing in failed. The app sends the
  // person to the sign-in screen with this message.
  if ("error" in signed)
    return {
      created: true,
      message: "Tu cuenta está creada. Ya puedes iniciar sesión con tu correo y contraseña.",
    };
  return appSession(signed.userId, signed.session);
});

export const OPTIONS = appOptions;
