import { useCallback, useEffect, useRef, useState } from "react";
import { loadSettings, onSettingsChanged, saveSettings } from "../services/settings";
import type { CharmSettings } from "../types/settings";

type SettingsUpdater = (current: CharmSettings) => CharmSettings;

interface UseCharmSettingsOptions {
  listenForChanges?: boolean;
}

export function useCharmSettings({
  listenForChanges = false,
}: UseCharmSettingsOptions = {}) {
  const [settings, setSettings] = useState<CharmSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestPendingSave = useRef<CharmSettings | null>(null);
  const saveInProgress = useRef(false);

  useEffect(() => {
    let active = true;
    let stopListening: (() => void) | undefined;

    const initialize = async () => {
      if (listenForChanges) {
        const unlisten = await onSettingsChanged((next) => {
          if (active) setSettings(next);
        });
        if (!active) {
          unlisten();
          return;
        }
        stopListening = unlisten;
      }

      const loaded = await loadSettings();
      if (active) setSettings(loaded);
    };

    initialize().catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "Could not load settings.");
      }
    });

    return () => {
      active = false;
      stopListening?.();
    };
  }, [listenForChanges]);

  const flushPendingSaves = useCallback(async function flushPendingSaves() {
    if (saveInProgress.current) return;
    saveInProgress.current = true;

    try {
      while (latestPendingSave.current) {
        const pending = latestPendingSave.current;
        latestPendingSave.current = null;
        await saveSettings(pending);
      }
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save settings.");
      try {
        setSettings(await loadSettings());
      } catch {
        // Keep the optimistic value visible if recovery also fails.
      }
    } finally {
      saveInProgress.current = false;
      // A value can arrive between the loop condition and this flag update.
      if (latestPendingSave.current) void flushPendingSaves();
    }
  }, []);

  const updateSettings = useCallback((updater: SettingsUpdater) => {
    setSettings((current) => {
      if (!current) return current;
      const next = updater(current);
      setError(null);
      latestPendingSave.current = next;

      // Send the first value immediately, then coalesce rapid slider input to
      // the newest value while that write is in flight. This keeps the desktop
      // responsive without allowing stale writes to land after newer ones.
      void flushPendingSaves();

      return next;
    });
  }, [flushPendingSaves]);

  return { settings, updateSettings, error };
}
