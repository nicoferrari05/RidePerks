import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Trash2 } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, H1, MenuRow, MenuTitle, Muted, Segmented } from "@/components/platform/ui";
import { Select } from "@/components/platform/forms";
import type { BusinessHome } from "@/components/platform/business";
import { chooseBusiness } from "@/lib/api";
import { forgetCachedData, useApi } from "@/lib/use-api";
import { useSession } from "@/lib/session";
import { WEB_URL } from "@/lib/config";
import { initials } from "@/lib/format";
import { useTheme, type Mode } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Cuenta for businesses (BusinessAccountView on the web).
export default function BusinessAccountScreen() {
  const { c, mode, setMode } = useTheme();
  const { signOut } = useSession();
  const { data, error, refreshing, reload } = useApi<BusinessHome>("/api/app/business/home");
  const [picked, setPicked] = useState<string | null>(null);
  const web = (path: string) => void WebBrowser.openBrowserAsync(WEB_URL + path);

  if (!data)
    return (
      <Screen tab>
        <H1>Cuenta</H1>
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const owner = Boolean(data.business) && data.role === "owner";
  const title = data.business?.name || data.profile.full_name;
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
            {initials(title)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4, alignItems: "flex-start" }}>
          <Text accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 19.2, color: c.text }}>
            {title}
          </Text>
          <Muted>{data.profile.full_name}</Muted>
          {data.business && <Badge label={owner ? "Administrador" : "Personal"} tone="plain" />}
        </View>
      </View>

      {data.businesses.length > 1 && (
        <View style={{ gap: 16 }}>
          <Select
            label="Comercio"
            value={picked ?? data.business?.id ?? ""}
            onChange={setPicked}
            options={data.businesses.map((b) => ({ id: b.id, label: b.name }))}
          />
          <Button
            label="Cambiar de comercio"
            variant="secondary"
            disabled={!picked || picked === data.business?.id}
            onPress={async () => {
              await chooseBusiness(picked);
              forgetCachedData();
              setPicked(null);
              await reload();
              router.navigate("/business/index");
            }}
          />
        </View>
      )}

      {owner && (
        <View>
          <MenuRow label="Información del comercio" onPress={() => router.push("/manage/info")} />
          <MenuRow label="Horario" onPress={() => router.push("/manage/hours")} />
          <MenuRow label="Logo y fotos" onPress={() => router.push("/manage/media")} />
          <MenuRow label="Personal autorizado" onPress={() => router.push("/manage/staff")} />
        </View>
      )}

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
        <MenuRow label="Contraseña" onPress={() => router.push("/settings/password")} />
        <MenuRow
          label="Notificaciones"
          value={data.unread ? data.unread + (data.unread === 1 ? " nueva" : " nuevas") : undefined}
          onPress={() => router.push("/notifications")}
        />
      </View>

      <View>
        <MenuTitle>Ayuda</MenuTitle>
        <MenuRow label="Escríbenos" onPress={() => router.push("/settings/help")} />
        <MenuRow label="Privacidad" onPress={() => web("/privacidad")} />
        <MenuRow label="Términos de uso" onPress={() => web("/terminos")} />
      </View>

      <Button label="Cerrar sesión" variant="secondary" onPress={() => void signOut()} />
      <PressScale
        onPress={() => router.push("/settings/delete")}
        accessibilityRole="link"
        style={{ alignSelf: "center", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <Trash2 size={16} color={c.dangerFg} />
        <Text style={{ fontFamily: font.medium, fontSize: 15, color: c.dangerFg }}>Eliminar mi cuenta</Text>
      </PressScale>
    </Screen>
  );
}
