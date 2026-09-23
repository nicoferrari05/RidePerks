import { requireAdmin } from "@/lib/platform/data";
import type { Metadata } from "next";
import AdminShell from "@/components/platform/AdminShell";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Lista de espera · RidePerks Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdmin();
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
