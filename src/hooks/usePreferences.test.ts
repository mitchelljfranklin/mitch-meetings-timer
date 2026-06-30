import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePreferences } from "./usePreferences";

const SOUND_KEY = "meeting-timer:sound-enabled";
const CONFETTI_KEY = "meeting-timer:confetti-enabled";

beforeEach(() => {
  window.localStorage.clear();
});

describe("usePreferences", () => {
  it("defaults sound and confetti to enabled", () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.confettiEnabled).toBe(true);
  });

  it("persists toggles to localStorage", () => {
    const { result } = renderHook(() => usePreferences());
    act(() => result.current.setSoundEnabled(false));
    act(() => result.current.setConfettiEnabled(false));
    expect(result.current.soundEnabled).toBe(false);
    expect(result.current.confettiEnabled).toBe(false);
    expect(window.localStorage.getItem(SOUND_KEY)).toBe("false");
    expect(window.localStorage.getItem(CONFETTI_KEY)).toBe("false");
  });

  it("reads persisted values on mount", () => {
    window.localStorage.setItem(SOUND_KEY, "false");
    const { result } = renderHook(() => usePreferences());
    expect(result.current.soundEnabled).toBe(false);
    expect(result.current.confettiEnabled).toBe(true);
  });
});
