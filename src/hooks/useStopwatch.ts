import { useState, useRef, useCallback, useEffect } from "react";
import type { Lap } from "../types";
import { loadState, saveState } from "../utils/persist";

interface StopwatchState {
  elapsedMs: number;
  isRunning: boolean;
  laps: Lap[];
}

interface StopwatchActions {
  start: () => void;
  stop: () => void;
  lap: () => void;
  reset: () => void;
}

interface StopwatchSnapshot {
  isRunning: boolean;
  accumulated: number;
  startTimestamp: number;
  lapStart: number;
  laps: Lap[];
  elapsedMs: number;
}

const STORAGE_KEY = "meeting-timer:stopwatch";

interface Restored {
  state: StopwatchState;
  accumulated: number;
  startTimestamp: number;
  lapStart: number;
  rearm: boolean;
}

function restore(): Restored {
  const snap = loadState<StopwatchSnapshot>(STORAGE_KEY);
  if (!snap || !Array.isArray(snap.laps)) {
    return {
      state: { elapsedMs: 0, isRunning: false, laps: [] },
      accumulated: 0,
      startTimestamp: 0,
      lapStart: 0,
      rearm: false,
    };
  }

  if (snap.isRunning) {
    const elapsed =
      snap.accumulated + Math.max(0, Date.now() - snap.startTimestamp);
    return {
      state: { elapsedMs: elapsed, isRunning: true, laps: snap.laps },
      accumulated: snap.accumulated,
      startTimestamp: snap.startTimestamp,
      lapStart: snap.lapStart,
      rearm: true,
    };
  }

  return {
    state: { elapsedMs: snap.elapsedMs, isRunning: false, laps: snap.laps },
    accumulated: snap.accumulated,
    startTimestamp: 0,
    lapStart: snap.lapStart,
    rearm: false,
  };
}

export function useStopwatch(): StopwatchState & StopwatchActions {
  const restoredRef = useRef<Restored | null>(null);
  if (restoredRef.current === null) restoredRef.current = restore();
  const restored = restoredRef.current;

  const [state, setState] = useState<StopwatchState>(restored.state);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(restored.startTimestamp);
  const accumulatedRef = useRef<number>(restored.accumulated);
  const lapStartRef = useRef<number>(restored.lapStart);
  const elapsedRef = useRef<number>(state.elapsedMs);
  elapsedRef.current = state.elapsedMs;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed =
      accumulatedRef.current + (Date.now() - startTimeRef.current);
    setState((prev) => ({ ...prev, elapsedMs: elapsed }));
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    if (accumulatedRef.current === 0) {
      lapStartRef.current = 0;
    }
    setState((prev) => ({ ...prev, isRunning: true }));
    intervalRef.current = setInterval(tick, 50);
  }, [clearTimer, tick]);

  const stop = useCallback(() => {
    clearTimer();
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  const lap = useCallback(() => {
    const now = accumulatedRef.current + (Date.now() - startTimeRef.current);
    const split = now - lapStartRef.current;
    lapStartRef.current = now;
    setState((prev) => ({
      ...prev,
      laps: [...prev.laps, { id: prev.laps.length + 1, total: now, split }],
    }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    lapStartRef.current = 0;
    setState({ elapsedMs: 0, isRunning: false, laps: [] });
  }, [clearTimer]);

  // Re-arm a restored running timer, and clear the interval on unmount.
  useEffect(() => {
    if (restored.rearm) {
      intervalRef.current = setInterval(tick, 50);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on structural transitions (not on every tick).
  useEffect(() => {
    saveState<StopwatchSnapshot>(STORAGE_KEY, {
      isRunning: state.isRunning,
      accumulated: accumulatedRef.current,
      startTimestamp: startTimeRef.current,
      lapStart: lapStartRef.current,
      laps: state.laps,
      elapsedMs: elapsedRef.current,
    });
  }, [state.isRunning, state.laps]);

  return { ...state, start, stop, lap, reset };
}
