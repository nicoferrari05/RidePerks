"use server";
import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  PIN_COOKIE_NAME,
  PIN_MAX_AGE,
  createPinSession,
  hashPin,
} from "@/lib/pinAuth";
import { rateLimit } from "./data";
import type { ActionState } from "./types";
export async function enterPin(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const pin = String(form.get("pin") || "").replace(/\s/g, "");
  if (!/^\d{6,8}$/.test(pin))
    return { error: "Escribe el PIN de tu comercio (de 6 a 8 números)." };
  try {
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    await rateLimit(
      "pin-ip:" + createHash("sha256").update(ip).digest("hex"),
      10,
    );
    // Fixed bucket so attempts spread across many addresses still stop.
    await rateLimit("pin:global", 200);
  } catch {
    return {
      error: "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
    };
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
    return { error: "No pudimos comprobar el PIN. Intenta nuevamente." };
  }
  if (!business)
    return {
      error: "PIN incorrecto. Confírmalo con el responsable de tu comercio.",
    };
  (await cookies()).set(
    PIN_COOKIE_NAME,
    createPinSession(business.id, business.pin_version),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PIN_MAX_AGE,
    },
  );
  redirect("/pin");
}
export async function leavePin() {
  (await cookies()).delete(PIN_COOKIE_NAME);
  redirect("/pin");
}
