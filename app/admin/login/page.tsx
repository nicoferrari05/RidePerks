import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin · RidePerks",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  // LoginForm renders the full-viewport AuthShell itself; don't wrap it in
  // another layout container.
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#efffc8]" />}>
      <LoginForm />
    </Suspense>
  );
}
