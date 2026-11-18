import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArrowUpRight, ChevronDown, Phone } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import {
  BusinessMark,
  H2,
  MenuRow,
  Muted,
  OpenStatus,
  Panel,
  Photos,
  SubHeader,
  useType,
} from "@/components/platform/ui";
import { FavoriteButton } from "@/components/platform/driver";
import { BenefitCode } from "@/components/platform/BenefitCode";
import { useApi } from "@/lib/use-api";
import { dayLabel, dayNames, mapsLink, phoneLink, type DayHours } from "@/lib/format";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// One benefit (BenefitDetailView on the web): the discount, the code to
// show at the counter, conditions, hours and how to get there.

type Detail = {
  benefit: {
    id: string;
    title: string;
    description: string;
    discount_label: string;
    terms: string;
    category: string;
    monthly_limit: number | null;
    valid_until: string | null;
    business: { name: string; address: string; phone: string | null };
  };
  verified: boolean;
  saved: boolean;
  logo: string | null;
  photos: string[];
  hours: DayHours[] | null;
  status: string | null;
  today: number;
};

function HoursRow({ hours, today }: { hours: DayHours[]; today: number }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: c.line }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          minHeight: 60,
          paddingVertical: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: c.text }}>Horario</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 14.7, color: c.muted }}>{dayLabel(hours[today])}</Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <ChevronDown size={18} color={c.faint} />
        </View>
      </Pressable>
      {open && (
        <View style={{ gap: 8, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const isToday = day === today;
            const style = {
              fontFamily: isToday ? font.semibold : font.regular,
              fontSize: 15,
              color: isToday ? c.text : c.muted,
            };
            return (
              <View key={day} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={style}>{dayNames[day]}</Text>
                <Text style={style}>{dayLabel(hours[day])}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function BenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useType();
  const { data, error, refreshing, reload } = useApi<Detail>("/api/app/driver/benefits/" + id);

  if (!data)
    return (
      <Screen>
        <SubHeader title="Beneficio" />
        {error ? <LoadError message={error} onRetry={reload} /> : <Loading />}
      </Screen>
    );

  const b = data.benefit;
  return (
    <Screen refreshing={refreshing} onRefresh={reload}>
      <SubHeader
        title={b.business.name}
        action={<FavoriteButton kind="benefit" id={b.id} saved={data.saved} name={b.title} />}
      />
      <View style={{ alignItems: "flex-start", gap: 14 }}>
        <BusinessMark category={b.category} logo={data.logo} soft />
        <Text style={t.h1} accessibilityRole="header">
          {b.discount_label}
        </Text>
        <View>
          <Muted>
            {b.title} · {b.business.name}
          </Muted>
          <OpenStatus status={data.status} />
        </View>
      </View>
      <BenefitCode benefitId={b.id} verified={data.verified} />
      {b.description ? <Text style={t.body}>{b.description}</Text> : null}
      <Photos urls={data.photos} name={b.business.name} />
      <Panel style={{ gap: 12 }}>
        <H2>Condiciones</H2>
        <Muted>{b.terms}</Muted>
        <Muted>
          {b.monthly_limit ? b.monthly_limit + " usos por conductor al mes." : "Sin límite mensual de usos."}
          {b.valid_until ? " Disponible hasta el " + b.valid_until.split("-").reverse().join("/") + "." : ""}
        </Muted>
      </Panel>
      <View>
        {data.hours && <HoursRow hours={data.hours} today={data.today} />}
        <MenuRow
          label="Cómo llegar"
          value={b.business.address}
          icon={ArrowUpRight}
          onPress={() => void Linking.openURL(mapsLink(b.business.name, b.business.address))}
        />
        {b.business.phone && (
          <MenuRow
            label="Llamar"
            value={b.business.phone}
            icon={Phone}
            onPress={() => void Linking.openURL(phoneLink(b.business.phone!))}
          />
        )}
      </View>
    </Screen>
  );
}
