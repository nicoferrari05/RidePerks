"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

// Floating tab bar for the platform (driver, business, admin): up to four
// destinations, icon + short label, a soft "spotlight" on the active tab and
// a bar that slides to it. Adapted from the spotlight nav component: real
// links, the active tab follows the route, and colors come from the
// platform theme (light dock in light mode, dark dock in dark mode).
//
// Built to feel instant on low-end phones: the tapped tab lights up on
// touch, before the next screen arrives, and everything that moves is
// transform/opacity only (no blur filters, no layout animation).

export type DockItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Other path prefixes that belong to this tab (e.g. sub-pages). */
  match?: string[];
  /** Only the exact href counts (for a parent path like /admin). */
  exact?: boolean;
  /** Other exact paths that belong to this tab. */
  exactMatch?: string[];
};

function owns(path: string, item: DockItem) {
  if (item.exactMatch?.includes(path)) return true;
  if (item.exact) return path === item.href;
  return [item.href, ...(item.match || [])].some(
    (prefix) => path === prefix || path.startsWith(prefix + "/"),
  );
}

export function SpotlightDock({
  items,
  label,
}: {
  items: DockItem[];
  label: string;
}) {
  const path = usePathname();
  // The tab tapped last, shown as active until the route catches up.
  const [tapped, setTapped] = useState<{ index: number; from: string } | null>(
    null,
  );
  const routed = items.findIndex((item) => owns(path, item));
  const active = tapped && tapped.from === path ? tapped.index : routed;
  const count = items.length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
      <nav
        aria-label={label}
        className="rp-dock pointer-events-auto relative flex w-full max-w-[420px] overflow-hidden rounded-[24px] px-1.5 py-1.5"
      >
        {/* One slot wide; slides with transform so it stays on the GPU. */}
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-0 flex justify-center transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{
            width: `calc((100% - 12px) / ${count})`,
            transform: `translate3d(${Math.max(active, 0) * 100}%, 0, 0)`,
            opacity: active < 0 ? 0 : 1,
          }}
        >
          <span className="h-[3px] w-8 rounded-full bg-[var(--rp-green-line)]" />
        </span>
        {items.map((item, index) => {
          const isActive = index === active;
          const distance = Math.abs(active - index);
          const spotlight =
            active < 0
              ? 0
              : isActive
                ? 1
                : Math.max(0, 1 - distance * 0.6) * 0.35;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (index !== routed) setTapped({ index, from: path });
              }}
              className={
                "relative flex h-14 flex-1 touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-[18px] transition-[color,transform] duration-150 active:scale-[0.94] motion-reduce:transition-none " +
                (isActive
                  ? "text-[var(--rp-dock-fg)]"
                  : "text-[var(--rp-dock-muted)] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[var(--rp-dock-fg)]")
              }
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-full transition-opacity duration-300 motion-reduce:transition-none"
                style={{
                  opacity: spotlight,
                  background:
                    "radial-gradient(42% 85% at 50% 0%, var(--rp-dock-spot), transparent)",
                }}
              />
              <Icon
                aria-hidden="true"
                className="relative size-[22px]"
                strokeWidth={isActive ? 2.4 : 1.9}
              />
              <span className="relative max-w-full truncate px-1 text-[11px] font-medium leading-none tracking-[-0.01em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
