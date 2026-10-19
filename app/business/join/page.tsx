import { requireBusiness } from "@/lib/platform/data";
import { AcceptInvite } from "@/components/platform/StaffForms";
import { Heading, Logo } from "@/components/platform/ui";
import PlatformThemeScript from "@/components/platform/ThemeScript";
import "../../platform.css";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { profile } = await requireBusiness();
  const { invite = "" } = await searchParams;
  return (
    <div className="rp-app">
      <PlatformThemeScript />
      <main className="rp-main rp-stack">
        <Logo />
        <Heading title="Únete al personal">
          {profile.full_name}, podrás validar beneficios del comercio que te
          invitó.
        </Heading>
        <AcceptInvite token={invite} />
      </main>
    </div>
  );
}
