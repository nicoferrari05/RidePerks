import type { Href } from "expo-router";

// The server speaks in web paths (setup steps, notification links). This
// maps each one to the app screen that shows the same thing.

const WEB_TO_APP: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\/driver\/benefits\/([0-9a-f-]{36})$/i, (m) => "/benefit/" + m[1]],
  [/^\/driver\/benefits(\?saved=1)?$/, (m) => "/benefits" + (m[1] ? "?saved=1" : "")],
  [/^\/driver\/directory$/, () => "/benefits?tab=directory"],
  [/^\/driver\/history$/, () => "/history"],
  [/^\/driver\/notifications$/, () => "/notifications"],
  [/^\/driver\/(profile|dashboard)?$/, (m) => (m[1] === "profile" ? "/account" : "/")],
  [/^\/driver\/profile\/edit$/, () => "/settings/profile"],
  [/^\/driver\/membership\/receipt\/([a-zA-Z0-9]{1,15})$/, (m) => "/receipt/" + m[1]],
  [/^\/driver\/membership(\?.*)?$/, () => "/settings/membership"],
  [/^\/driver\/verify$/, () => "/settings/verify"],
  [/^\/driver\/welcome$/, () => "/welcome"],
  [/^\/driver\/help$/, () => "/settings/help"],
  [/^\/driver\/password$/, () => "/settings/password"],
  [/^\/account\/delete$/, () => "/settings/delete"],
];

export function appRoute(webPath: string | null | undefined): Href | null {
  if (!webPath) return null;
  for (const [pattern, to] of WEB_TO_APP) {
    const match = webPath.match(pattern);
    if (match) return to(match) as Href;
  }
  return null;
}
