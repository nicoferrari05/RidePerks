// Two real plans: a free account and the membership, paid monthly ($15.00)
// or once a year ($150.00, 12 months). Amounts are fixed by the database;
// see YAPPY.md and supabase/migrations/202611110001_annual_plan.sql.
import PricingSection from "@/components/ui/pricing-section";

export default function Pricing() {
  return (
    <section id="planes" className="scroll-mt-24 px-5 py-16 sm:px-6 sm:py-32">
      <PricingSection />
    </section>
  );
}
