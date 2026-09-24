import type { Metadata, Viewport } from "next";
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SHARE_IMAGE } from "@/lib/share";

// Primary body font — matches production (rideperks.app uses Geist).
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// Accent serif italic — used sparingly for the one emotional word per
// section, per the RidePerks brand identity ("Fraunces Italic... Never
// for body copy").
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-fraunces",
  display: "swap",
});

// Mono — the "voice of receipts": member IDs, savings math, small labels.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const title = "RidePerks · Tu trabajo rinde más.";
const description =
  "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá. Descuentos reales en gasolina, comida, mantenimiento y más. Crea tu cuenta.";

export const metadata: Metadata = {
  appleWebApp: { capable: true, title: "RidePerks", statusBarStyle: "default" },
  // Declared in full: setting `icons` here replaces the automatic link for
  // app/icon.png, so list every size explicitly.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://rideperks.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://rideperks.app",
    siteName: "RidePerks",
    locale: "es_PA",
    type: "website",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efffc8" },
    { media: "(prefers-color-scheme: dark)", color: "#100b00" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      // The theme scripts set data-lp-theme / data-rp-theme before hydration.
      suppressHydrationWarning
      className={`${geist.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
