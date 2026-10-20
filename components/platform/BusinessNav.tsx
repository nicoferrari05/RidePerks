"use client";
import { ScanLine, ChartColumn, Ticket, UserRound } from "lucide-react";
import { SpotlightDock, type DockItem } from "@/components/ui/spotlight-dock";
// Owners get four tabs; staff only scan, so they see Escanear and Cuenta.
const scan: DockItem = {
  href: "/business",
  label: "Escanear",
  icon: ScanLine,
  exact: true,
};
const account: DockItem = {
  href: "/business/account",
  label: "Cuenta",
  icon: UserRound,
  match: ["/business/notifications"],
};
const owner: DockItem[] = [
  scan,
  { href: "/business/activity", label: "Actividad", icon: ChartColumn },
  { href: "/business/benefits", label: "Beneficios", icon: Ticket },
  account,
];
const staff: DockItem[] = [scan, account];
export default function BusinessNav({ isOwner }: { isOwner: boolean }) {
  return (
    <SpotlightDock
      items={isOwner ? owner : staff}
      label="Portal del comercio"
    />
  );
}
