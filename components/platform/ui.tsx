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
/** The business's logo when it has one, else its category icon. */
export function BusinessMark({
  category,
  logo,
}: {
  category: string;
  logo?: string | null;
}) {
  if (!logo) return <CategoryIcon category={category} />;
  return (
    <div className="rp-category-icon rp-logo-mark">
      {/* Public logo from Supabase Storage. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" loading="lazy" decoding="async" />
    </div>
  );
}
export type CatalogBenefit = Pick<
  Benefit,
  "id" | "title" | "category" | "discount_label"
> & {
  rp_businesses: Pick<Benefit["rp_businesses"], "name" | "address">;
  /** Public logo URL of the business, when it uploaded one. */
  logo?: string | null;
  /** "Abierto · hasta 17:00" / "Cerrado ahora", when it published hours. */
  status?: string | null;
};
// The discount leads (it's what a driver scans for); title and business follow.
export function BenefitCard({ benefit: b }: { benefit: CatalogBenefit }) {
  return (
    <Link className="rp-benefit" href={"/driver/benefits/" + b.id}>
      <BusinessMark category={b.category} logo={b.logo} />
      <div>
        <strong>{b.discount_label}</strong>
        <span>{b.title}</span>
        <span>{b.rp_businesses.name}</span>
        {b.status && (
          <span
            className={
              "rp-benefit-status" +
              (b.status.startsWith("Abierto") ? " on" : "")
            }
          >
            {b.status}
          </span>
        )}
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
  action,
}: {
  back: string;
  backLabel: string;
  title: string;
  /** Optional control on the right (e.g. the favorite heart). */
  action?: React.ReactNode;
}) {
  return (
    <div className="rp-subhead">
      <Link href={back} className="rp-back" aria-label={backLabel}>
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <h1>{title}</h1>
      {action}
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
