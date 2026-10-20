"use client";
import { House, Ticket, ReceiptText, UserRound } from "lucide-react";
import { SpotlightDock, type DockItem } from "@/components/ui/spotlight-dock";
// Four destinations. Comercios lives inside Beneficios; membership,
// verification, help and settings live inside Cuenta.
const items: DockItem[] = [
  {
    href: "/driver/dashboard",
    label: "Inicio",
    icon: House,
    match: ["/driver/notifications"],
  },
  {
    href: "/driver/benefits",
    label: "Beneficios",
    icon: Ticket,
    match: ["/driver/directory"],
  },
  { href: "/driver/history", label: "Actividad", icon: ReceiptText },
  {
    href: "/driver/profile",
    label: "Cuenta",
    icon: UserRound,
    match: [
      "/driver/membership",
      "/driver/verify",
      "/driver/help",
      "/driver/password",
    ],
  },
];
export default function Navigation() {
  return <SpotlightDock items={items} label="Navegación principal" />;
}
