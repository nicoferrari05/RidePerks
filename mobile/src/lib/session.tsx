import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, currentTokens, forgetSession, onSessionLost, saveSession } from "./api";
import type { Tokens } from "./tokens-store";
import { forgetCachedData } from "./use-api";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  platform: string | null;
  status: "pending" | "verified" | "rejected" | "suspended";
  role: "driver" | "business";
  onboarded_at: string | null;
};

export type Audience = "driver" | "business";

type State =
  | { status: "loading" }
  /** notice: shown on the sign-in screen (e.g. after deleting the account). */
  | { status: "signedOut"; notice?: string }
  | { status: "signedIn"; profile: Profile; unread: number }
  /** A saved session exists but the server couldn't be reached. */
  | { status: "unreachable"; message: string };

type SessionValue = {
  state: State;
  signIn: (email: string, password: string, audience: Audience) => Promise<void>;
  signOut: () => Promise<void>;
  /** Forgets this phone's session without asking the server (account closed). */
  endSession: (notice?: string) => Promise<void>;
  reload: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

// Reads the saved session and asks the server who it belongs to.
async function loadSession(): Promise<State> {
  if (!(await currentTokens())) return { status: "signedOut" };
  try {
    const me = await api<{ profile: Profile; unread: number }>("/api/app/me");
    return { status: "signedIn", profile: me.profile, unread: me.unread };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await forgetSession();
      return { status: "signedOut" };
    }
    return {
      status: "unreachable",
      message: e instanceof Error ? e.message : "No pudimos conectar.",
    };
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const reload = useCallback(async () => {
    setState(await loadSession());
  }, []);

  useEffect(() => {
    let active = true;
    void loadSession().then((next) => {
      if (active) setState(next);
    });
    const stop = onSessionLost(() => setState({ status: "signedOut" }));
    return () => {
      active = false;
      stop();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, audience: Audience) => {
      const result = await api<{ session: Tokens; profile: Profile }>(
        "/api/app/auth/login",
        { method: "POST", body: { email, password, audience }, auth: false },
      );
      await saveSession(result.session);
      setState({ status: "signedIn", profile: result.profile, unread: 0 });
      // The unread count comes with /me; refresh it quietly.
      void reload();
    },
    [reload],
  );

  const signOut = useCallback(async () => {
    try {
      await api("/api/app/auth/logout", { method: "POST" });
    } catch {
      /* Offline or already expired: forgetting it here is what matters. */
    }
    await forgetSession();
    forgetCachedData();
    setState({ status: "signedOut" });
  }, []);

  const endSession = useCallback(async (notice?: string) => {
    await forgetSession();
    forgetCachedData();
    setState({ status: "signedOut", notice });
  }, []);

  const value = useMemo(
    () => ({ state, signIn, signOut, endSession, reload }),
    [state, signIn, signOut, endSession, reload],
  );
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
