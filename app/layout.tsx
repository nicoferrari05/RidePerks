import type { Metadata } from "next";
import { Geist, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "RidePerks · Tu trabajo rinde más.",
  description:
    "El club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá. Descuentos reales en gasolina, comida, mantenimiento y más. Únete a la lista de espera.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
