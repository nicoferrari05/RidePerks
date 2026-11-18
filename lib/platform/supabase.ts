import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { parseBearer } from "./bearer";
function authEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}
export function authConfigured() {
  return Boolean(authEnv());
}
export async function createAuthClient() {
  const store = await cookies();
  const env = authEnv();
  if (!env) throw new Error("AUTH_NOT_CONFIGURED");
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, {
              ...options,
              sameSite: "lax",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            }),
          );
        } catch {
          /* Server Component: proxy refreshes cookies. */
        }
      },
    },
  });
}
/** A client that keeps nothing: for the app's tokens and one-off checks. */
export function createStatelessClient() {
  const env = authEnv();
  if (!env) throw new Error("AUTH_NOT_CONFIGURED");
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
/** The access token the phone app sent, if this request came from it. */
export async function appBearerToken() {
  return parseBearer((await headers()).get("authorization"));
}
// Who is signed in, verified locally against the project's signing keys:
// the phone app sends its token in a header, the web keeps it in cookies.
// A request that brings a token is judged by that token alone.
export async function sessionUserId(): Promise<string | null> {
  if (!authConfigured()) return null;
  const token = await appBearerToken();
  const auth = token ? createStatelessClient() : await createAuthClient();
  const { data, error } = await auth.auth.getClaims(token || undefined);
  const id = data?.claims?.sub;
  return error || typeof id !== "string" || !id ? null : id;
}
