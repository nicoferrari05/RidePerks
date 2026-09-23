import { requireBusiness } from "@/lib/platform/data";
import { AcceptInvite } from "@/components/platform/StaffForms";
import { Heading } from "@/components/platform/ui";
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
    <main className="rp-app rp-main rp-stack">
      <PlatformThemeScript />
      <Heading title="Unirte al personal de un comercio">
        {profile.full_name}, podrás validar beneficios del comercio que te
        invitó.
      </Heading>
      <AcceptInvite token={invite} />
    </main>
  );
}
