import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCountdown } from "./useCountdown";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useCountdown", () => {
  it("starts at the default 5 minutes", () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.remainingMs).toBe(5 * 60 * 1000);
    expect(result.current.isRunning).toBe(false);
  });

  it("clamps hours and recomputes total from the clamped value", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.setHours(200));
    expect(result.current.hours).toBe(99);
    expect(result.current.totalMs).toBe((99 * 3600 + 5 * 60) * 1000);
  });

  it("ticks down while running", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingMs).toBeLessThanOrEqual(5 * 60 * 1000 - 900);
    expect(result.current.remainingMs).toBeGreaterThan(5 * 60 * 1000 - 1100);
  });

  it("finishes when the duration elapses", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => {
      result.current.setMinutes(0);
      result.current.setSeconds(2);
    });
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isFinished).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remainingMs).toBe(0);
  });

  it("pauses and resumes", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => result.current.pause());
    const remaining = result.current.remainingMs;
    expect(result.current.isPaused).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingMs).toBe(remaining);
    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(true);
  });
});
