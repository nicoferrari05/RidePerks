"use client";
import { ThemeSwitcher } from "@/components/ui/apple-liquid-glass-switcher";
import { setTheme, useLandingTheme } from "./theme";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useLandingTheme();
  return (
    <ThemeSwitcher
      value={theme}
      onValueChange={setTheme}
      className={compact ? "switcher--compact" : undefined}
    />
  );
}
