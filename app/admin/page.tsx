import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = { title: "Lista de espera · RidePerks Admin" };

export default function AdminPage() {
  return <AdminDashboard />;
}
