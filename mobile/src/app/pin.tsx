import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, H1, Muted } from "@/components/platform/ui";
import { Scanner } from "@/components/platform/Scanner";
import { Loading, Screen } from "@/components/platform/Screen";
import { api, ApiError, savePinSession } from "@/lib/api";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Escaneo con PIN (/pin on the web): on-site staff scan driver codes
// without an account; every use is recorded under the business. The access
// lasts 12 hours on this phone and ends if RidePerks changes the PIN.

type PinBusiness = { name: string; address: string };

export default function PinScreen() {
  const { c } = useTheme();
  const [business, setBusiness] = useState<PinBusiness | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const leave = useCallback(async () => {
    await savePinSession(null);
    router.replace("/login");
  }, []);

  useEffect(() => {
    let active = true;
    api<{ business: PinBusiness }>("/api/app/pin/session", { pin: true })
      .then((r) => active && setBusiness(r.business))
      .catch((e) => {
        if (!active) return;
        if (e instanceof ApiError && e.status === 401) void leave();
        else setProblem(e instanceof Error ? e.message : "No pudimos conectar.");
      });
    return () => {
      active = false;
    };
  }, [leave]);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: -12 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 18, letterSpacing: -0.4, color: c.text }}>RidePerks</Text>
        <Button label="Salir" variant="secondary" size="md" onPress={() => void leave()} />
      </View>
      {!business ? (
        problem ? (
          <Muted>{problem}</Muted>
        ) : (
          <Loading />
        )
      ) : (
        <>
          <View style={{ gap: 6, alignItems: "flex-start" }}>
            <Badge label="Escaneo con PIN" tone="plain" />
            <H1>{business.name}</H1>
            <Muted>{business.address}</Muted>
          </View>
          <Scanner pin onPinExpired={() => void leave()} />
          <Muted>
            Cada canje queda registrado en el portal del comercio. Este acceso dura 12 horas en este dispositivo y se
            cierra si RidePerks cambia el PIN.
          </Muted>
        </>
      )}
    </Screen>
  );
}
