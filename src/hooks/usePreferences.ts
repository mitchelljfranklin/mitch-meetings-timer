import { useCallback, useState } from "react";

const SOUND_KEY = "meeting-timer:sound-enabled";
const CONFETTI_KEY = "meeting-timer:confetti-enabled";

function readBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

function writeBoolean(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures (e.g. private browsing).
  }
}

function usePersistedBoolean(
  key: string,
  fallback: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => readBoolean(key, fallback));

  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      writeBoolean(key, next);
    },
    [key]
  );

  return [value, set];
}

export function usePreferences(): {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (enabled: boolean) => void;
} {
  const [soundEnabled, setSoundEnabled] = usePersistedBoolean(SOUND_KEY, true);
  const [confettiEnabled, setConfettiEnabled] = usePersistedBoolean(
    CONFETTI_KEY,
    true
  );

  return {
    soundEnabled,
    setSoundEnabled,
    confettiEnabled,
    setConfettiEnabled,
  };
}
