import { createHmac, timingSafeEqual } from "node:crypto";

// Business PINs let on-site staff scan QR codes without an account. Each PIN
// is chosen by a RidePerks admin; the database only keeps a keyed hash of it,
// so a database dump alone doesn't reveal any PIN. The key is
// ADMIN_SESSION_SECRET: rotating that secret invalidates every PIN (admins
// then set them again) as well as every admin session.
export const PIN_COOKIE_NAME = "rp_pin";
export const PIN_MAX_AGE = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "Configura ADMIN_SESSION_SECRET con al menos 32 caracteres.",
    );
  return secret;
}
function hmac(purpose: string, message: string) {
  return createHmac("sha256", getSecret())
    .update(purpose + ":" + message)
    .digest("hex");
}

// 6 to 8 digits, rejecting the guesses anyone tries first.
export function pinProblem(pin: string) {
  if (!/^\d{6,8}$/.test(pin)) return "El PIN debe tener de 6 a 8 números.";
  const digits = [...pin].map(Number);
  const step = digits[1] - digits[0];
  if (
    Math.abs(step) <= 1 &&
    digits.every((d, i) => i === 0 || d - digits[i - 1] === step)
  )
    return "Ese PIN es demasiado fácil de adivinar. Evita números repetidos o seguidos.";
  return null;
}

export function hashPin(pin: string) {
  return hmac("rp-business-pin-v1", pin);
}

// Session cookie for a device that entered a PIN: business id, the PIN
// version it was issued for, expiry, signature. The database rechecks the
// version on every redemption, so changing a PIN signs out every device.
export function createPinSession(businessId: string, version: number) {
  const expires = Math.floor(Date.now() / 1000) + PIN_MAX_AGE;
  const payload = ["p1", businessId, version, expires].join(".");
  return payload + "." + hmac("rp-pin-session-v1", payload);
}

export function readPinSession(token: string | undefined | null) {
  if (!token || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "p1") return null;
  const [, businessId, version, expires, signature] = parts;
  const now = Math.floor(Date.now() / 1000);
  if (
    !/^[0-9a-f-]{36}$/i.test(businessId) ||
    !/^\d{1,9}$/.test(version) ||
    !/^\d{1,12}$/.test(expires) ||
    Number(expires) <= now ||
    Number(expires) > now + PIN_MAX_AGE ||
    !/^[0-9a-f]{64}$/.test(signature)
  )
    return null;
  try {
    const expected = hmac("rp-pin-session-v1", parts.slice(0, 4).join("."));
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
      return null;
  } catch {
    return null;
  }
  return { businessId, version: Number(version) };
}
