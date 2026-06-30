import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCountdown } from "./useCountdown";
import { usePomodoro } from "./usePomodoro";
import { useStopwatch } from "./useStopwatch";

const NOW = 1_700_000_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  window.sessionStorage.clear();
});

afterEach(() => vi.useRealTimers());

describe("timer persistence", () => {
  it("restores and re-arms a running countdown", () => {
    window.sessionStorage.setItem(
      "meeting-timer:countdown",
      JSON.stringify({
        hours: 0,
        minutes: 2,
        seconds: 0,
        totalMs: 120000,
        remainingMs: 120000,
        isRunning: true,
        isPaused: false,
        isFinished: false,
        endTime: NOW + 120000,
      })
    );

    const { result } = renderHook(() => useCountdown());
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remainingMs).toBeGreaterThan(118000);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingMs).toBeLessThanOrEqual(119000);
  });

  it("restores a paused countdown", () => {
    window.sessionStorage.setItem(
      "meeting-timer:countdown",
      JSON.stringify({
        hours: 0,
        minutes: 2,
        seconds: 0,
        totalMs: 120000,
        remainingMs: 90000,
        isRunning: false,
        isPaused: true,
        isFinished: false,
        endTime: 0,
      })
    );

    const { result } = renderHook(() => useCountdown());
    expect(result.current.isPaused).toBe(true);
    expect(result.current.remainingMs).toBe(90000);
  });

  it("advances a pomodoro phase that elapsed while away", () => {
    window.sessionStorage.setItem(
      "meeting-timer:pomodoro",
      JSON.stringify({
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        currentPhase: "work",
        remainingMs: 60000,
        phaseTotalMs: 1500000,
        isRunning: true,
        isPaused: false,
        sessions: 0,
        endTime: NOW - 1000,
      })
    );

    const { result } = renderHook(() => usePomodoro());
    expect(result.current.currentPhase).toBe("break");
    expect(result.current.isRunning).toBe(false);
    expect(result.current.sessions).toBe(1);
  });

  it("restores and continues a running stopwatch", () => {
    window.sessionStorage.setItem(
      "meeting-timer:stopwatch",
      JSON.stringify({
        isRunning: true,
        accumulated: 0,
        startTimestamp: NOW - 5000,
        lapStart: 0,
        laps: [],
        elapsedMs: 0,
      })
    );

    const { result } = renderHook(() => useStopwatch());
    expect(result.current.isRunning).toBe(true);
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(5000);
  });
});
