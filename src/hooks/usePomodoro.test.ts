import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePomodoro } from "./usePomodoro";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("usePomodoro", () => {
  it("starts in the work phase at 25 minutes", () => {
    const { result } = renderHook(() => usePomodoro());
    expect(result.current.currentPhase).toBe("work");
    expect(result.current.remainingMs).toBe(25 * 60 * 1000);
  });

  it("counts down without immediately finishing the phase", () => {
    const { result } = renderHook(() => usePomodoro());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Regression guard for the `Date.now() + remainingMs || durationMs` bug:
    // the phase must still be active and counting down, not instantly switched.
    expect(result.current.currentPhase).toBe("work");
    expect(result.current.remainingMs).toBeLessThan(25 * 60 * 1000);
    expect(result.current.remainingMs).toBeGreaterThan(25 * 60 * 1000 - 2000);
  });

  it("switches work -> break and break -> work, counting completed work sessions", () => {
    const { result } = renderHook(() => usePomodoro());
    act(() => {
      result.current.setWorkDuration(1);
      result.current.setBreakDuration(1);
    });
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(result.current.currentPhase).toBe("break");
    expect(result.current.sessions).toBe(1);

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(result.current.currentPhase).toBe("work");
    expect(result.current.sessions).toBe(1);
  });

  it("takes a long break after the configured number of work sessions", () => {
    const { result } = renderHook(() => usePomodoro());
    act(() => result.current.setSessionsBeforeLongBreak(2));

    act(() => result.current.skip()); // work -> break (session 1)
    expect(result.current.currentPhase).toBe("break");
    expect(result.current.sessions).toBe(1);

    act(() => result.current.skip()); // break -> work
    expect(result.current.currentPhase).toBe("work");

    act(() => result.current.skip()); // work -> long break (session 2)
    expect(result.current.currentPhase).toBe("longBreak");
    expect(result.current.sessions).toBe(2);
  });

  it("skips to the next phase, not running", () => {
    const { result } = renderHook(() => usePomodoro());
    act(() => result.current.start());
    act(() => result.current.skip());
    expect(result.current.currentPhase).toBe("break");
    expect(result.current.isRunning).toBe(false);
  });
});
