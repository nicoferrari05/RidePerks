import ThemeSync from "./ThemeSync";

// Set before the first paint so the overscroll area is mint from the start.
const preload = `document.documentElement.dataset.lpTheme="light"`;

export default function LandingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: preload }} />
      <ThemeSync />
      <div className="lp min-h-[100dvh] bg-lp-bg text-lp-fg">{children}</div>
    </>
  );
}
