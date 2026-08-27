import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import MobileCTA from "@/components/MobileCTA";
import AboutHero from "@/components/sections/AboutHero";
import AboutStory from "@/components/sections/AboutStory";
import AboutHelp from "@/components/sections/AboutHelp";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

const title = "Sobre RidePerks · El club de beneficios para conductores";
const description =
  "RidePerks es el club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá. Descubre por qué existimos y en qué áreas te ayudamos a gastar menos.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://rideperks.app/about",
    siteName: "RidePerks",
    locale: "es_PA",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1600,
        height: 849,
        alt: "Tú manejas para ganar más. RidePerks te ayuda a gastar menos.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function AboutPage() {
  return (
    <>
      <ScrollAnimations />
      <Nav />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutHelp />
        <Waitlist />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
