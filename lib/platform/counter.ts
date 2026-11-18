import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { hashPin } from "@/lib/pinAuth";
import { rateLimit, resolveQrToken } from "./data";
import { AppError } from "./app-api";
import type { Profile } from "./types";

// The counter: a business checks a driver's code (preview), confirms it
// (redeem), or on-site staff with the business PIN register it in one step.
// Shared by the web (/api/platform/*, /api/pin/redeem, /pin) and the phone
// app (/api/app/business/*, /api/app/pin/*).

export type CounterResult = {
  driver_name: string;
  benefit_title: string;
  discount_label: string;
  terms?: string;
  expires_at?: string;
};

function businessOnly(profile: Profile | null): asserts profile is Profile {
  if (!profile || profile.role !== "business" || profile.status === "suspended")
    throw new AppError("Inicia sesión como comercio.", 401);
}

async function limit(key: string, count: number) {
  try {
    await rateLimit(key, count, 600);
  } catch {
    throw new AppError(
      "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
      429,
    );
  }
}

async function runCode(
  rpc: string,
  args: Record<string, unknown>,
): Promise<CounterResult> {
  try {
    const { data, error } = await getSupabaseAdmin().rpc(rpc, args);
    if (error)
      throw new AppError(
        error.code === "P0001" ? error.message : "No pudimos registrar el uso.",
        400,
      );
    return data as CounterResult;
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(e instanceof Error ? e.message : "Intenta nuevamente.", 429);
  }
}

async function token(raw: unknown) {
  const value = await resolveQrToken(raw);
  if (!value) throw new AppError("Código inválido.", 400);
  return value;
}

/** Who the code belongs to and what it gives, without using it. */
export async function previewCode(profile: Profile | null, raw: unknown) {
  businessOnly(profile);
  await limit("preview:" + profile.id, 240);
  return runCode("rp_preview_token", {
    p_actor: profile.id,
    p_token: await token(raw),
  });
}

/** Registers the use; the code can't be used again. */
export async function redeemCode(profile: Profile | null, raw: unknown) {
  businessOnly(profile);
  await limit("redeem:" + profile.id, 120);
  return runCode("rp_redeem_token", {
    p_owner: profile.id,
    p_token: await token(raw),
  });
}

/** A device signed in with the business PIN registers the use at once. */
export async function redeemWithPin(
  business: { id: string; version: number } | null,
  raw: unknown,
) {
  if (!business)
    throw new AppError("El PIN ya no es válido. Ingrésalo de nuevo.", 401);
  await limit("pin-redeem:" + business.id, 120);
  const value = await token(raw);
  const { data, error } = await getSupabaseAdmin().rpc("rp_redeem_token_pin", {
    p_business: business.id,
    p_version: business.version,
    p_token: value,
  });
  if (error)
    throw new AppError(
      error.code === "P0001" ? error.message : "No pudimos registrar el uso.",
      400,
    );
  return data as CounterResult;
}

/** Checks a business PIN; the caller issues the device session. */
export async function checkPin(raw: unknown) {
  const pin = String(raw || "").replace(/\s/g, "");
  if (!/^\d{6,8}$/.test(pin))
    throw new AppError("Escribe el PIN de tu comercio (de 6 a 8 números).");
  try {
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    await rateLimit("pin-ip:" + createHash("sha256").update(ip).digest("hex"), 10);
    // Fixed bucket so attempts spread across many addresses still stop.
    await rateLimit("pin:global", 200);
  } catch {
    throw new AppError(
      "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
      429,
    );
  }
  let business: { id: string; pin_version: number } | null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("rp_businesses")
      .select("id,pin_version")
      .eq("pin_hash", hashPin(pin))
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    business = data;
  } catch {
    throw new AppError("No pudimos comprobar el PIN. Intenta nuevamente.", 503);
  }
  if (!business)
    throw new AppError(
      "PIN incorrecto. Confírmalo con el responsable de tu comercio.",
      401,
    );
  return business;
}
