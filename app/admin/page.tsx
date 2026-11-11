import { redirect } from "next/navigation";

// The admin opens on Plataforma (the waitlist screen was removed).
export default function AdminPage() {
  redirect("/admin/platform");
}
