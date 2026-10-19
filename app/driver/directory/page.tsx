import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireDriver, catalogLive } from "@/lib/platform/data";
import { DirectoryView } from "@/components/platform/driver/views";
export const metadata = { title: "Comercios aliados · RidePerks" };
export default async function Page() {
  await requireDriver();
  const live = await catalogLive();
  if (!live) return <DirectoryView live={false} businesses={[]} />;
  const { data, error } = await getSupabaseAdmin()
    .from("rp_businesses")
    .select("id,name,description,category,address,phone")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error("No pudimos cargar los comercios.");
  return <DirectoryView live businesses={data} />;
}
