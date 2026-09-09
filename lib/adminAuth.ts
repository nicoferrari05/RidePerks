export const ADMIN_COOKIE_NAME = "rp_admin";
const encoder = new TextEncoder();
const MAX_AGE = 60 * 60 * 12;
function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new Error(
      "Configura ADMIN_SESSION_SECRET con al menos 32 caracteres.",
    );
  return secret;
}
export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++)
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function sign(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(result))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function createSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = "v2." + expires + "." + crypto.randomUUID();
  return payload + "." + (await sign(payload));
}
export async function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && timingSafeEqual(password, expected));
}
export async function verifySessionToken(token: string | undefined | null) {
  if (!token || token.length > 200) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v2") return false;
  const expires = Number(parts[1]),
    now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(expires) || expires <= now || expires > now + MAX_AGE)
    return false;
  try {
    return timingSafeEqual(parts[3], await sign(parts.slice(0, 3).join(".")));
  } catch {
    return false;
  }
}
