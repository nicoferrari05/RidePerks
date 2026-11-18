import { Text, View } from "react-native";
import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Trash2 } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, H1, MenuRow, MenuTitle, Muted, Segmented } from "@/components/platform/ui";
import { useApi } from "@/lib/use-api";
import { useSession, type Profile } from "@/lib/session";
import { WEB_URL } from "@/lib/config";
import { initials, platforms, statuses } from "@/lib/format";
import { useTheme, type Mode } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Cuenta (AccountView on the web).
type Account = { profile: Profile; membership: string; unread: number };

export default function AccountScreen() {
  const { c, mode, setMode } = useTheme();
  const { signOut } = useSession();
  const { data, error, refreshing, reload } = useApi<Account>("/api/app/driver/account");
  const go = (href: string) => router.push(href as Href);
  const web = (path: string) => void WebBrowser.openBrowserAsync(WEB_URL + path);

  if (!data)
    return (
      <Screen tab>
        <H1>Cuenta</H1>
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const p = data.profile;
  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <H1>Cuenta</H1>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.greenSoft,
          }}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 24, letterSpacing: 0.5, color: c.greenText }}>
            {initials(p.full_name)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4, alignItems: "flex-start" }}>
          <Text
            accessibilityRole="header"
            style={{ fontFamily: font.semibold, fontSize: 19.2, letterSpacing: -0.38, color: c.text }}
          >
            {p.full_name || "Tu cuenta"}
          </Text>
          <Muted>{platforms[p.platform || ""] || "Conductor RidePerks"}</Muted>
          <Badge label={statuses[p.status]} tone={p.status === "verified" ? "good" : "pending"} />
        </View>
      </View>

      <View>
        <MenuRow label="Datos personales" onPress={() => go("/settings/profile")} />
        <MenuRow label="Membresía" value={data.membership} onPress={() => go("/settings/membership")} />
        <MenuRow
          label="Verificación"
          value={p.status === "verified" ? "Verificada" : "Pendiente"}
          onPress={() => go("/settings/verify")}
        />
        <MenuRow
          label="Notificaciones"
          value={data.unread ? data.unread + (data.unread === 1 ? " nueva" : " nuevas") : undefined}
          onPress={() => go("/notifications")}
        />
        <MenuRow label="Favoritos" onPress={() => router.navigate("/benefits?saved=1")} />
      </View>

      <View>
        <MenuTitle>Ajustes</MenuTitle>
        <MenuRow
          label="Apariencia"
          right={
            <Segmented<Mode>
              fit
              label="Apariencia"
              value={mode}
              onChange={setMode}
              options={[
                { id: "light", label: "Claro" },
                { id: "dark", label: "Oscuro" },
              ]}
            />
          }
        />
        <MenuRow label="Contraseña" onPress={() => go("/settings/password")} />
      </View>

      <View>
        <MenuTitle>Ayuda</MenuTitle>
        <MenuRow label="Ayuda y soporte" onPress={() => go("/settings/help")} />
        <MenuRow label="Privacidad" onPress={() => web("/privacidad")} />
        <MenuRow label="Términos de uso" onPress={() => web("/terminos")} />
      </View>

      <Button label="Cerrar sesión" variant="secondary" onPress={() => void signOut()} />
      <PressScale
        onPress={() => go("/settings/delete")}
        accessibilityRole="link"
        style={{ alignSelf: "center", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Trash2 size={16} color={c.dangerFg} />
        <Text style={{ fontFamily: font.medium, fontSize: 15, color: c.dangerFg }}>Eliminar mi cuenta</Text>
      </PressScale>
    </Screen>
  );
}
