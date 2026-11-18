import { useState } from "react";
import { View } from "react-native";
import { router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { Plus } from "lucide-react-native";
import { LoadError, Loading, Screen } from "@/components/platform/Screen";
import { Badge, Button, H1, H2, Message, Muted, Panel, TextLink } from "@/components/platform/ui";
import { api } from "@/lib/api";
import { invalidate, useApi } from "@/lib/use-api";
import type { BusinessBenefits } from "@/components/platform/business";

// Beneficios for owners (BusinessBenefits on the web): create a benefit,
// edit proposals, pause or reactivate approved ones, propose changes.
// RidePerks reviews every new benefit and every change before publishing.

const edit = (query: string) => router.push(("/manage/benefit?" + query) as Href);

function Toggle({ id, active, onDone }: { id: string; active: boolean; onDone: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={{ gap: 8, alignItems: "flex-start" }}>
      <Button
        label={active ? "Pausar beneficio" : "Activar beneficio aprobado"}
        variant="secondary"
        size="md"
        onCard
        loading={pending}
        onPress={async () => {
          setPending(true);
          setError(null);
          try {
            await api("/api/app/business/benefits/toggle", { method: "POST", body: { id, active: !active } });
            void Haptics.selectionAsync();
            onDone();
          } catch (e) {
            setError(e instanceof Error ? e.message : "No pudimos cambiar el estado.");
          } finally {
            setPending(false);
          }
        }}
      />
      {error && <Message kind="error">{error}</Message>}
    </View>
  );
}

export default function BusinessBenefitsScreen() {
  const { data, error, refreshing, reload, refresh } = useApi<BusinessBenefits>("/api/app/business/benefits");
  return (
    <Screen tab refreshing={refreshing} onRefresh={reload}>
      <View style={{ gap: 6 }}>
        <H1>Beneficios</H1>
        <Muted>RidePerks revisa cada beneficio nuevo y cada cambio antes de publicarlo.</Muted>
      </View>
      <Button label="Crear un beneficio" icon={Plus} onPress={() => edit("new=1")} />
      {!data ? (
        error ? (
          <LoadError message={error} onRetry={reload} />
        ) : (
          <Loading />
        )
      ) : (
        <>
          {data.revisions.map((r) => (
            <Panel key={r.id} style={{ gap: 12 }}>
              <Badge label={r.status} tone={r.tone} />
              <H2>{r.title}</H2>
              {r.notes ? <Muted>{r.notes}</Muted> : null}
              {r.editable && <TextLink label="Editar propuesta" onPress={() => edit("revision=" + r.id)} />}
            </Panel>
          ))}
          {data.benefits.map((b) => (
            <Panel key={b.id} style={{ gap: 12 }}>
              <Badge label={b.status} tone={b.tone} />
              <H2>{b.discount_label}</H2>
              <Muted>{b.title}</Muted>
              {b.admin_paused ? (
                <Muted>Para reactivarlo, escríbenos desde Cuenta → Ayuda.</Muted>
              ) : (
                <Toggle
                  id={b.id}
                  active={b.is_active}
                  onDone={() => {
                    invalidate("/api/app/business/benefits");
                    void refresh();
                  }}
                />
              )}
              {!b.has_revision && <TextLink label="Proponer cambios" onPress={() => edit("benefit=" + b.id)} />}
            </Panel>
          ))}
          {!data.benefits.length && !data.revisions.length && (
            <Muted>Todavía no tienes beneficios. Crea el primero arriba.</Muted>
          )}
        </>
      )}
    </Screen>
  );
}
