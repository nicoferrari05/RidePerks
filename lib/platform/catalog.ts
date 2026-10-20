import "server-only";
import { mediaUrl } from "./data";
import { categories, type Benefit, type Business } from "./types";
import { isOpenNow, readHours, statusLine } from "./hours";
import type { CatalogFilter } from "@/components/platform/driver/views";

// Shared by Beneficios and Comercios: read the filters from the URL and
// match text without caring about accents or case ("cafe" finds "Café").
export function readFilter(params: {
  q?: string;
  category?: string;
  open?: string;
  saved?: string;
}): CatalogFilter {
  return {
    q: (params.q || "").trim().slice(0, 60),
    category:
      params.category && params.category in categories ? params.category : "",
    open: params.open === "1",
    saved: params.saved === "1",
  };
}

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
export function matches(q: string, ...fields: (string | null | undefined)[]) {
  if (!q) return true;
  const haystack = fold(fields.filter(Boolean).join(" "));
  return fold(q)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

/** Benefit plus its business's logo URL and open/closed line. */
export function decorateBenefit(b: Benefit, now = new Date()) {
  return {
    ...b,
    logo: mediaUrl(b.rp_businesses.logo_path),
    status: statusLine(b.rp_businesses.hours, now),
  };
}

export function businessMedia(b: Pick<Business, "logo_path" | "photo_paths" | "hours">) {
  return {
    logo: mediaUrl(b.logo_path),
    photos: (b.photo_paths || [])
      .map((p) => mediaUrl(p))
      .filter((u): u is string => Boolean(u)),
    hours: readHours(b.hours),
  };
}

export function openFilter(open: boolean, hours: unknown, now = new Date()) {
  return !open || isOpenNow(hours, now) === true;
}
