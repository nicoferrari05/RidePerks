import "server-only";
import { currentProfile } from "./data";
import type { ActionState, Profile } from "./types";

// Shared plumbing for /api/app/*, the phone app's entry to the same backend
// the web uses. Every route answers JSON, is never cached, and turns any
// failure into { error } with a status the app can act on (401 = sign in
// again). The rules themselves live in lib/platform, shared with the web.

export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

// The Expo dev server (web preview) runs on its own origin. Phones don't
// send an Origin header, so production needs no CORS at all.
const DEV_ORIGINS = new Set(["http://localhost:8081", "http://127.0.0.1:8081"]);

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (process.env.NODE_ENV === "production" || !origin || !DEV_ORIGINS.has(origin))
    return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-RP-Pin, X-RP-Business",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(request: Request, data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", ...corsHeaders(request) },
  });
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

/** Wraps a route handler: JSON out, errors mapped, nothing cached. */
export function appRoute<Context = unknown>(
  handler: (request: Request, context: Context) => Promise<unknown>,
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    try {
      return json(request, await handler(request, context));
    } catch (error) {
      if (error instanceof AppError)
        return json(request, { error: error.message }, error.status);
      // A shared function sent the person to a web screen (signed out, or
      // the wrong kind of account): for the app that means "not allowed".
      if (isNextRedirect(error))
        return json(request, { error: "Inicia sesión de nuevo." }, 401);
      console.error("[api/app]", error);
      return json(
        request,
        { error: "No pudimos conectar. Intenta nuevamente." },
        500,
      );
    }
  };
}

export function appOptions(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 64 * 1024) throw new AppError("Solicitud demasiado grande.", 413);
  try {
    const value = text ? JSON.parse(text) : {};
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  } catch {
    /* falls through */
  }
  throw new AppError("Solicitud inválida.");
}

/** The signed-in person behind the app's token, or a 401. */
export async function requireAppProfile(role?: Profile["role"]) {
  const profile = await currentProfile();
  if (!profile) throw new AppError("Inicia sesión de nuevo.", 401);
  if (role && profile.role !== role)
    throw new AppError("Esta sección no está disponible para tu cuenta.", 403);
  return profile;
}

/**
 * Runs one of the web's form actions (lib/platform/*-actions.ts) for the
 * app: same validation, same rules, same messages. The app sends JSON; the
 * action expects a form, so the fields are copied over as text.
 */
export async function runAction(
  action: (state: ActionState, form: FormData) => Promise<ActionState>,
  fields: Record<string, unknown>,
) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields))
    if (value !== undefined && value !== null) form.set(key, String(value));
  let result: ActionState;
  try {
    result = await action({}, form);
  } catch (e) {
    // Business actions refuse non-owners by throwing these two messages.
    if (
      e instanceof Error &&
      (e.message === "No autorizado." || e.message.startsWith("Solo el administrador"))
    )
      throw new AppError(e.message, 403);
    throw e;
  }
  if (result.error) throw new AppError(result.error);
  return result;
}

/** Spanish date labels exactly as the web prints them. */
export function panamaDate(value: string | Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-PA", {
    timeZone: "America/Panama",
    ...options,
  }).format(new Date(value));
}

/** What the app may know about the person (no internal columns). */
export function publicProfile(profile: Profile) {
  return {
    id: profile.id,
    full_name: profile.full_name,
    phone: profile.phone,
    platform: profile.platform,
    status: profile.status,
    role: profile.role,
    onboarded_at: profile.onboarded_at ?? null,
  };
}
