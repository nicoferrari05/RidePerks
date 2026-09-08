import AuthPage from "@/components/platform/AuthPage";
export const metadata = {
  title: "Recuperar acceso · RidePerks",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AuthPage mode="recover" />;
}
