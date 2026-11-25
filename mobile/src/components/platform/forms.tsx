import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown, Eye, EyeOff } from "lucide-react-native";
import { PressScale } from "@/components/PressScale";
import { useTheme } from "@/theme/theme";
import { font } from "@/theme/tokens";

// Platform form controls (.rp-field, .rp-password, .rp-check in
// app/platform.css): 52px fields on the soft gray surface (white inside a
// gray card), a dark outline while typing, labels above.

function Label({ children, id }: { children: string; id?: string }) {
  const { c } = useTheme();
  return (
    <Text nativeID={id} style={{ fontFamily: font.medium, fontSize: 14.1, color: c.text }}>
      {children}
    </Text>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <Text style={{ fontFamily: font.regular, fontSize: 13.4, lineHeight: 20, color: c.muted }}>{children}</Text>
  );
}

function useFieldStyle(onCard: boolean, focused: boolean, multiline = false) {
  const { c } = useTheme();
  return {
    minHeight: multiline ? 120 : 52,
    paddingHorizontal: 16,
    paddingVertical: multiline ? 14 : 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: focused ? c.text : "transparent",
    backgroundColor: focused || onCard ? c.raised : c.surface,
    fontFamily: font.regular,
    fontSize: 16,
    color: c.text,
    textAlignVertical: multiline ? ("top" as const) : ("center" as const),
  };
}

export function Field({
  label,
  hint,
  onCard = false,
  multiline = false,
  ...input
}: TextInputProps & { label: string; hint?: string; onCard?: boolean }) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const style = useFieldStyle(onCard, focused, multiline);
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <TextInput
        {...input}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={c.faint}
        onFocus={(e) => {
          setFocused(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          input.onBlur?.(e);
        }}
        style={style}
      />
      {hint ? <Hint>{hint}</Hint> : null}
    </View>
  );
}

export function PasswordField({
  label,
  value,
  onChangeText,
  newPassword = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  newPassword?: boolean;
}) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const style = useFieldStyle(false, focused);
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={newPassword ? "new-password" : "current-password"}
          textContentType={newPassword ? "newPassword" : "password"}
          maxLength={128}
          accessibilityLabel={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[style, { paddingRight: 54 }]}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {visible ? <EyeOff size={20} color={c.muted} /> : <Eye size={20} color={c.muted} />}
        </Pressable>
      </View>
      {newPassword && <Hint>Al menos 10 caracteres.</Hint>}
    </View>
  );
}

/** A `<select>`: looks like a field, opens the options in a sheet from below. */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecciona una opción",
}: {
  label: string;
  value: T | "";
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value);
  return (
    <View style={{ gap: 8 }}>
      <Label>{label}</Label>
      <PressScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label + ": " + (current?.label || placeholder)}
        style={{
          minHeight: 52,
          paddingHorizontal: 16,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: c.surface,
        }}
      >
        <Text style={{ fontFamily: font.regular, fontSize: 16, color: current ? c.text : c.faint }}>
          {current?.label || placeholder}
        </Text>
        <ChevronDown size={18} color={c.muted} />
      </PressScale>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="Cerrar"
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(11, 18, 32, 0.4)" }}
        />
        <View
          style={{
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: 20 + insets.bottom,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: c.bg,
          }}
        >
          <View style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 999, backgroundColor: c.surface2, marginBottom: 12 }} />
          <Text style={{ fontFamily: font.semibold, fontSize: 17, color: c.text, marginBottom: 8 }}>{label}</Text>
          <ScrollView style={{ maxHeight: 360 }}>
            {options.map((option) => {
              const selected = option.id === value;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    minHeight: 56,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderBottomColor: c.line,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ fontFamily: selected ? font.semibold : font.regular, fontSize: 16, color: c.text }}>
                    {option.label}
                  </Text>
                  {selected && <Check size={20} color={c.greenText} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

/** `.rp-check`: a checkbox with its sentence. */
export function Checkbox({
  checked,
  onChange,
  children,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, opacity: disabled ? 0.5 : 1 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          marginTop: 2,
          borderRadius: 5,
          borderWidth: checked ? 0 : 1.5,
          borderColor: c.muted,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: checked ? c.accent : "transparent",
        }}
      >
        {checked && <Check size={14} strokeWidth={3} color={c.accentFg} />}
      </View>
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 14.7, lineHeight: 22.8, color: c.text }}>
        {children}
      </Text>
    </Pressable>
  );
}
