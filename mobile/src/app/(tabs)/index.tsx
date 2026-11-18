import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { PressScale } from "@/components/PressScale";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import {
  BellButton,
  BenefitCard,
  Button,
  Empty,
  H2,
  List,
  Muted,
  SectionHead,
  type BenefitTile,
} from "@/components/platform/ui";
import {
  ComingSoon,
  SavingsCard,
  SetupProgress,
  UseRow,
  type SetupStep,
  type Use,
} from "@/components/platform/driver";
import { useApi } from "@/lib/use-api";
import { firstName, initials } from "@/lib/format";
import type { Profile } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Inicio (DashboardView on the web).
type Home = {
  profile: Profile;
  today_label: string;
  steps: SetupStep[];
  monthly: { total: number; count: number };
  total: { total: number; count: number };
  recent: Use[];
  has_history: boolean;
  live: boolean;
  featured: BenefitTile[];
  unread: number;
};

export default function HomeScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { data, error, refreshing, reload } = useApi<Home>("/api/app/driver/home");
  const tile = Math.min((Math.min(width, 760) - 40) * 0.78, 300);

  if (!data)
    return (
      <Screen tab>{error ? <LoadError message={error} onRetry={reload} /> : <Loading />}</Screen>
    );

  const p = data.profile;
  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <PressScale
          onPress={() => router.navigate("/account")}
          accessibilityRole="button"
          accessibilityLabel="Tu cuenta"
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.greenSoft,
          }}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 15.2, letterSpacing: 0.3, color: c.greenText }}>
            {initials(p.full_name)}
          </Text>
        </PressScale>
        <View style={{ flexShrink: 1 }}>
          <Text
            accessibilityRole="header"
            style={{ fontFamily: font.semibold, fontSize: 18.4, letterSpacing: -0.37, color: c.text }}
          >
            Hola, {firstName(p.full_name)}
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 14.1, color: c.muted }}>{data.today_label}</Text>
        </View>
        <BellButton unread={data.unread} />
      </View>

      {p.status === "suspended" ? (
        <View style={{ gap: 10, padding: 20, borderRadius: 24, backgroundColor: c.accentSoft, alignItems: "flex-start" }}>
          <H2>Tu cuenta necesita atención</H2>
          <Muted>Escríbenos para revisar el estado de tu cuenta.</Muted>
          <Button label="Obtener ayuda" onPress={() => router.push("/settings/help")} style={{ marginTop: 6 }} />
        </View>
      ) : data.steps.length ? (
        <SetupProgress steps={data.steps} />
      ) : null}

      <SavingsCard monthly={data.monthly} total={data.total} />

      <View>
        <SectionHead
          title="Para tu próxima parada"
          action={
            data.live && data.featured.length
              ? { label: "Ver todos", onPress: () => router.navigate("/benefits") }
              : undefined
          }
        />
        {data.live && data.featured.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={tile + 10}
            decelerationRate="fast"
            style={{ marginHorizontal: -20 }}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          >
            {data.featured.map((b) => (
              <BenefitCard key={b.id} benefit={b} rail width={tile} />
            ))}
          </ScrollView>
        ) : (
          <ComingSoon />
        )}
      </View>

      <View>
        <SectionHead
          title="Últimos usos"
          action={data.has_history ? { label: "Ver todo", onPress: () => router.navigate("/history") } : undefined}
        />
        {data.recent.length ? (
          <List>
            {data.recent.map((r, i) => (
              <UseRow key={r.id} r={r} last={i === data.recent.length - 1} />
            ))}
          </List>
        ) : (
          <Empty title="Tu primer ahorro está por venir">
            Cuando un comercio confirme tu código, aparecerá aquí.
          </Empty>
        )}
      </View>
    </Screen>
  );
}
