// The web's design tokens, copied value for value so the app looks the same:
// - platform: app/platform.css (`.rp-app` and its dark mode block)
// - auth: the sign-in screens (app/globals.css `.rp-auth` and the Tailwind
//   classes in components/ui/sign-in.tsx)
// tests/mobile-tokens.test.mjs (repo root) fails if a value drifts from the
// web, so change a color in the web CSS and here together.

const platformLight = {
  bg: "#ffffff",
  surface: "#f3f5f9",
  surface2: "#e7ebf2",
  raised: "#ffffff",
  text: "#0b1220",
  muted: "#5d6474",
  faint: "#8e95a3",
  line: "rgba(11, 18, 32, 0.08)",
  lineStrong: "rgba(11, 18, 32, 0.16)",
  accent: "#0b1220",
  accentFg: "#ffffff",
  accentText: "#0b1220",
  accentSoft: "#f3f5f9",
  hero: "#0b1220",
  heroFg: "#ffffff",
  heroMuted: "rgba(255, 255, 255, 0.62)",
  heroSurface: "rgba(255, 255, 255, 0.1)",
  danger: "#d93a14",
  dangerBg: "#fdece7",
  dangerFg: "#a12a0b",
  greenSoft: "#e8f1fc",
  greenText: "#0066cc",
  greenLine: "#3d8fe0",
  greenFill: "#8dc3e8",
  chartBar: "#0066cc",
  warnBg: "#fdf3dc",
  warnFg: "#7d5300",
  dock: "#ffffff",
  dockFg: "#0b1220",
  dockMuted: "#868d9b",
  dockLine: "rgba(11, 18, 32, 0.08)",
  dockSpot: "rgba(11, 18, 32, 0.09)",
  dockShadow:
    "0 1px 2px rgba(11, 18, 32, 0.06), 0 14px 32px -12px rgba(11, 18, 32, 0.28)",
  shadow:
    "0 1px 2px rgba(11, 18, 32, 0.06), 0 6px 16px -8px rgba(11, 18, 32, 0.18)",
};

export type PlatformColors = typeof platformLight;

const platformDark: PlatformColors = {
  ...platformLight,
  bg: "#0b1220",
  surface: "#161d2b",
  surface2: "#232b3b",
  raised: "#1c2433",
  text: "#ffffff",
  muted: "#a4abb8",
  faint: "#737a88",
  line: "rgba(255, 255, 255, 0.08)",
  lineStrong: "rgba(255, 255, 255, 0.18)",
  accent: "#ffffff",
  accentFg: "#0b1220",
  accentText: "#ffffff",
  accentSoft: "#161d2b",
  hero: "#161d2b",
  dangerBg: "rgba(217, 58, 20, 0.18)",
  dangerFg: "#ffb49e",
  greenSoft: "rgba(141, 195, 232, 0.13)",
  greenText: "#9fcbf0",
  greenLine: "#8dc3e8",
  chartBar: "#3d8fe0",
  warnBg: "rgba(231, 177, 64, 0.16)",
  warnFg: "#f3cf7d",
  dock: "#161d2b",
  dockFg: "#ffffff",
  dockMuted: "#8b92a0",
  dockLine: "rgba(255, 255, 255, 0.1)",
  dockSpot: "rgba(255, 255, 255, 0.22)",
  dockShadow: "0 16px 36px -14px rgba(0, 0, 0, 0.8)",
  shadow: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 20px -10px rgba(0, 0, 0, 0.7)",
};

export const platform = { light: platformLight, dark: platformDark };

/** Sign-in screens: white, navy ink and slate muted text. */
export const auth = {
  bg: "#ffffff", // --color-background
  text: "#0b1220", // --color-foreground
  muted: "#4a5263", // --color-muted-foreground
  border: "rgba(11, 18, 32, 0.16)", // --color-border
  primary: "#0b1220", // --color-primary
  primaryFg: "#ffffff", // --color-primary-foreground
  link: "#4a5263", // --color-ember (text-ember)
  errorBg: "#ffe0d8", // --color-ember-soft
  errorText: "#ab2a09", // --color-ember-2
  successBg: "rgba(11, 18, 32, 0.07)", // --rp-success-bg (app/auth.css)
  successText: "#0b1220", // --rp-success-fg
  placeholder: "rgba(11, 18, 32, 0.5)", // Tailwind's placeholder: text at 50%
  inputBg: "rgba(11, 18, 32, 0.05)", // bg-foreground/5
  inputFocusBorder: "rgba(74, 82, 99, 0.6)", // border-ember/60
  inputFocusBg: "rgba(74, 82, 99, 0.05)", // bg-ember/5
  switchActiveBg: "#0b1220",
  switchActiveFg: "#ffffff",
  switchPressed: "rgba(11, 18, 32, 0.07)",
};

/** Geist, the web's font. React Native picks a weight by family name. */
export const font = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
};

/** cubic-bezier(0.23, 1, 0.32, 1): the web's --rp-ease ("snappy"). */
export const easeSnappy = [0.23, 1, 0.32, 1] as const;
