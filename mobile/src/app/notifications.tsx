import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Megaphone,
  ReceiptText,
  Store,
  Ticket,
  type LucideIcon,
} from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Empty, List, SubHeader, useType } from "@/components/platform/ui";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import { appRoute } from "@/lib/routes";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Notificaciones (components/platform/notifications.tsx on the web).
// Opening the screen marks everything as read.

type Note = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  unread: boolean;
  when: string;
};

const ICONS: Record<string, LucideIcon> = {
  verification: BadgeCheck,
  payment: CreditCard,
  redemption: ReceiptText,
  benefit_review: Ticket,
  business_review: Store,
  announcement: Megaphone,
};

export default function NotificationsScreen() {
  const { c } = useTheme();
  const t = useType();
  const { data, error, refreshing, reload } = useApi<{ items: Note[] }>("/api/app/notifications");

  useEffect(() => {
    void api("/api/app/notifications/read", { method: "POST" })
      .then(() => {
        invalidate("/api/app/driver/home");
        invalidate("/api/app/driver/account");
        invalidate("/api/app/business/home");
      })
      .catch(() => {});
  }, []);

  return (
    <Screen refreshing={refreshing} onRefresh={reload}>
      <SubHeader title="Notificaciones" />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : data.items.length ? (
        <List>
          {data.items.map((n, i) => {
            const Icon = ICONS[n.kind] || Bell;
            const to = appRoute(n.href);
            const row = {
              flexDirection: "row" as const,
              alignItems: "flex-start" as const,
              gap: 14,
              paddingVertical: 15,
              borderBottomWidth: i === data.items.length - 1 ? 0 : 1,
              borderBottomColor: c.line,
            };
            const body = (
              <>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: c.raised,
                  }}
                >
                  <Icon size={18} color={c.greenText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.h3, { fontSize: 15.7 }]}>{n.title}</Text>
                  {n.body ? (
                    <Text style={{ fontFamily: font.regular, fontSize: 13.8, lineHeight: 20.6, color: c.muted }}>
                      {n.body}
                    </Text>
                  ) : null}
                  <Text style={{ marginTop: 2, fontFamily: font.regular, fontSize: 12.8, color: c.faint }}>
                    {n.when}
                  </Text>
                </View>
                {n.unread && (
                  <View
                    accessibilityLabel="Nueva"
                    style={{ width: 9, height: 9, marginTop: 6, borderRadius: 999, backgroundColor: c.greenLine }}
                  />
                )}
              </>
            );
            return to ? (
              <Pressable
                key={n.id}
                onPress={() => router.push(to)}
                accessibilityRole="link"
                style={({ pressed }) => [row, { opacity: pressed ? 0.6 : 1 }]}
              >
                {body}
              </Pressable>
            ) : (
              <View key={n.id} style={row}>
                {body}
              </View>
            );
          })}
        </List>
      ) : (
        <Empty title="Todo al día">
          Aquí verás tus pagos, verificaciones, usos confirmados y avisos de RidePerks.
        </Empty>
      )}
    </Screen>
  );
}
