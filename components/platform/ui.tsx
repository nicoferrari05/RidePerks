import Link from "next/link";
import {
  Fuel,
  Utensils,
  Wrench,
  HeartPulse,
  Gift,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import LogoMark from "@/components/LogoMark";
import { buttonVariants } from "@/components/ui/button-variants";
import type { Benefit } from "@/lib/platform/types";
export function Logo() {
  return (
    <Link href="/" className="rp-logo" aria-label="RidePerks, inicio">
      <LogoMark variant="text" size="sm" />
    </Link>
  );
}
export function CategoryIcon({ category }: { category: string }) {
  const Icon =
    (
      {
        combustible: Fuel,
        comida: Utensils,
        mantenimiento: Wrench,
        salud: HeartPulse,
      } as Record<string, typeof Fuel>
    )[category] || Gift;
  return (
    <div className="rp-category-icon">
      <Icon aria-hidden="true" />
    </div>
  );
}
export type CatalogBenefit = Pick<
  Benefit,
  "id" | "title" | "category" | "discount_label"
> & { rp_businesses: Pick<Benefit["rp_businesses"], "name" | "address"> };
// The discount leads (it's what a driver scans for); title and business follow.
export function BenefitCard({ benefit: b }: { benefit: CatalogBenefit }) {
  return (
    <Link className="rp-benefit" href={"/driver/benefits/" + b.id}>
      <CategoryIcon category={b.category} />
      <div>
        <strong>{b.discount_label}</strong>
        <span>{b.title}</span>
        <span>{b.rp_businesses.name}</span>
      </div>
      <ChevronRight size={20} aria-hidden="true" />
    </Link>
  );
}
export function Empty({
  title,
  children,
  href,
  label,
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  label?: string;
}) {
  return (
    <div className="rp-empty">
      <h2>{title}</h2>
      <div className="rp-muted">{children}</div>
      {href && (
        <Link
          href={href}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          {label}
        </Link>
      )}
    </div>
  );
}
export function Heading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rp-heading">
      <div>
        <h1>{title}</h1>
        {children && <p className="rp-muted">{children}</p>}
      </div>
    </div>
  );
}
/** Detail-screen header: round back button and a centered title. */
export function SubHeader({
  back,
  backLabel,
  title,
}: {
  back: string;
  backLabel: string;
  title: string;
}) {
  return (
    <div className="rp-subhead">
      <Link href={back} className="rp-back" aria-label={backLabel}>
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <h1>{title}</h1>
    </div>
  );
}
/** Settings-style row: label, optional value, chevron. */
export function MenuLink({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <span>{label}</span>
      {value && <span className="rp-menu-value">{value}</span>}
      <ChevronRight size={18} aria-hidden="true" />
    </Link>
  );
}
