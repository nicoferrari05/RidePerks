import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RidePerks",
    short_name: "RidePerks",
    description: "Tu club de beneficios para conductores en Panamá.",
    start_url: "/driver/dashboard",
    scope: "/",
    display: "standalone",
    // Matches the icon's black field so the launch splash reads as one piece.
    background_color: "#100b00",
    theme_color: "#100b00",
    lang: "es-PA",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
