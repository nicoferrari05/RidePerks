"use client";

// Platform theme (light / dark only), separate from the landing's three
// themes. Stored per browser; the attribute on <html> is set before paint by
// PlatformThemeScript and read by the tokens in app/platform.css.
import { useEffect, useSyncExternalStore } from "react";
import { ThemeSwitcher, type Theme } from "@/components/ui/apple-liquid-glass-switcher";

type AppTheme = "light" | "dark";
const KEY = "rp_app_theme";
const listeners = new Set<() => void>();

function current(): AppTheme {
  return document.documentElement.dataset.rpTheme === "dark" ? "dark" : "light";
}
function stored(): AppTheme {
  try {
    const value = localStorage.getItem(KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* Storage blocked: fall back to the system preference. */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function apply(theme: AppTheme | null) {
  if (theme) document.documentElement.dataset.rpTheme = theme;
  else delete document.documentElement.dataset.rpTheme;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-applies the stored theme on client navigation; clears it on leave. */
export function PlatformThemeSync() {
  useEffect(() => {
    apply(stored());
    return () => apply(null);
  }, []);
  return null;
}

export function PlatformThemeToggle({ compact = true }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, current, () => "light" as const);
  return (
    <ThemeSwitcher
      themes={["light", "dark"]}
      value={theme}
      className={compact ? "switcher--compact" : undefined}
      onValueChange={(next: Theme) => {
        const value: AppTheme = next === "dark" ? "dark" : "light";
        apply(value);
        try {
          localStorage.setItem(KEY, value);
        } catch {
          /* Applies for this visit only. */
        }
      }}
    />
  );
}
