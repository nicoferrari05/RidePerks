import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin · RidePerks" };

export default function AdminLoginPage() {
  // LoginForm renders its own full-viewport <main> (background effect,
  // layout, everything). Don't wrap it in a second one here — nesting it
  // inside a flex-centered <main> made it size to its content instead of
  // the screen, which is why the background only covered a small box.
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-navy" />}>
      <LoginForm />
    </Suspense>
  );
}
