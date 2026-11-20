import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Enter } from "@/components/Enter";
import { Field, Notice, PrimaryButton, TextLink, authText } from "@/components/auth";
import { api } from "@/lib/api";
import { auth } from "@/theme/tokens";

// Recuperar acceso: the web's /recover. The email's link opens the web,
// where the person picks the new password; then they sign in here again.
const backToLogin = () => (router.canGoBack() ? router.back() : router.replace("/login"));

export default function RecoverScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (pending) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Escribe un correo válido.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await api<{ message: string }>("/api/app/auth/recover", {
        method: "POST",
        body: { email: email.trim() },
        auth: false,
      });
      setSent(result.message);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos conectar. Intenta nuevamente.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={styles.column}>
            <Enter>
              <TextLink onPress={backToLogin}>← Volver</TextLink>
            </Enter>
            <Enter delay={200}>
              <Text style={authText.title} accessibilityRole="header">
                Recupera tu acceso.
              </Text>
            </Enter>
            <Enter delay={300}>
              <Text style={[authText.small, styles.lead]}>
                Te enviaremos un enlace para elegir una nueva contraseña.
              </Text>
            </Enter>
            <Enter delay={400} style={styles.form}>
              <Field
                label="Correo electrónico"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setSent(null);
                }}
                placeholder="tu@correo.com"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                inputMode="email"
                maxLength={254}
                returnKeyType="send"
                onSubmitEditing={submit}
              />
              {error && <Notice>{error}</Notice>}
              {sent && <Notice tone="success">{sent}</Notice>}
              <PrimaryButton
                label={sent ? "Enviar de nuevo" : "Enviar enlace"}
                pending={pending}
                onPress={submit}
              />
            </Enter>
            <Enter delay={500}>
              <Text style={[authText.small, styles.center]}>
                <TextLink onPress={backToLogin}>Volver a iniciar sesión →</TextLink>
              </Text>
            </Enter>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: auth.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  column: { width: "100%", maxWidth: 448, alignSelf: "center", gap: 20 },
  lead: { fontSize: 16, lineHeight: 24 },
  form: { gap: 16 },
  center: { textAlign: "center" },
});
