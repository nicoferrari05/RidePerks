import {
  appOptions,
  appRoute,
  panamaDate,
  requireAppProfile,
} from "@/lib/platform/app-api";
import { getNotifications } from "@/lib/platform/data";

// Notificaciones for drivers and businesses alike, with the web's "Hace 5
// min" / "18 nov" labels (components/platform/notifications.tsx).
function when(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return "Hace " + minutes + " min";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return "Hace " + hours + " h";
  return panamaDate(value, { day: "numeric", month: "short" });
}

export const GET = appRoute(async () => {
  const p = await requireAppProfile();
  const items = await getNotifications(p.id);
  return {
    items: items.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      href: n.href,
      unread: !n.read_at,
      when: when(n.created_at),
    })),
  };
});

export const OPTIONS = appOptions;
