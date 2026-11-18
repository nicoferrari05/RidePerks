// Labels and small helpers copied from the web (lib/platform/types.ts,
// lib/platform/hours.ts, lib/platform/catalog.ts) so the app writes things
// exactly the same way.

export const platforms: Record<string, string> = {
  uber: "Uber",
  indrive: "inDrive",
  pedidosya: "PedidosYa",
  multiple: "Varias plataformas",
};

export const categories: Record<string, string> = {
  combustible: "Combustible",
  comida: "Comida",
  mantenimiento: "Mantenimiento",
  salud: "Salud",
  otros: "Otros",
};

export const statuses: Record<string, string> = {
  pending: "Por verificar",
  verified: "Verificado",
  rejected: "Requiere revisión",
  suspended: "Cuenta suspendida",
};

/** Kept equal to MEMBERSHIP_PRICE_USD on the web. */
export const MEMBERSHIP_PRICE_USD = 15;

/** "$1,234.50", as Intl es-PA with the narrow dollar sign prints it. */
export function money(value: number) {
  const [whole, cents] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (value < 0 ? "-" : "") + "$" + grouped + "." + cents;
}

export function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(fullName: string) {
  return fullName.split(" ")[0] || "conductor";
}

export const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export type DayHours = [string, string] | null;

export function dayLabel(day: DayHours) {
  if (!day) return "Cerrado";
  if (day[0] === "00:00" && day[1] === "24:00") return "Abierto 24 horas";
  return day[0] + " – " + day[1];
}

/** Open right now, judged by the status line the server wrote. */
export function isOpen(status: string | null) {
  return Boolean(status && status.startsWith("Abierto"));
}

// Search that ignores accents and case ("cafe" finds "Café"), word by word.
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function matches(q: string, ...fields: (string | null | undefined)[]) {
  const query = q.trim();
  if (!query) return true;
  const haystack = fold(fields.filter(Boolean).join(" "));
  return fold(query)
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

export function mapsLink(name: string, address: string) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + " " + address + " Panamá")
  );
}

export function phoneLink(phone: string) {
  return "tel:" + phone.replace(/[^+0-9]/g, "");
}
