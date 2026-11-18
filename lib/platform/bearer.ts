// The phone app signs in through /api/app/auth/login and then sends its
// Supabase access token on every request as "Authorization: Bearer <jwt>".
// Pure so the unit tests can import it (no server-only modules here).
export function parseBearer(value: string | null | undefined): string | null {
  if (!value || value.length > 8192) return null;
  const match = /^Bearer ([A-Za-z0-9._~+/=-]+)$/i.exec(value.trim());
  return match ? match[1] : null;
}
