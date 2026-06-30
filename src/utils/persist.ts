export function loadState<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures (e.g. private browsing, quota).
  }
}
