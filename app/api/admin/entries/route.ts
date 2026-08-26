import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Protected by middleware.ts (requires a valid rp_admin session cookie).

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("waitlist")
    .select("id, full_name, platform, whatsapp, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin entries fetch error", error);
    return NextResponse.json({ error: "No pudimos cargar la lista." }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

const STATUSES = new Set(["pending", "verified", "rejected"]);

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { id, status } = (body ?? {}) as Record<string, unknown>;
  if (typeof id !== "string" || typeof status !== "string" || !STATUSES.has(status)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("waitlist").update({ status }).eq("id", id);

  if (error) {
    console.error("admin entries update error", error);
    return NextResponse.json({ error: "No pudimos actualizar el registro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
