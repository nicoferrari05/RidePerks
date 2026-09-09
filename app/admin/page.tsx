import Link from "next/link";
import { requireAdmin } from "@/lib/platform/data";
import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = { title: "Lista de espera · RidePerks Admin" };

export default async function AdminPage() {
  await requireAdmin();
  return <><div className="bg-navy p-4 text-center text-bone"><Link href="/admin/platform" className="underline underline-offset-4">Administrar conductores, beneficios y comercios →</Link></div><AdminDashboard /></>;
}
