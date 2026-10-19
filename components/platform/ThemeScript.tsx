import { PlatformThemeSync } from "./theme";

// Sets the platform theme before the first paint (no light flash for dark
// users). Light unless dark was chosen. Mirrors stored() in theme.tsx.
const preload = `(function(){var t="light";try{if(localStorage.getItem("rp_app_theme")==="dark")t="dark"}catch(e){}document.documentElement.dataset.rpTheme=t})()`;

export default function PlatformThemeScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: preload }} />
      <PlatformThemeSync />
    </>
  );
}
