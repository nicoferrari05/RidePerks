import SupportForm from "@/components/platform/SupportForm";
import { HelpView } from "@/components/platform/driver/account-views";
export const metadata = { title: "Ayuda · RidePerks" };
export default function Page() {
  return (
    <HelpView
      form={<SupportForm />}
      email={process.env.SUPPORT_EMAIL || undefined}
    />
  );
}
