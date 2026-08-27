import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import MobileCTA from "@/components/MobileCTA";
import AboutHero from "@/components/sections/AboutHero";
import AboutStory from "@/components/sections/AboutStory";
import AboutHelp from "@/components/sections/AboutHelp";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Sobre RidePerks · El club de beneficios para conductores",
  description:
    "RidePerks es el club de beneficios para conductores de Uber, InDrive y PedidosYa en Panamá. Descubre por qué existimos y en qué áreas te ayudamos a gastar menos.",
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
