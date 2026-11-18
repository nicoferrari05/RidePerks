import { useState } from "react";
import { Linking, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArrowUpRight, Phone, Search } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import {
  BenefitCard,
  BusinessMark,
  Button,
  Chips,
  Empty,
  H1,
  Muted,
  OpenStatus,
  Panel,
  Photos,
  Segmented,
  type BenefitTile,
} from "@/components/platform/ui";
import { ComingSoon, FavoriteButton } from "@/components/platform/driver";
import { MapPreview } from "@/components/platform/MapPreview";
import { useApi } from "@/lib/use-api";
import { categories, isOpen, mapsLink, matches, phoneLink } from "@/lib/format";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Beneficios and Comercios (BenefitsView / DirectoryView on the web), one
// screen with the same Beneficios | Comercios switch. Search and filters
// apply on the phone, with the web's rules.

type Benefits = { live: boolean; benefits: BenefitTile[]; saved: string[] };
type Business = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string | null;
  logo: string | null;
  photos: string[];
  status: string | null;
  saved: boolean;
};
type Directory = { live: boolean; businesses: Business[] };

function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ justifyContent: "center" }}>
      <View style={{ position: "absolute", left: 16, zIndex: 1 }} pointerEvents="none">
        <Search size={18} color={c.faint} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={c.faint}
        accessibilityLabel={label}
        maxLength={60}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          minHeight: 50,
          paddingLeft: 44,
          paddingRight: 16,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: focused ? c.text : "transparent",
          backgroundColor: focused ? c.raised : c.surface,
          fontFamily: font.regular,
          fontSize: 16,
          color: c.text,
        }}
      />
    </View>
  );
}

function NoMatches({ savedOnly, filtered, clear }: { savedOnly: boolean; filtered: boolean; clear: () => void }) {
  return (
    <Empty
      title={savedOnly ? "Todavía no tienes favoritos" : "No encontramos resultados"}
      action={filtered ? { label: "Quitar filtros", onPress: clear } : undefined}
    >
      {savedOnly
        ? "Toca el corazón en un beneficio o comercio para guardarlo aquí."
        : "Prueba con otra palabra o quita algún filtro."}
    </Empty>
  );
}

export default function BenefitsScreen() {
  const params = useLocalSearchParams<{ tab?: string; saved?: string }>();
  const [tab, setTab] = useState<"benefits" | "directory">(params.tab === "directory" ? "directory" : "benefits");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(params.saved === "1");
  const [lastParams, setLastParams] = useState(params);
  if (params.tab !== lastParams.tab || params.saved !== lastParams.saved) {
    // Arriving again from a link (Favoritos in Cuenta, a notification).
    setLastParams(params);
    if (params.tab) setTab(params.tab === "directory" ? "directory" : "benefits");
    if (params.saved) setSaved(params.saved === "1");
  }

  const benefits = useApi<Benefits>("/api/app/driver/benefits", tab === "benefits");
  const directory = useApi<Directory>("/api/app/driver/directory", tab === "directory");
  const current = tab === "benefits" ? benefits : directory;

  const filtered = Boolean(q.trim() || category || open || saved);
  const clear = () => {
    setQ("");
    setCategory("");
    setOpen(false);
    setSaved(false);
  };
  const toggles = [
    { id: "open", label: "Abierto ahora", selected: open, onPress: () => setOpen((v) => !v) },
    { id: "saved", label: "Favoritos", selected: saved, onPress: () => setSaved((v) => !v) },
  ];
  const savedOnly = saved && !q.trim() && !category && !open;

  return (
    <Screen tab refreshing={current.refreshing} onRefresh={current.reload}>
      <H1>Beneficios</H1>
      <Segmented
        label="Catálogo"
        value={tab}
        onChange={setTab}
        options={[
          { id: "benefits", label: "Beneficios" },
          { id: "directory", label: "Comercios" },
        ]}
      />
      {tab === "directory" && <MapPreview />}

      {!current.data ? (
        current.error ? (
          <LoadError message={current.error} onRetry={current.reload} />
        ) : (
          <Loading />
        )
      ) : !current.data.live ? (
        <ComingSoon />
      ) : tab === "benefits" && benefits.data ? (
        <>
          <View style={{ gap: 12 }}>
            <SearchBox value={q} onChange={setQ} label="Buscar beneficios o comercios" />
            <Chips
              items={[
                ...toggles,
                ...Object.entries(categories).map(([id, label]) => ({
                  id,
                  label,
                  selected: category === id,
                  onPress: () => setCategory((v) => (v === id ? "" : id)),
                })),
              ]}
            />
          </View>
          {(() => {
            const savedIds = new Set(benefits.data.saved);
            const list = benefits.data.benefits.filter(
              (b) =>
                (!category || b.category === category) &&
                (!saved || savedIds.has(b.id)) &&
                (!open || isOpen(b.status)) &&
                matches(q, b.title, b.discount_label, b.description, b.business.name),
            );
            return list.length ? (
              <View style={{ gap: 10 }}>
                {list.map((b) => (
                  <BenefitCard key={b.id} benefit={b} />
                ))}
              </View>
            ) : (
              <NoMatches savedOnly={savedOnly} filtered={filtered} clear={clear} />
            );
          })()}
        </>
      ) : directory.data ? (
        <>
          <View style={{ gap: 12 }}>
            <SearchBox value={q} onChange={setQ} label="Buscar comercios" />
            <Chips items={toggles} />
          </View>
          {(() => {
            const list = directory.data.businesses.filter(
              (b) =>
                (!saved || b.saved) && (!open || isOpen(b.status)) && matches(q, b.name, b.description, b.address),
            );
            return list.length ? (
              <View style={{ gap: 10 }}>
                {list.map((b) => (
                  <BusinessCard
                    key={b.id}
                    b={b}
                    onSaved={(value) =>
                      directory.mutate((d) => ({
                        ...d,
                        businesses: d.businesses.map((x) => (x.id === b.id ? { ...x, saved: value } : x)),
                      }))
                    }
                  />
                ))}
              </View>
            ) : (
              <NoMatches savedOnly={savedOnly} filtered={filtered} clear={clear} />
            );
          })()}
        </>
      ) : null}
    </Screen>
  );
}

function BusinessCard({ b, onSaved }: { b: Business; onSaved: (saved: boolean) => void }) {
  const { c } = useTheme();
  return (
    <Panel style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <BusinessMark category={b.category} logo={b.logo} />
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={{ fontFamily: font.semibold, fontSize: 19.2, lineHeight: 25, letterSpacing: -0.38, color: c.text }}
          >
            {b.name}
          </Text>
          <Muted>{b.address}</Muted>
          <OpenStatus status={b.status} />
        </View>
        <FavoriteButton kind="business" id={b.id} saved={b.saved} name={b.name} onCard onChange={onSaved} />
      </View>
      {b.description ? <Muted>{b.description}</Muted> : null}
      <Photos urls={b.photos} name={b.name} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Button
          label="Cómo llegar"
          icon={ArrowUpRight}
          variant="white"
          size="md"
          onPress={() => void Linking.openURL(mapsLink(b.name, b.address))}
        />
        {b.phone && (
          <Button
            label="Llamar"
            icon={Phone}
            variant="white"
            size="md"
            onPress={() => void Linking.openURL(phoneLink(b.phone!))}
          />
        )}
      </View>
    </Panel>
  );
}
