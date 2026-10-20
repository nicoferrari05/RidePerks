import Link from "next/link";
import {
  Bell,
  BadgeCheck,
  CreditCard,
  Megaphone,
  ReceiptText,
  Store,
  Ticket,
} from "lucide-react";
import { Empty, SubHeader } from "./ui";
import { MarkNotificationsRead } from "./AppForms";
import type { AppNotification } from "@/lib/platform/types";

const icons: Record<string, typeof Bell> = {
  verification: BadgeCheck,
  payment: CreditCard,
  redemption: ReceiptText,
  benefit_review: Ticket,
  business_review: Store,
  announcement: Megaphone,
};

/** Header bell with the unread count. */
export function NotificationBell({
  href,
  unread,
}: {
  href: string;
  unread: number;
}) {
  return (
    <Link
      href={href}
      className="rp-bell"
      aria-label={
        unread
          ? "Notificaciones, " + unread + (unread === 1 ? " nueva" : " nuevas")
          : "Notificaciones"
      }
    >
      <Bell aria-hidden="true" />
      {unread > 0 && (
        <span className="rp-bell-count" aria-hidden="true">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}

function when(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return "Hace " + minutes + " min";
  const hours = Math.round(minutes / 60);
  if (hours < 24) return "Hace " + hours + " h";
  return new Intl.DateTimeFormat("es-PA", {
    day: "numeric",
    month: "short",
    timeZone: "America/Panama",
  }).format(new Date(value));
}

export function NotificationsView({
  items,
  back,
}: {
  items: AppNotification[];
  back: string;
}) {
  return (
    <div className="rp-stack">
      <SubHeader back={back} backLabel="Volver" title="Notificaciones" />
      <MarkNotificationsRead />
      {items.length ? (
        <div className="rp-list">
          {items.map((n) => {
            const Icon = icons[n.kind] || Bell;
            const body = (
              <>
                <span className="rp-note-icon">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <h3>{n.title}</h3>
                  {n.body && <p>{n.body}</p>}
                  <p className="rp-note-time">{when(n.created_at)}</p>
                </div>
                {!n.read_at && (
                  <span className="rp-note-dot" aria-label="Nueva" />
                )}
              </>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} className="rp-list-row rp-note">
                {body}
              </Link>
            ) : (
              <div key={n.id} className="rp-list-row rp-note">
                {body}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="Todo al día">
          <p>
            Aquí verás tus pagos, verificaciones, usos confirmados y avisos de
            RidePerks.
          </p>
        </Empty>
      )}
    </div>
  );
}
