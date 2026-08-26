import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Protected by middleware.ts (requires a valid rp_admin session cookie).

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "show_counter")
    .maybeSingle();

  if (error) {
    console.error("admin settings fetch error", error);
    return NextResponse.json({ error: "No pudimos leer la configuración." }, { status: 500 });
  }

  return NextResponse.json({ showCounter: data?.value === true });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { showCounter } = (body ?? {}) as Record<string, unknown>;
  if (typeof showCounter !== "boolean") {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: "show_counter", value: showCounter });

  if (error) {
    console.error("admin settings update error", error);
    return NextResponse.json({ error: "No pudimos guardar la configuración." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
