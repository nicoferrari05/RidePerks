import { requireAdmin } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import AdminShell from "@/components/platform/AdminShell";
import {
  AdminPlatformView,
  PLATFORM_TABS,
  type PlatformTab,
  type SupportRow,
} from "@/components/platform/admin/PlatformView";
import {
  type Business,
  type Benefit,
  type Profile,
  type Verification,
  platforms,
} from "@/lib/platform/types";
export const metadata = {
  title: "Plataforma · RidePerks Admin",
  robots: { index: false, follow: false },
};
const TABLES: Record<PlatformTab, string> = {
  verifications: "rp_verifications",
  support: "rp_support_requests",
  drivers: "rp_profiles",
  businesses: "rp_businesses",
  benefits: "rp_benefits",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    edit?: string;
    page?: string;
    q?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const tab: PlatformTab = (PLATFORM_TABS as readonly string[]).includes(
    params.tab || "",
  )
    ? (params.tab as PlatformTab)
    : "verifications";
  const page = Math.max(
    0,
    Math.min(10000, Number.parseInt(params.page || "0") || 0),
  );
  const db = getSupabaseAdmin();
  const table = TABLES[tab];
  let query = db
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * 50, page * 50 + 49);
  if (tab === "verifications") query = query.eq("status", "pending");
  if (tab === "support") query = query.eq("status", "open");
  const search = (params.q || "").trim().slice(0, 100);
  if (tab === "drivers" && search)
    query = /^[0-9a-f-]{36}$/i.test(search)
      ? query.eq("id", search)
      : query.ilike("full_name", "%" + search + "%");
  const head = { count: "exact" as const, head: true };
  const [result, shops, ...countResults] = await Promise.all([
    query,
    db.from("rp_businesses").select("id,name").order("name").limit(500),
    db.from("rp_verifications").select("id", head).eq("status", "pending"),
    db.from("rp_support_requests").select("id", head).eq("status", "open"),
    db.from("rp_profiles").select("id", head),
    db.from("rp_businesses").select("id", head),
    db.from("rp_benefits").select("id", head),
  ]);
  if (result.error)
    throw new Error(
      "No pudimos cargar la plataforma. Comprueba la migración de Supabase.",
    );
  if (shops.error) throw new Error("No pudimos cargar los comercios.");
  const [verifications, support, drivers, businesses, benefits] =
    countResults.map((r) => r.count || 0);
  const counts = { verifications, support, drivers, businesses, benefits };

  let edit: Business | Benefit | undefined;
  if (
    params.edit &&
    /^[0-9a-f-]{36}$/i.test(params.edit) &&
    (tab === "benefits" || tab === "businesses")
  ) {
    const row = await db
      .from(table)
      .select("*")
      .eq("id", params.edit)
      .maybeSingle();
    if (row.error) throw new Error("No pudimos cargar el registro.");
    // The PIN hash never leaves the server (the edit form is a client component).
    const { pin_hash, ...rest } = row.data || {};
    void pin_hash;
    edit = row.data ? (rest as Business | Benefit) : undefined;
  }

  let accounts: {
    id: string;
    full_name: string;
    phone: string;
    role: string;
  }[] = [];
  if (tab === "businesses") {
    const list = await db
      .from("rp_profiles")
      .select("id,full_name,phone,role")
      .eq("role", "business")
      .order("full_name")
      .limit(500);
    if (list.error)
      throw new Error("No pudimos cargar las cuentas responsables.");
    accounts = list.data || [];
    const owner = (edit as Business | undefined)?.owner_user_id;
    if (owner && !accounts.some((account) => account.id === owner)) {
      const current = await db
        .from("rp_profiles")
        .select("id,full_name,phone,role")
        .eq("id", owner)
        .maybeSingle();
      if (current.data) accounts.push(current.data);
    }
  }

  const rows = result.data || [];
  let supportRows: SupportRow[] = [];
  if (tab === "support" && rows.length) {
    const people = await db
      .from("rp_profiles")
      .select("id,full_name,phone")
      .in(
        "id",
        rows.map((r) => r.driver_id),
      );
    const contacts = new Map(
      (people.data || []).map((person) => [person.id, person]),
    );
    supportRows = rows.map((r) => ({ ...r, contact: contacts.get(r.driver_id) }));
  }

  const verificationRows =
    tab === "verifications"
      ? await Promise.all(
          (rows as Verification[]).map(async (v) => {
            const [signed, p] = await Promise.all([
              db.storage
                .from("rp-verifications")
                .createSignedUrl(v.photo_path, 300),
              db
                .from("rp_profiles")
                .select("full_name,platform,phone")
                .eq("id", v.driver_id)
                .single(),
            ]);
            return {
              id: v.id,
              created_at: v.created_at,
              name: p.data?.full_name || "Conductor",
              phone: (p.data?.phone as string | null) ?? null,
              platform: p.data?.platform
                ? platforms[p.data.platform as keyof typeof platforms]
                : "Plataforma no indicada",
              url: signed.data?.signedUrl,
            };
          }),
        )
      : [];

  return (
    <AdminShell>
      <AdminPlatformView
        tab={tab}
        counts={counts}
        page={page}
        total={result.count || 0}
        search={search}
        businesses={tab === "businesses" ? (rows as Business[]) : []}
        benefits={tab === "benefits" ? (rows as Benefit[]) : []}
        drivers={tab === "drivers" ? (rows as Profile[]) : []}
        support={supportRows}
        verifications={verificationRows}
        edit={edit}
        accounts={accounts}
        shops={shops.data || []}
      />
    </AdminShell>
  );
}
