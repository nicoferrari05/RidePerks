import { cn } from "@/lib/utils";

// Class recipe for the platform button (components/ui/button.tsx). Kept in a
// plain module so server components can style a <Link> as a button with
// buttonVariants() — functions from a "use client" file can't be called on
// the server. Colors come from the CSS variables set on .rp-app in
// app/platform.css (--primary, --muted, --border, --foreground, ...).

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "white"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "wensity-button relative inline-flex shrink-0 transform-gpu items-center justify-center gap-2 whitespace-nowrap rounded-[var(--primitive-radius-control,0.875rem)] shadow-none " +
  "text-sm font-medium select-none touch-manipulation " +
  "transition-[background-color,border-color,color,opacity,transform] duration-180 ease-[var(--primitive-ease,cubic-bezier(0.23,1,0.32,1))] motion-reduce:transition-[background-color,border-color,color,opacity] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primitive-ring,color-mix(in_srgb,var(--foreground)_45%,transparent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] " +
  "disabled:pointer-events-none disabled:opacity-45 data-disabled:pointer-events-none data-disabled:opacity-45 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const pressable =
  "active:scale-[0.97] active:duration-100 motion-reduce:active:scale-100 disabled:active:scale-100 data-disabled:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  default: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--primitive-control-solid,var(--primary))_88%,var(--background))] bg-[color:var(--primitive-control-solid,var(--primary))] text-[color:var(--primitive-control-solid-foreground,var(--primary-foreground))] " +
      "hover:border-[color-mix(in_srgb,var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))_82%,var(--background))] hover:bg-[color:var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))] " +
      "active:border-[color-mix(in_srgb,var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))_92%,var(--background))] active:bg-[color:var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))]",
  ),
  secondary: cn(
    pressable,
    "border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] " +
      "hover:border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  outline: cn(
    pressable,
    "border border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] bg-transparent text-[var(--foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_20%,var(--background))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_26%,var(--background))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  ghost: cn(
    pressable,
    "border border-transparent bg-transparent text-[var(--muted-foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] hover:text-[var(--foreground)] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  // Elevated surface (white in light mode, raised gray in dark mode).
  white: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--foreground)_10%,var(--background))] bg-[color:var(--primitive-surface-elevated,var(--card))] text-[var(--foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_14%,var(--background))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_18%,var(--background))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  destructive: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--primitive-destructive,var(--destructive))_78%,var(--foreground))] bg-[color:var(--primitive-destructive,var(--destructive))] text-[color:var(--primitive-destructive-foreground,#ffffff)] " +
      "hover:border-[color-mix(in_srgb,var(--primitive-destructive-hover,color-mix(in_srgb,var(--destructive)_88%,black))_82%,var(--background))] hover:bg-[color:var(--primitive-destructive-hover,color-mix(in_srgb,var(--destructive)_88%,black))] " +
      "active:border-[color-mix(in_srgb,var(--primitive-destructive-active,color-mix(in_srgb,var(--destructive)_78%,black))_92%,var(--background))] active:bg-[color:var(--primitive-destructive-active,color-mix(in_srgb,var(--destructive)_78%,black))]",
  ),
  link:
    "h-auto border border-transparent bg-transparent px-0 font-medium text-[var(--foreground)] underline-offset-4 " +
    "hover:text-[var(--muted-foreground)] hover:underline hover:decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] " +
    "active:scale-100 active:text-[var(--foreground)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-[var(--primitive-control-height-sm,2rem)] gap-1.5 px-3.5 text-xs",
  md: "h-[var(--primitive-control-height-md,2.25rem)] gap-2 px-4",
  lg: "h-[var(--primitive-control-height-lg,2.5rem)] gap-2 px-5 text-[15px]",
  icon: "h-9 w-9 gap-0 p-0",
};

export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
