import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const PLATFORMS = new Set(["uber", "indrive"]);

function normalizeWhatsapp(raw: string): string {
  // Keep digits and a leading "+" only.
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { fullName, platform, whatsapp } = (body ?? {}) as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim().length < 3) {
    return NextResponse.json({ error: "Escribe tu nombre completo." }, { status: 400 });
  }
  if (typeof platform !== "string" || !PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "Selecciona Uber o InDrive." }, { status: 400 });
  }
  if (typeof whatsapp !== "string" || whatsapp.trim().length === 0) {
    return NextResponse.json({ error: "Escribe tu número de WhatsApp." }, { status: 400 });
  }

  const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
  const digitsOnly = normalizedWhatsapp.replace(/\D/g, "");
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return NextResponse.json({ error: "Ese número de WhatsApp no parece válido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("waitlist").insert({
    full_name: fullName.trim(),
    platform,
    whatsapp: normalizedWhatsapp,
  });

  if (error) {
    // Postgres unique_violation on the whatsapp column.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ese número ya está en la lista de espera." },
        { status: 409 }
      );
    }
    console.error("waitlist insert error", error);
    return NextResponse.json(
      { error: "No pudimos guardar tu registro. Intenta de nuevo." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
