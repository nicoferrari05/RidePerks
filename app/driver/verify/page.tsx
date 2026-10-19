import { requireDriver, getVerification } from "@/lib/platform/data";
import { VerificationForm } from "@/components/platform/Forms";
import { VerifyView } from "@/components/platform/driver/account-views";
export const metadata = { title: "Verificación · RidePerks" };
export default async function Page() {
  const p = await requireDriver();
  const v = await getVerification(p.id);
  return (
    <VerifyView
      status={p.status}
      pending={v?.status === "pending"}
      rejectedNote={
        v?.status === "rejected" && p.status !== "verified"
          ? v.admin_notes ||
            "Asegúrate de que tu nombre y la plataforma se vean completos."
          : null
      }
      form={<VerificationForm />}
    />
  );
}
