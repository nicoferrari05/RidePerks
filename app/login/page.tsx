import type { Metadata } from "next";
import AuthPage from "@/components/platform/AuthPage";
import { safeNext } from "@/lib/platform/validation";
export const metadata: Metadata = {
  title: "Iniciar sesión · RidePerks",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const p = await searchParams;
  return (
    <AuthPage
      mode="login"
      next={safeNext(p.next)}
      error={p.error === "expired"}
    />
  );
}
