import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { platform, type PlatformColors } from "./tokens";

// Claro / Oscuro, chosen in Cuenta → Apariencia like on the web (same key,
// rp_app_theme). Light unless the person picks dark.

export type Mode = "light" | "dark";
const KEY = "rp_app_theme";

type ThemeValue = { mode: Mode; c: PlatformColors; setMode: (mode: Mode) => void };

const ThemeContext = createContext<ThemeValue>({
  mode: "light",
  c: platform.light,
  setMode: () => {},
});

async function readMode(): Promise<Mode> {
  try {
    const value =
      Platform.OS === "web"
        ? globalThis.localStorage?.getItem(KEY)
        : await SecureStore.getItemAsync(KEY);
    return value === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function saveMode(mode: Mode) {
  try {
    if (Platform.OS === "web") globalThis.localStorage?.setItem(KEY, mode);
    else void SecureStore.setItemAsync(KEY, mode);
  } catch {
    /* Applies for this session only. */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  useEffect(() => {
    let active = true;
    void readMode().then((stored) => {
      if (active) setModeState(stored);
    });
    return () => {
      active = false;
    };
  }, []);
  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    saveMode(next);
  }, []);
  const value = useMemo(
    () => ({ mode, c: platform[mode], setMode }),
    [mode, setMode],
  );
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  return use(ThemeContext);
}

/** Styles that follow the theme: `const s = useStyles(makeStyles)`. */
export function useStyles<T>(factory: (c: PlatformColors) => T): T {
  const { c } = useTheme();
  return useMemo(() => factory(c), [factory, c]);
}
