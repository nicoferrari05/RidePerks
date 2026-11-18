import { Text, View } from "react-native";
import type { Profile } from "@/lib/session";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Business portal pieces: the shape of /api/app/business/home and the
// column chart (components/platform/BarChart.tsx on the web).

export type BusinessHome = {
  profile: Profile;
  business: { id: string; name: string; address: string } | null;
  role: "owner" | "staff" | null;
  businesses: { id: string; name: string }[];
  unread: number;
  support_email: string | null;
};

export type Tone = "good" | "pending" | "plain";
export type BenefitForm = {
  title: string;
  discount_label: string;
  description: string;
  category: string;
  terms: string;
  savings_amount: string;
  monthly_limit: string;
  valid_from: string;
  valid_until: string;
};
export type BusinessBenefits = {
  revisions: {
    id: string;
    benefit_id: string | null;
    editable: boolean;
    payload: BenefitForm;
    title: string;
    status: string;
    tone: Tone;
    notes: string | null;
  }[];
  benefits: {
    id: string;
    title: string;
    discount_label: string;
    status: string;
    tone: Tone;
    admin_paused: boolean;
    is_active: boolean;
    has_revision: boolean;
    payload: BenefitForm;
  }[];
};


export type Bar = { label: string; value: number; tip?: string };

/** One series of thin columns; the tallest one labeled. */
export function BarChart({ title, bars, unit }: { title: string; bars: Bar[]; unit: string }) {
  const { c } = useTheme();
  const max = Math.max(...bars.map((b) => b.value), 0);
  const peak = max > 0 ? bars.findIndex((b) => b.value === max) : -1;
  const shown = new Set([0, Math.floor((bars.length - 1) / 2), bars.length - 1]);
  const total = bars.reduce((s, b) => s + b.value, 0);
  return (
    <View
      accessible
      accessibilityLabel={title + ": " + total + " " + unit}
      style={{ gap: 10, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 8, borderRadius: 22, backgroundColor: c.surface }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <Text style={{ fontFamily: font.regular, fontSize: 14.1, color: c.muted }}>{title}</Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 15.2, color: c.text }}>
          {total} {unit}
        </Text>
      </View>
      <View
        style={{
          height: 140,
          paddingTop: 20,
          flexDirection: "row",
          alignItems: "flex-end",
          borderBottomWidth: 1,
          borderBottomColor: c.lineStrong,
        }}
      >
        {bars.map((b, i) => (
          <View key={b.label + i} style={{ flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" }}>
            {i === peak && (
              <Text
                style={{ position: "absolute", top: -18, fontFamily: font.semibold, fontSize: 12.5, color: c.text }}
              >
                {b.value}
              </Text>
            )}
            <View
              style={{
                width: "86%",
                maxWidth: 24,
                height: max ? (b.value / max) * 100 + "%" : "0%",
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                backgroundColor: c.chartBar,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row" }}>
        {bars.map((b, i) => (
          <Text
            key={b.label + i}
            numberOfLines={1}
            style={{
              flex: 1,
              textAlign: i === 0 ? "left" : i === bars.length - 1 ? "right" : "center",
              fontFamily: font.regular,
              fontSize: 11.5,
              color: c.muted,
              overflow: "visible",
            }}
          >
            {shown.has(i) ? b.label : ""}
          </Text>
        ))}
      </View>
    </View>
  );
}
