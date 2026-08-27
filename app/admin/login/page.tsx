import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin · RidePerks" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
