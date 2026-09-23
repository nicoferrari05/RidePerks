import ThemeSync from "./ThemeSync";

// Runs before the first paint so a returning visitor never sees the wrong
// theme flash. Mirrors storedTheme() in theme.ts.
const preload = `(function(){var t;try{t=localStorage.getItem("rp_lp_theme")}catch(e){}if(t!=="light"&&t!=="dark"&&t!=="dim"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.lpTheme=t})()`;

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
