import AuthPage from "@/components/platform/AuthPage";
export const metadata = {
  title: "Acceso de comercios · RidePerks",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="login" audience="business" next="/business" />;
}
