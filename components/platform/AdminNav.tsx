"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/admin/platform", label: "Plataforma" },
  { href: "/admin/reviews", label: "Revisiones" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/access", label: "Acceso" },
  { href: "/admin", label: "Lista de espera" },
];

export function AdminNav() {
  const path = usePathname();
  const nav = useRef<HTMLElement>(null);
  // On phones the nav scrolls sideways; keep the current section in view.
  useEffect(() => {
    nav.current
      ?.querySelector<HTMLElement>("[aria-current]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [path]);
  return (
    <nav ref={nav} aria-label="Administración">
      {items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          // "/admin" is the waitlist itself, not a prefix of the other pages.
          aria-current={
            (href === "/admin" ? path === href : path.startsWith(href))
              ? "page"
              : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
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
      <button className="rp-text-link" disabled={pending}>
        {pending ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </form>
  );
}
