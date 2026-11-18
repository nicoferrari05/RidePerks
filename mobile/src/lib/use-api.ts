import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "./api";

// Screen data: shows what was loaded last time right away, then refreshes
// every time the screen comes into view (like the web's 30-second client
// cache, but always fresh after a change). Pull-to-refresh calls reload().

const cache = new Map<string, unknown>();

export function forgetCachedData() {
  cache.clear();
}

/** Drops one screen's cached data so its next visit reloads it. */
export function invalidate(path: string) {
  cache.delete(path);
}

export function useApi<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | undefined>(() => cache.get(path) as T | undefined);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const next = await api<T>(path);
      cache.set(path, next);
      if (mounted.current) {
        setData(next);
        setError(null);
      }
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : "No pudimos conectar.");
    }
  }, [path]);

  useFocusEffect(
    useCallback(() => {
      if (enabled) void load();
    }, [load, enabled]),
  );

  const reload = useCallback(async () => {
    setRefreshing(true);
    await load();
    if (mounted.current) setRefreshing(false);
  }, [load]);

  /** Local change before the server answers (favorites, ratings). */
  const mutate = useCallback(
    (update: (current: T) => T) => {
      setData((current) => {
        if (current === undefined) return current;
        const next = update(current);
        cache.set(path, next);
        return next;
      });
    },
    [path],
  );

  /** refresh: reload quietly (polling), without the pull-to-refresh spinner. */
  return { data, error, refreshing, reload, refresh: load, mutate };
}
