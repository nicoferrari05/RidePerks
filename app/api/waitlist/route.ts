import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { generateReferralCode } from "@/lib/referral";

const PLATFORMS = new Set(["uber", "indrive", "pedidosya", "multiple"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeWhatsapp(raw: string): string {
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

  const { fullName, email, whatsapp, platform, ref } = (body ?? {}) as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim().length < 3) {
    return NextResponse.json({ error: "Escribe tu nombre completo." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  }

  if (typeof whatsapp !== "string" || whatsapp.trim().length === 0) {
    return NextResponse.json({ error: "Escribe tu número de WhatsApp." }, { status: 400 });
  }
  const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
  const digitsOnly = normalizedWhatsapp.replace(/\D/g, "");
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return NextResponse.json({ error: "Ese número de WhatsApp no parece válido." }, { status: 400 });
  }

  if (typeof platform !== "string" || platform.trim().length === 0) {
    return NextResponse.json({ error: "Selecciona en qué plataforma trabajas." }, { status: 400 });
  }
  if (!PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "Plataforma inválida." }, { status: 400 });
  }
  const normalizedPlatform = platform;

  try {
    const supabase = getSupabaseAdmin();

    // Best-effort referrer lookup: an invalid/stale ?ref= code is ignored
    // rather than blocking the signup.
    let referredBy: string | null = null;
    if (typeof ref === "string" && ref.trim().length > 0) {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("referral_code")
        .eq("referral_code", ref.trim().toUpperCase())
        .maybeSingle();
      if (referrer) referredBy = referrer.referral_code as string;
    }

    // Generate a unique referral code, retrying on the rare collision.
    let insertedId: string | null = null;
    let referralCode = "";
    let lastError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      referralCode = generateReferralCode();
      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          full_name: fullName.trim(),
          email: email.trim(),
          whatsapp: normalizedWhatsapp,
          platform: normalizedPlatform,
          referral_code: referralCode,
          referred_by: referredBy,
        })
        .select("id")
        .single();

      if (!error) {
        insertedId = data.id as string;
        lastError = null;
        break;
      }

      lastError = error;
      // Unique violation on referral_code: try again with a new code.
      if (error.code === "23505" && /referral_code/.test(error.message)) {
        continue;
      }
      break;
    }

    if (!insertedId) {
      if (lastError?.code === "23505") {
        return NextResponse.json(
          { error: "Ese correo ya está en la lista de espera." },
          { status: 409 }
        );
      }
      console.error("waitlist insert error", lastError);
      return NextResponse.json(
        { error: "No pudimos guardar tu registro. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const { data: ranked } = await supabase
      .from("waitlist_ranked")
      .select("position, referral_count")
      .eq("id", insertedId)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      referralCode,
      position: ranked?.position ?? null,
      referralCount: ranked?.referral_count ?? 0,
    });
  } catch (err) {
    console.error("waitlist insert failed", err);
    return NextResponse.json(
      { error: "No pudimos guardar tu registro. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
