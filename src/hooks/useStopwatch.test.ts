import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStopwatch } from "./useStopwatch";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useStopwatch", () => {
  it("counts up while running", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(950);
  });

  it("records laps with split and total times", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => result.current.lap());
    expect(result.current.laps).toHaveLength(1);
    expect(result.current.laps[0].total).toBeGreaterThanOrEqual(950);
    expect(result.current.laps[0].split).toBeGreaterThanOrEqual(950);
  });

  it("freezes when stopped", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => result.current.stop());
    const frozen = result.current.elapsedMs;
    expect(result.current.isRunning).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.elapsedMs).toBe(frozen);
  });

  it("resets to zero and clears laps", () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => result.current.lap());
    act(() => result.current.reset());
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.laps).toHaveLength(0);
    expect(result.current.isRunning).toBe(false);
  });
});
