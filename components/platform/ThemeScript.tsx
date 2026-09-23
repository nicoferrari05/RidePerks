import { PlatformThemeSync } from "./theme";

// Sets the platform theme before the first paint (no light flash for dark
// users). Mirrors stored() in theme.tsx.
const preload = `(function(){var t;try{t=localStorage.getItem("rp_app_theme")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.rpTheme=t})()`;

export default function PlatformThemeScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: preload }} />
      <PlatformThemeSync />
    </>
  );
}
