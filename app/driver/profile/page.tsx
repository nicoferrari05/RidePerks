import { requireDriver } from "@/lib/platform/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { AccountView } from "@/components/platform/driver/views";
export const metadata = { title: "Cuenta · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const access = await getSupabaseAdmin().rpc("rp_access_state", {
    p_driver: p.id,
  });
  if (access.error) throw new Error("No pudimos consultar tu membresía.");
  const state = access.data as {
    status: string;
    lifetime: boolean;
    has_access: boolean;
  };
  const membership =
    state.status !== "enabled"
      ? "Bloqueada"
      : state.lifetime
        ? "Permanente"
        : state.has_access
          ? "Activa"
          : "Inactiva";
  return <AccountView profile={p} membership={membership} />;
}
