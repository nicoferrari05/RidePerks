import FooterSection5 from "@/components/ui/footer-section-5";

// Where "Contáctanos" writes to: the same support inbox as the platform's
// Ayuda screen (SUPPORT_EMAIL), or the brand address if it isn't set.
export default function Footer() {
  return <FooterSection5 contactEmail={process.env.SUPPORT_EMAIL || "soporte@rideperks.app"} />;
}
