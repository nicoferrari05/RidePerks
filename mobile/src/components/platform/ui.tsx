import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Fuel,
  Gift,
  HeartPulse,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { useStyles, useTheme } from "@/theme/theme";
import { font, type PlatformColors } from "@/theme/tokens";

// The platform's building blocks, one for each class in app/platform.css
// (.rp-panel, .rp-empty, .rp-menu, .rp-badge, .rp-segmented, ...). Sizes are
// the web's rem values at 16px.

export const typeStyles = (c: PlatformColors) =>
  StyleSheet.create({
    h1: {
      fontFamily: font.semibold,
      fontSize: 32,
      lineHeight: 35.2,
      letterSpacing: -1.12,
      color: c.text,
    },
    h2: {
      fontFamily: font.semibold,
      fontSize: 19.2,
      lineHeight: 25,
      letterSpacing: -0.38,
      color: c.text,
    },
    h3: {
      fontFamily: font.semibold,
      fontSize: 16,
      lineHeight: 21.6,
      letterSpacing: -0.16,
      color: c.text,
    },
    body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: c.text },
    muted: {
      fontFamily: font.regular,
      fontSize: 15,
      lineHeight: 23.3,
      color: c.muted,
    },
    link: {
      fontFamily: font.semibold,
      fontSize: 15,
      color: c.text,
    },
  });

export function useType() {
  return useStyles(typeStyles);
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useType();
  return (
    <Text style={[t.h1, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useType();
  return (
    <Text style={[t.h2, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Muted({
  children,
  style,
  lines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  lines?: number;
}) {
  const t = useType();
  return (
    <Text style={[t.muted, style]} numberOfLines={lines}>
      {children}
    </Text>
  );
}

/** `.rp-text-link`: bold text action, 44px tall touch target. */
export function TextLink({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useType();
  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="link"
      hitSlop={6}
      style={[{ minHeight: 44, justifyContent: "center" }, style]}
    >
      <Text style={t.link}>{label}</Text>
    </PressScale>
  );
}

// ---------- Buttons (components/ui/button-variants) ----------

type Variant = "default" | "secondary" | "white" | "ghost";

export function Button({
  label,
  onPress,
  variant = "default",
  size = "lg",
  icon: Icon,
  loading = false,
  disabled = false,
  onCard = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** On a gray card: secondary turns white so it doesn't blend in. */
  onCard?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const colors: Record<Variant, { bg: string; fg: string; border: string }> = {
    default: { bg: c.accent, fg: c.accentFg, border: c.accent },
    secondary: {
      bg: onCard ? c.raised : c.surface,
      fg: c.text,
      border: onCard ? c.raised : c.surface,
    },
    white: { bg: c.raised, fg: c.text, border: c.line },
    ghost: { bg: "transparent", fg: c.muted, border: "transparent" },
  };
  const tone = colors[variant];
  const off = disabled || loading;
  return (
    <PressScale
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={[
        {
          minHeight: size === "lg" ? 52 : 44,
          paddingHorizontal: size === "lg" ? 20 : 16,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: tone.border,
          backgroundColor: tone.bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: off ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : (
        Icon && <Icon size={16} color={tone.fg} />
      )}
      <Text
        numberOfLines={1}
        style={{
          fontFamily: font.medium,
          fontSize: size === "lg" ? 15 : 14,
          color: tone.fg,
        }}
      >
        {label}
      </Text>
    </PressScale>
  );
}

// ---------- Segmented control (.rp-segmented) ----------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  hero = false,
  fit = false,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Inside the dark card (.rp-hero .rp-segmented). */
  hero?: boolean;
  /** As wide as its labels (Apariencia), not the full row. */
  fit?: boolean;
  label: string;
}) {
  const { c } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={{
        flexDirection: "row",
        gap: 2,
        padding: 4,
        borderRadius: 999,
        backgroundColor: hero ? c.heroSurface : c.surface,
        alignSelf: hero ? "flex-start" : fit ? "auto" : "stretch",
        marginBottom: hero ? 12 : 0,
      }}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <PressScale
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={[
              {
                flexGrow: hero || fit ? 0 : 1,
                minHeight: hero ? 34 : 40,
                paddingHorizontal: hero ? 14 : 12,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
              },
              selected &&
                (hero
                  ? { backgroundColor: c.heroFg }
                  : { backgroundColor: c.raised, boxShadow: c.shadow }),
            ]}
          >
            <Text
              style={{
                fontFamily: font.medium,
                fontSize: hero ? 13.6 : 14.4,
                color: selected ? (hero ? "#0b1220" : c.text) : hero ? c.heroMuted : c.muted,
              }}
            >
              {option.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

/** `.rp-category-chips`: a sideways row of filter pills. */
export function Chips({
  items,
}: {
  items: { id: string; label: string; selected: boolean; onPress: () => void }[];
}) {
  const { c } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      {items.map((item) => (
        <PressScale
          key={item.id}
          onPress={item.onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: item.selected }}
          style={{
            minHeight: 38,
            paddingHorizontal: 16,
            borderRadius: 999,
            justifyContent: "center",
            backgroundColor: item.selected ? c.text : c.surface,
          }}
        >
          <Text
            style={{
              fontFamily: font.medium,
              fontSize: 14.4,
              color: item.selected ? c.bg : c.text,
            }}
          >
            {item.label}
          </Text>
        </PressScale>
      ))}
    </ScrollView>
  );
}

// ---------- Surfaces ----------

const surfaces = (c: PlatformColors) =>
  StyleSheet.create({
    panel: { padding: 20, borderRadius: 24, backgroundColor: c.surface, gap: 16 },
    callout: {
      padding: 20,
      borderRadius: 24,
      backgroundColor: c.accentSoft,
      gap: 10,
      alignItems: "flex-start",
    },
    empty: {
      paddingVertical: 24,
      paddingHorizontal: 22,
      borderRadius: 24,
      backgroundColor: c.surface,
      gap: 8,
      alignItems: "flex-start",
    },
    emptyTitle: {
      fontFamily: font.semibold,
      fontSize: 17.6,
      lineHeight: 22.9,
      letterSpacing: -0.35,
      color: c.text,
    },
    list: { paddingVertical: 2, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.surface },
    error: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: c.dangerBg,
    },
    errorText: { fontFamily: font.regular, fontSize: 14.4, lineHeight: 22.3, color: c.dangerFg },
    success: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: c.greenSoft,
    },
    successText: { fontFamily: font.regular, fontSize: 14.4, lineHeight: 22.3, color: c.greenText },
  });

export function useSurfaces() {
  return useStyles(surfaces);
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const s = useSurfaces();
  return <View style={[s.panel, style]}>{children}</View>;
}

export function List({ children }: { children: ReactNode }) {
  const s = useSurfaces();
  return <View style={s.list}>{children}</View>;
}

export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: { label: string; onPress: () => void };
}) {
  const s = useSurfaces();
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle} accessibilityRole="header">
        {title}
      </Text>
      {typeof children === "string" ? <Muted>{children}</Muted> : children}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          size="md"
          onCard
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

export function Message({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const s = useSurfaces();
  return (
    <View
      style={kind === "error" ? s.error : s.success}
      accessibilityRole={kind === "error" ? "alert" : "text"}
    >
      <Text style={kind === "error" ? s.errorText : s.successText}>{children}</Text>
    </View>
  );
}

/** `.rp-badge`: status pill. */
export function Badge({ label, tone }: { label: string; tone: "good" | "pending" | "plain" }) {
  const { c } = useTheme();
  const colors = {
    good: [c.greenSoft, c.greenText],
    pending: [c.warnBg, c.warnFg],
    plain: [c.surface2, c.text],
  }[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        minHeight: 26,
        paddingHorizontal: 10,
        borderRadius: 999,
        justifyContent: "center",
        backgroundColor: colors[0],
      }}
    >
      <Text style={{ fontFamily: font.semibold, fontSize: 12.5, color: colors[1] }}>{label}</Text>
    </View>
  );
}

/** `.rp-section-head`: section title with an optional link on the right. */
export function SectionHead({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        minHeight: 44,
        marginBottom: 12,
      }}
    >
      <H2>{title}</H2>
      {action && <TextLink label={action.label} onPress={action.onPress} />}
    </View>
  );
}

// ---------- Headers ----------

/** `.rp-subhead`: round back button and a centered title. */
export function SubHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: -8,
        marginBottom: 4,
      }}
    >
      <PressScale
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.surface,
        }}
      >
        <ArrowLeft size={20} color={c.text} />
      </PressScale>
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: font.semibold,
          fontSize: 16,
          letterSpacing: -0.16,
          color: c.text,
        }}
      >
        {title}
      </Text>
      <View style={{ width: 44, alignItems: "flex-end" }}>{action}</View>
    </View>
  );
}

/** Header bell with the unread count (.rp-bell). */
export function BellButton({ unread }: { unread: number }) {
  const { c } = useTheme();
  return (
    <PressScale
      onPress={() => router.push("/notifications")}
      accessibilityRole="button"
      accessibilityLabel={
        unread ? "Notificaciones, " + unread + (unread === 1 ? " nueva" : " nuevas") : "Notificaciones"
      }
      style={{
        marginLeft: "auto",
        width: 44,
        height: 44,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.surface,
      }}
    >
      <Bell size={20} color={c.text} />
      {unread > 0 && (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 2,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderWidth: 2,
            borderColor: c.bg,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.greenLine,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 10.5, lineHeight: 12, color: "#0b1220" }}>
            {unread > 9 ? "9+" : unread}
          </Text>
        </View>
      )}
    </PressScale>
  );
}

// ---------- Menus (.rp-menu) ----------

export function MenuTitle({ children }: { children: string }) {
  const { c } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{ fontFamily: font.semibold, fontSize: 16.8, marginBottom: 4, color: c.text }}
    >
      {children}
    </Text>
  );
}

export function MenuRow({
  label,
  value,
  onPress,
  icon: Icon = ChevronRight,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  icon?: LucideIcon | null;
  /** A control instead of the chevron (Apariencia). */
  right?: ReactNode;
}) {
  const { c } = useTheme();
  const body = (
    <>
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 16, color: c.text }}>{label}</Text>
      {value ? (
        <Text numberOfLines={1} style={{ maxWidth: "55%", fontFamily: font.regular, fontSize: 14.7, color: c.muted }}>
          {value}
        </Text>
      ) : null}
      {right ?? (Icon && <Icon size={18} color={c.faint} />)}
    </>
  );
  const row: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  };
  if (!onPress) return <View style={row}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {body}
    </Pressable>
  );
}

// ---------- Catalog ----------

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  combustible: Fuel,
  comida: Utensils,
  mantenimiento: Wrench,
  salud: HeartPulse,
};

/** The business's logo when it has one, else its category icon. */
export function BusinessMark({
  category,
  logo,
  soft = false,
}: {
  category: string;
  logo?: string | null;
  /** Green background, as in the benefit detail header. */
  soft?: boolean;
}) {
  const { c } = useTheme();
  const Icon = CATEGORY_ICONS[category] || Gift;
  return (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: soft ? c.greenSoft : c.raised,
      }}
    >
      {logo ? (
        <Image source={{ uri: logo }} style={{ width: 52, height: 52 }} contentFit="cover" />
      ) : (
        <Icon size={24} strokeWidth={1.75} color={c.greenText} />
      )}
    </View>
  );
}

export type BenefitTile = {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_label: string;
  business: { name: string; address: string };
  logo: string | null;
  status: string | null;
};

/** `.rp-benefit`: the discount leads; title and business follow. */
export function BenefitCard({
  benefit: b,
  rail = false,
  width,
}: {
  benefit: BenefitTile;
  /** Tile in Inicio's sideways rail (no chevron, stacked). */
  rail?: boolean;
  width?: number;
}) {
  const { c } = useTheme();
  const open = Boolean(b.status && b.status.startsWith("Abierto"));
  const line = { fontFamily: font.regular, fontSize: 14.1, lineHeight: 20, color: c.muted };
  return (
    <PressScale
      onPress={() => router.push(("/benefit/" + b.id) as Href)}
      accessibilityRole="link"
      accessibilityLabel={b.discount_label + ", " + b.title + ", " + b.business.name}
      style={[
        {
          borderRadius: 22,
          backgroundColor: c.surface,
          gap: rail ? 18 : 14,
        },
        rail
          ? { width, padding: 18 }
          : {
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingLeft: 14,
              paddingRight: 16,
            },
      ]}
    >
      <BusinessMark category={b.category} logo={b.logo} />
      <View style={{ flex: rail ? undefined : 1 }}>
        <Text
          numberOfLines={rail ? 2 : 1}
          style={{ fontFamily: font.semibold, fontSize: 16.3, lineHeight: 22, letterSpacing: -0.16, color: c.text }}
        >
          {b.discount_label}
        </Text>
        <Text numberOfLines={1} style={line}>
          {b.title}
        </Text>
        <Text numberOfLines={1} style={line}>
          {b.business.name}
        </Text>
        {b.status && (
          <Text
            numberOfLines={1}
            style={{
              marginTop: 2,
              fontFamily: font.medium,
              fontSize: 13.1,
              color: open ? c.greenText : c.muted,
            }}
          >
            {b.status}
          </Text>
        )}
      </View>
      {!rail && <ChevronRight size={20} color={c.faint} />}
    </PressScale>
  );
}

/** `.rp-open`: "Abierto · hasta 17:00" in green, "Cerrado ahora" in gray. */
export function OpenStatus({ status }: { status: string | null }) {
  const { c } = useTheme();
  if (!status) return null;
  return (
    <Text
      style={{
        marginTop: 2,
        fontFamily: font.medium,
        fontSize: 13.4,
        color: status.startsWith("Abierto") ? c.greenText : c.muted,
      }}
    >
      {status}
    </Text>
  );
}

/** `.rp-photos`: sideways strip of the business's photos. */
export function Photos({ urls, name }: { urls: string[]; name: string }) {
  const { c } = useTheme();
  if (!urls.length) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      snapToInterval={268}
      decelerationRate="fast"
    >
      {urls.map((url, i) => (
        <Image
          key={url}
          source={{ uri: url }}
          accessibilityLabel={name + ", foto " + (i + 1)}
          contentFit="cover"
          style={{ width: 260, aspectRatio: 4 / 3, borderRadius: 18, backgroundColor: c.surface2 }}
        />
      ))}
    </ScrollView>
  );
}
