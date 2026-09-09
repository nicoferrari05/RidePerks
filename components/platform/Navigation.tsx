"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Ticket, MapPin, ReceiptText, UserRound } from "lucide-react";
const items = [
  { href: "/driver/dashboard", label: "Inicio", Icon: House },
  { href: "/driver/benefits", label: "Beneficios", Icon: Ticket },
  { href: "/driver/directory", label: "Comercios", Icon: MapPin },
  { href: "/driver/history", label: "Historial", Icon: ReceiptText },
  { href: "/driver/profile", label: "Mi cuenta", Icon: UserRound },
];
export default function Navigation({ mobile = false }: { mobile?: boolean }) {
  const path = usePathname();
  return (
    <nav
      aria-label={mobile ? "Navegación móvil" : "Navegación principal"}
      className={mobile ? "rp-bottomnav" : undefined}
    >
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={path.startsWith(href) ? "page" : undefined}
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
