// The web's design tokens, copied value for value so the app looks the same:
// - platform: app/platform.css (`.rp-app` and its dark mode block)
// - auth: the sign-in screens (app/globals.css `.rp-auth` and the Tailwind
//   classes in components/ui/sign-in.tsx)
// tests/mobile-tokens.test.mjs (repo root) fails if a value drifts from the
// web, so change a color in the web CSS and here together.

const platformLight = {
  bg: "#ffffff",
  surface: "#f4f4f1",
  surface2: "#e9e9e4",
  raised: "#ffffff",
  text: "#100b00",
  muted: "#6b675e",
  faint: "#9a968b",
  line: "rgba(16, 11, 0, 0.08)",
  lineStrong: "rgba(16, 11, 0, 0.16)",
  accent: "#100b00",
  accentFg: "#ffffff",
  accentText: "#100b00",
  accentSoft: "#f4f4f1",
  hero: "#100b00",
  heroFg: "#ffffff",
  heroMuted: "rgba(255, 255, 255, 0.62)",
  heroSurface: "rgba(255, 255, 255, 0.1)",
  danger: "#d93a14",
  dangerBg: "#fdece7",
  dangerFg: "#a12a0b",
  greenSoft: "#eef6e3",
  greenText: "#3d6a1c",
  greenLine: "#6aa83a",
  greenFill: "#a6d872",
  chartBar: "#5a962f",
  warnBg: "#fdf3dc",
  warnFg: "#7d5300",
  dock: "#ffffff",
  dockFg: "#100b00",
  dockMuted: "#8a867c",
  dockLine: "rgba(16, 11, 0, 0.08)",
  dockSpot: "rgba(16, 11, 0, 0.09)",
  dockShadow:
    "0 1px 2px rgba(16, 11, 0, 0.06), 0 14px 32px -12px rgba(16, 11, 0, 0.28)",
  shadow:
    "0 1px 2px rgba(16, 11, 0, 0.06), 0 6px 16px -8px rgba(16, 11, 0, 0.18)",
  mapLand: "#ebece4",
  mapRoad: "#ffffff",
  mapWater: "#dde7e3",
  mapPark: "#e2efd2",
};

export type PlatformColors = typeof platformLight;

const platformDark: PlatformColors = {
  ...platformLight,
  bg: "#100b00",
  surface: "#1d1a13",
  surface2: "#2a261d",
  raised: "#26221a",
  text: "#ffffff",
  muted: "#aaa69c",
  faint: "#78746a",
  line: "rgba(255, 255, 255, 0.08)",
  lineStrong: "rgba(255, 255, 255, 0.18)",
  accent: "#ffffff",
  accentFg: "#100b00",
  accentText: "#ffffff",
  accentSoft: "#1d1a13",
  hero: "#1d1a13",
  dangerBg: "rgba(217, 58, 20, 0.18)",
  dangerFg: "#ffb49e",
  greenSoft: "rgba(166, 216, 114, 0.13)",
  greenText: "#b8e290",
  greenLine: "#a6d872",
  chartBar: "#6e9e40",
  mapLand: "#1d1a13",
  mapRoad: "#38332a",
  mapWater: "#1a2220",
  mapPark: "#232c19",
  warnBg: "rgba(231, 177, 64, 0.16)",
  warnFg: "#f3cf7d",
  dock: "#1d1a13",
  dockFg: "#ffffff",
  dockMuted: "#8f8b80",
  dockLine: "rgba(255, 255, 255, 0.1)",
  dockSpot: "rgba(255, 255, 255, 0.22)",
  dockShadow: "0 16px 36px -14px rgba(0, 0, 0, 0.8)",
  shadow: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 20px -10px rgba(0, 0, 0, 0.7)",
};

export const platform = { light: platformLight, dark: platformDark };

/** Sign-in screens: the landing's mint palette. */
export const auth = {
  bg: "#efffc8", // --color-background
  text: "#100b00", // --color-foreground
  muted: "#3b341f", // --color-muted-foreground
  border: "rgba(16, 11, 0, 0.16)", // --color-border
  primary: "#100b00", // --color-primary
  primaryFg: "#ffffff", // --color-primary-foreground
  link: "#3b341f", // --color-ember (text-ember)
  errorBg: "#ffe0d8", // --color-ember-soft
  errorText: "#ab2a09", // --color-ember-2
  successBg: "rgba(16, 11, 0, 0.07)", // --rp-success-bg (app/auth.css)
  successText: "#100b00", // --rp-success-fg
  placeholder: "rgba(16, 11, 0, 0.5)", // Tailwind's placeholder: text at 50%
  inputBg: "rgba(16, 11, 0, 0.05)", // bg-foreground/5
  inputFocusBorder: "rgba(59, 52, 31, 0.6)", // border-ember/60
  inputFocusBg: "rgba(59, 52, 31, 0.05)", // bg-ember/5
  switchActiveBg: "#100b00",
  switchActiveFg: "#efffc8",
  switchPressed: "rgba(16, 11, 0, 0.07)",
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
