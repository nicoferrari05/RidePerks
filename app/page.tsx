import Nav from "@/components/Nav";
import ScrollAnimations from "@/components/ScrollAnimations";
import SplashScreen from "@/components/SplashScreen";
import MobileCTA from "@/components/MobileCTA";
import Hero from "@/components/sections/Hero";
import Benefits from "@/components/sections/Benefits";
import HowItWorks from "@/components/sections/HowItWorks";
import AppShowcase from "@/components/sections/AppShowcase";
import SavingsBand from "@/components/sections/SavingsBand";
import Manifesto from "@/components/sections/Manifesto";
import Pricing from "@/components/sections/Pricing";
import JoinCTA from "@/components/sections/JoinCTA";
import Footer from "@/components/sections/Footer";
import LandingShell from "@/components/landing/LandingShell";
import Marquee from "@/components/landing/Marquee";

export default function Home() {
  return (
    <LandingShell>
      <SplashScreen />
      <ScrollAnimations />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Benefits />
        <HowItWorks />
        <AppShowcase />
        <SavingsBand />
        <Manifesto />
        <Pricing />
        <JoinCTA />
      </main>
      <Footer />
      <MobileCTA />
    </LandingShell>
  );
}
