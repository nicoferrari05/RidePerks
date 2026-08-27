import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import MobileCTA from "@/components/MobileCTA";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import HowItWorks from "@/components/sections/HowItWorks";
import Manifesto from "@/components/sections/Manifesto";
import Pricing from "@/components/sections/Pricing";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <Nav />
      <main>
        <Hero />
        <Benefits />
        <Manifesto />
        <HowItWorks />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
