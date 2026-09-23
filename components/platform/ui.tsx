import Link from "next/link";
import {
  Fuel,
  Utensils,
  Wrench,
  HeartPulse,
  Gift,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import LogoMark from "@/components/LogoMark";
import type { Benefit } from "@/lib/platform/types";
import { categories } from "@/lib/platform/types";
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
    <div className={"rp-category-icon " + category}>
      <Icon size={21} aria-hidden="true" />
    </div>
  );
}
export type CatalogBenefit = Pick<
  Benefit,
  "id" | "title" | "category" | "discount_label"
> & { rp_businesses: Pick<Benefit["rp_businesses"], "name" | "address"> };
export function BenefitCard({ benefit: b }: { benefit: CatalogBenefit }) {
  return (
    <Link className="rp-benefit" href={"/driver/benefits/" + b.id}>
      <div className="rp-benefit-top">
        <CategoryIcon category={b.category} />
        <span className="rp-badge">{categories[b.category] || b.category}</span>
      </div>
      <h3>{b.title}</h3>
      <p className="rp-muted">
        {b.rp_businesses.name} · {b.rp_businesses.address}
      </p>
      <div className="rp-benefit-foot">
        <strong>{b.discount_label}</strong>
        <span className="flex items-center gap-1">
          Ver beneficio <ArrowUpRight size={17} aria-hidden="true" />
        </span>
      </div>
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
      <Inbox size={30} aria-hidden="true" />
      <h2>{title}</h2>
      <div className="rp-muted">{children}</div>
      {href && (
        <Link href={href} className="rp-button secondary">
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
