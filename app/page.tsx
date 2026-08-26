import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import HowItWorks from "@/components/sections/HowItWorks";
import Manifesto from "@/components/sections/Manifesto";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <Nav />
      <main>
        <Hero />
        <Benefits />
        <HowItWorks />
        <Manifesto />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
