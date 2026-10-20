import { redirect } from "next/navigation";
import { requireDriver } from "@/lib/platform/data";
import Welcome from "@/components/platform/Welcome";
export const metadata = { title: "Bienvenido · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  if (p.onboarded_at !== null) redirect("/driver/dashboard");
  return <Welcome name={p.full_name.split(" ")[0]} />;
}
