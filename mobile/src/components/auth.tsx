import { useState, type ReactNode, type Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from "react-native";
import { CarFront, Eye, EyeOff, KeyRound, Store } from "lucide-react-native";
import { PressScale } from "./PressScale";
import { auth, font } from "@/theme/tokens";
import type { Audience } from "@/lib/session";

// The sign-in screens' controls, matching components/ui/sign-in.tsx and
// the Conductor / Comercio switch in components/platform/AuthPage.tsx.

export type AccessTab = Audience | "pin";

export function AudienceSwitch({
  value,
  onChange,
}: {
  value: AccessTab;
  onChange: (value: AccessTab) => void;
}) {
  // Sign-in offers a third way in: the business PIN for on-site staff.
  const options = [
    { id: "driver" as const, label: "Conductor", Icon: CarFront },
    { id: "business" as const, label: "Comercio", Icon: Store },
    { id: "pin" as const, label: "PIN", Icon: KeyRound },
  ];
  return (
    <View style={styles.switch} accessibilityRole="tablist" accessibilityLabel="Tipo de acceso">
      {options.map(({ id, label, Icon }) => {
        const active = value === id;
        const color = active ? auth.switchActiveFg : auth.text;
        return (
          <PressScale
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(id)}
            style={[styles.switchItem, active && styles.switchItemActive]}
          >
            <Icon size={18} color={color} strokeWidth={2} />
            <Text style={[styles.switchLabel, { color }]}>{label}</Text>
          </PressScale>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  password = false,
  secretName = "contraseña",
  ref,
  ...input
}: TextInputProps & {
  label: string;
  password?: boolean;
  /** What the eye button shows or hides ("contraseña", "PIN"). */
  secretName?: string;
  ref?: Ref<TextInputInstance>;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          {...input}
          ref={ref}
          secureTextEntry={password && !visible}
          placeholderTextColor={auth.placeholder}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[styles.input, password && styles.inputWithToggle]}
          accessibilityLabel={label}
        />
        {password && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={(visible ? "Ocultar " : "Mostrar ") + secretName}
            hitSlop={8}
            style={styles.toggle}
          >
            {visible ? (
              <EyeOff size={20} color={auth.muted} />
            ) : (
              <Eye size={20} color={auth.muted} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  pendingLabel = "Un momento…",
  pending = false,
  onPress,
}: {
  label: string;
  pendingLabel?: string;
  pending?: boolean;
  onPress: () => void;
}) {
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: pending, busy: pending }}
      disabled={pending}
      onPress={onPress}
      style={[styles.button, pending && styles.buttonPending]}
    >
      <Text style={styles.buttonText}>{pending ? pendingLabel : label}</Text>
    </PressScale>
  );
}

export function TextLink({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  return (
    <Text style={styles.link} onPress={onPress} accessibilityRole="link" suppressHighlighting>
      {children}
    </Text>
  );
}

export const authText = StyleSheet.create({
  title: {
    fontFamily: font.semibold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: auth.text,
  },
  small: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: auth.muted,
  },
});

const styles = StyleSheet.create({
  switch: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: auth.border,
    borderRadius: 999,
  },
  switchItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  switchItemActive: { backgroundColor: auth.switchActiveBg },
  switchLabel: { fontFamily: font.semibold, fontSize: 13.6 },
  label: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20,
    color: auth.muted,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: auth.border,
    borderRadius: 16,
    backgroundColor: auth.inputBg,
  },
  inputWrapFocused: {
    borderColor: auth.inputFocusBorder,
    backgroundColor: auth.inputFocusBg,
  },
  input: {
    fontFamily: font.regular,
    fontSize: 16,
    // 14px padding around a 24px line, like the web's p-3.5 + text-base.
    // A fixed height instead of lineHeight: iOS shifts single-line text
    // when a TextInput has a lineHeight.
    height: 52,
    color: auth.text,
    paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 16,
  },
  inputWithToggle: { paddingRight: 48 },
  toggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  notice: {
    borderRadius: 16,
    backgroundColor: auth.errorBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noticeText: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: auth.errorText,
  },
  button: {
    width: "100%",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: auth.primary,
    paddingVertical: 14,
  },
  buttonPending: { opacity: 0.6 },
  buttonText: {
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24,
    color: auth.primaryFg,
  },
  link: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: auth.link,
  },
});
