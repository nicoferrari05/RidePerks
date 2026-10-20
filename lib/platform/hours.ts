import type { WeekHours } from "./types";

// Opening hours: seven days from domingo (0), each null (closed) or
// [open, close] as "HH:MM". A close earlier than the open runs past midnight;
// ["00:00","24:00"] is open all day. All times are Panama time (UTC-5, no DST).

export const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const time = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;

function minutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** Normalizes stored hours; anything malformed counts as "not published". */
export function readHours(value: unknown): WeekHours | null {
  if (!Array.isArray(value) || value.length !== 7) return null;
  const days = value.map((day) =>
    Array.isArray(day) &&
    day.length === 2 &&
    day.every((t) => typeof t === "string" && time.test(t)) &&
    day[0] !== day[1]
      ? ([day[0], day[1]] as [string, string])
      : null,
  );
  return days.some(Boolean) ? days : null;
}

export function validTime(value: string) {
  return time.test(value);
}

function panamaNow(now = new Date()) {
  const local = new Date(now.getTime() - 5 * 3600000);
  return {
    day: local.getUTCDay(),
    minute: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

/** The range open right now, false when closed, null without hours. */
function currentRange(value: unknown, now: Date) {
  const hours = readHours(value);
  if (!hours) return null;
  const { day, minute } = panamaNow(now);
  const today = hours[day];
  if (today) {
    const [open, close] = today.map(minutes);
    if (close > open ? minute >= open && minute < close : minute >= open)
      return today;
  }
  // Yesterday's overnight hours that run past midnight.
  const yesterday = hours[(day + 6) % 7];
  if (yesterday) {
    const [open, close] = yesterday.map(minutes);
    if (close < open && minute < close) return yesterday;
  }
  return false;
}

/** Open right now? null when the business hasn't published hours. */
export function isOpenNow(value: unknown, now = new Date()): boolean | null {
  const range = currentRange(value, now);
  return range === null ? null : Boolean(range);
}

export function dayLabel(day: [string, string] | null) {
  if (!day) return "Cerrado";
  if (day[0] === "00:00" && day[1] === "24:00") return "Abierto 24 horas";
  return day[0] + " – " + day[1];
}

/** One line for cards: "Abierto · hasta 17:00" or "Cerrado ahora". */
export function statusLine(value: unknown, now = new Date()) {
  const range = currentRange(value, now);
  if (range === null) return null;
  if (!range) return "Cerrado ahora";
  return range[1] === "24:00" ? "Abierto ahora" : "Abierto · hasta " + range[1];
}

/** Today's day index in Panama, for highlighting the week list. */
export function todayIndex(now = new Date()) {
  return panamaNow(now).day;
}
