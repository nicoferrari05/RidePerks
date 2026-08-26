// Minimal shared-password auth for the /admin portal.
//
// Design: one password (ADMIN_PASSWORD env var). On successful login we set
// an httpOnly cookie whose value is an HMAC token derived from a secret
// (ADMIN_SESSION_SECRET). Middleware recomputes the same HMAC on every
// request to /admin and /api/admin and compares it — nothing is stored in
// a database, and the cookie can't be forged without the secret.
//
// Uses Web Crypto (crypto.subtle) only, so this file runs unchanged in
// both the Edge middleware runtime and normal Node.js API routes.

export const ADMIN_COOKIE_NAME = "rp_admin";

const SESSION_MESSAGE = "rideperks-admin-session-v1";
const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "Falta ADMIN_SESSION_SECRET (o al menos ADMIN_PASSWORD) en las variables de entorno."
    );
  }
  return secret;
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(SESSION_MESSAGE));
  return toHex(signature);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(password, expected);
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  return timingSafeEqual(token, expected);
}
