import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "./data";
import { uuidSchema } from "./validation";
import { AppError } from "./app-api";
import type { Profile } from "./types";

// One-time benefit codes (the QR a driver shows at the counter). Shared by
// the web (/api/platform/token) and the phone app (/api/app/driver/codes).

export type IssuedCode = {
  token: string;
  short_code?: string;
  expires_at: string;
  status: string;
};

export async function issueCode(
  profile: Profile,
  benefitId: unknown,
): Promise<IssuedCode> {
  const id = uuidSchema.safeParse(benefitId);
  if (!id.success) throw new AppError("Beneficio inválido.", 400);
  let result;
  try {
    await rateLimit("token:" + profile.id, 30, 600);
    result = await getSupabaseAdmin().rpc("rp_issue_token", {
      p_driver: profile.id,
      p_benefit: id.data,
    });
  } catch (e) {
    throw new AppError(e instanceof Error ? e.message : "Intenta nuevamente.", 429);
  }
  if (result.error)
    throw new AppError(
      result.error.code === "P0001"
        ? result.error.message
        : "No pudimos generar el código.",
      400,
    );
  return result.data as IssuedCode;
}

/** Whether the counter already confirmed it (status "used"). */
export async function codeStatus(driverId: string, token: unknown) {
  const parsed = uuidSchema.safeParse(token);
  if (!parsed.success) throw new AppError("Código inválido.", 400);
  const { data, error } = await getSupabaseAdmin()
    .from("rp_qr_tokens")
    .select("status,expires_at")
    .eq("token", parsed.data)
    .eq("driver_id", driverId)
    .maybeSingle();
  if (error) throw new AppError("No pudimos consultar el código.", 503);
  if (!data) throw new AppError("Código no encontrado.", 404);
  return data as { status: string; expires_at: string };
}
