import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import MobileCTA from "@/components/MobileCTA";
import AboutHero from "@/components/sections/AboutHero";
import AboutStory from "@/components/sections/AboutStory";
import AboutHelp from "@/components/sections/AboutHelp";
import AboutAudiences from "@/components/sections/AboutAudiences";
import AboutRedemption from "@/components/sections/AboutRedemption";
import AboutFAQ from "@/components/sections/AboutFAQ";
import JoinCTA from "@/components/sections/JoinCTA";
import Footer from "@/components/sections/Footer";
import LandingShell from "@/components/landing/LandingShell";
import { SHARE_IMAGE } from "@/lib/share";

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
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SHARE_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <LandingShell>
      <ScrollAnimations />
      <Nav />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutAudiences />
        <AboutRedemption />
        <AboutHelp />
        <AboutFAQ />
        <JoinCTA />
      </main>
      <Footer />
      <MobileCTA />
    </LandingShell>
  );
}
