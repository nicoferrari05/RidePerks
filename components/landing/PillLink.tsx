import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// The one call-to-action shape on the landing: a pill with the arrow in its
// own circle, which turns to point forward on hover. Press feedback is a
// 160ms scale to 0.97 on a snappy ease-out curve; hover effects only apply
// on devices with a real pointer (Tailwind's hover variant is hover-gated).
// "accent" is the solid text-color pill; "pill" is the light pill used on
// dark bands.
export default function PillLink({
  href,
  children,
  variant = "accent",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "accent" | "pill";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex cursor-pointer items-center justify-between gap-4 rounded-full py-1.5 pl-6 pr-1.5 text-[15px] font-semibold shadow-[0_10px_30px_-14px_rgba(4,20,41,0.5)] transition-[transform,box-shadow] duration-[160ms] ease-snappy hover:shadow-[0_14px_36px_-14px_rgba(4,20,41,0.6)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-fg",
        variant === "accent"
          ? "bg-lp-accent text-lp-accent-fg"
          : "bg-lp-pill text-lp-pill-fg",
        className,
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-snappy group-hover:rotate-45 group-active:scale-90",
          variant === "accent"
            ? "bg-lp-accent-fg text-lp-accent"
            : "bg-lp-pill-fg text-lp-pill",
        )}
      >
        <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </Link>
  );
}
