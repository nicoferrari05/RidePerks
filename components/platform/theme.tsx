"use client";

// Platform theme (light / dark), separate from the landing's three themes.
// Light (white) unless the person picks dark in Cuenta → Apariencia. Stored
// per browser; the attribute on <html> is set before paint by
// PlatformThemeScript and read by the tokens in app/platform.css.
import { useEffect, useSyncExternalStore } from "react";

type AppTheme = "light" | "dark";
const KEY = "rp_app_theme";
const listeners = new Set<() => void>();

function current(): AppTheme {
  return document.documentElement.dataset.rpTheme === "dark" ? "dark" : "light";
}
function stored(): AppTheme {
  try {
    if (localStorage.getItem(KEY) === "dark") return "dark";
  } catch {
    /* Storage blocked: stay light. */
  }
  return "light";
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

/** Claro / Oscuro control for the settings screens. */
export function ThemeSetting() {
  const theme = useSyncExternalStore(
    subscribe,
    current,
    () => "light" as const,
  );
  const choose = (value: AppTheme) => {
    apply(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* Applies for this visit only. */
    }
  };
  return (
    <div className="rp-segmented" role="group" aria-label="Apariencia">
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => choose("light")}
      >
        Claro
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => choose("dark")}
      >
        Oscuro
      </button>
    </div>
  );
}
