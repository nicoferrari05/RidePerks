import "server-only";
import { headers } from "next/headers";

// Cloudflare Turnstile. Active only when both keys are configured, so the
// site keeps working (rate limits still apply) until they are set.
export function turnstileEnabled() {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

export async function verifyTurnstile(token: unknown) {
  if (!turnstileEnabled()) return;
  const fail = "Confirma que no eres un robot e intenta nuevamente.";
  if (typeof token !== "string" || !token || token.length > 2048)
    throw new Error(fail);
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
  });
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body, signal: AbortSignal.timeout(8000) },
    );
    const data = await response.json();
    if (data?.success !== true) throw new Error(fail);
  } catch {
    throw new Error(fail);
  }
}
