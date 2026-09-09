import AuthPage from "@/components/platform/AuthPage";
export const metadata = {
  title: "Registrar comercio · RidePerks",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="register" audience="business" />;
}
