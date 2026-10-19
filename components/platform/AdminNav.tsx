"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, ClipboardCheck, CreditCard, Ellipsis } from "lucide-react";
import { SpotlightDock, type DockItem } from "@/components/ui/spotlight-dock";
import { Button } from "@/components/ui/button";

// Four tabs; access management, the waitlist and settings live under Más.
const items: DockItem[] = [
  { href: "/admin/platform", label: "Plataforma", icon: LayoutGrid },
  { href: "/admin/reviews", label: "Revisiones", icon: ClipboardCheck },
  { href: "/admin/payments", label: "Pagos", icon: CreditCard },
  {
    href: "/admin/more",
    label: "Más",
    icon: Ellipsis,
    match: ["/admin/access"],
    // "/admin" is the waitlist itself, not a prefix of the other pages.
    exactMatch: ["/admin"],
  },
];

export function AdminNav() {
  return <SpotlightDock items={items} label="Administración" />;
}

export function AdminLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        Cerrar sesión
      </Button>
    </form>
  );
}
