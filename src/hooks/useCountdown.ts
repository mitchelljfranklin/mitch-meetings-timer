import { useState, useRef, useCallback, useEffect } from "react";
import { loadState, saveState } from "../utils/persist";

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  remainingMs: number;
  totalMs: number;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
}

interface CountdownActions {
  setHours: (h: number) => void;
  setMinutes: (m: number) => void;
  setSeconds: (s: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

type CountdownSnapshot = CountdownState & { endTime: number };

const STORAGE_KEY = "meeting-timer:countdown";

const DEFAULT_STATE: CountdownState = {
  hours: 0,
  minutes: 5,
  seconds: 0,
  remainingMs: 5 * 60 * 1000,
  totalMs: 5 * 60 * 1000,
  isRunning: false,
  isPaused: false,
  isFinished: false,
};

interface Restored {
  state: CountdownState;
  endTime: number;
  rearm: boolean;
}

function restore(): Restored {
  const snap = loadState<CountdownSnapshot>(STORAGE_KEY);
  if (
    !snap ||
    typeof snap.totalMs !== "number" ||
    typeof snap.remainingMs !== "number"
  ) {
    return { state: DEFAULT_STATE, endTime: 0, rearm: false };
  }

  const base: CountdownState = {
    hours: snap.hours,
    minutes: snap.minutes,
    seconds: snap.seconds,
    totalMs: snap.totalMs,
    remainingMs: snap.remainingMs,
    isRunning: false,
    isPaused: false,
    isFinished: false,
  };

  if (snap.isRunning) {
    const remaining = Math.max(0, snap.endTime - Date.now());
    if (remaining > 0) {
      return {
        state: { ...base, remainingMs: remaining, isRunning: true },
        endTime: snap.endTime,
        rearm: true,
      };
    }
    // Finished while away — restore idle with the inputs intact.
    return {
      state: { ...base, remainingMs: snap.totalMs },
      endTime: 0,
      rearm: false,
    };
  }

  if (snap.isPaused) {
    return { state: { ...base, isPaused: true }, endTime: 0, rearm: false };
  }

  return {
    state: { ...base, remainingMs: snap.totalMs },
    endTime: 0,
    rearm: false,
  };
}

export function useCountdown(): CountdownState & CountdownActions {
  const restoredRef = useRef<Restored | null>(null);
  if (restoredRef.current === null) restoredRef.current = restore();
  const restored = restoredRef.current;

  const [state, setState] = useState<CountdownState>(restored.state);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(restored.endTime);
  const remainingRef = useRef<number>(state.remainingMs);
  remainingRef.current = state.remainingMs;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    setState((prev) => ({
      ...prev,
      remainingMs: remaining,
      isFinished: remaining === 0,
      isRunning: remaining > 0,
    }));
    if (remaining === 0) {
      clearTimer();
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    const ms = (state.hours * 3600 + state.minutes * 60 + state.seconds) * 1000;
    if (ms <= 0) return;
    endTimeRef.current = Date.now() + ms;
    setState((prev) => ({
      ...prev,
      totalMs: ms,
      remainingMs: ms,
      isRunning: true,
      isPaused: false,
      isFinished: false,
    }));
    intervalRef.current = setInterval(tick, 100);
  }, [state.hours, state.minutes, state.seconds, clearTimer, tick]);

  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({ ...prev, isRunning: false, isPaused: true }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    endTimeRef.current = Date.now() + state.remainingMs;
    setState((prev) => ({ ...prev, isRunning: true, isPaused: false }));
    intervalRef.current = setInterval(tick, 100);
  }, [state.remainingMs, tick]);

  const reset = useCallback(() => {
    clearTimer();
    const ms = (state.hours * 3600 + state.minutes * 60 + state.seconds) * 1000;
    setState((prev) => ({
      ...prev,
      totalMs: ms,
      remainingMs: ms,
      isRunning: false,
      isPaused: false,
      isFinished: false,
    }));
  }, [state.hours, state.minutes, state.seconds, clearTimer]);

  // Re-arm a restored running timer, and clear the interval on unmount.
  useEffect(() => {
    if (restored.rearm) {
      intervalRef.current = setInterval(tick, 100);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on structural transitions (not on every tick).
  useEffect(() => {
    saveState<CountdownSnapshot>(STORAGE_KEY, {
      hours: state.hours,
      minutes: state.minutes,
      seconds: state.seconds,
      totalMs: state.totalMs,
      remainingMs: remainingRef.current,
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      isFinished: state.isFinished,
      endTime: endTimeRef.current,
    });
  }, [
    state.hours,
    state.minutes,
    state.seconds,
    state.totalMs,
    state.isRunning,
    state.isPaused,
    state.isFinished,
  ]);

  return {
    ...state,
    setHours: (h: number) => {
      setState((prev) => {
        const hours = Math.max(0, Math.min(99, h));
        const ms = (hours * 3600 + prev.minutes * 60 + prev.seconds) * 1000;
        return {
          ...prev,
          hours,
          totalMs: ms,
          remainingMs: prev.isRunning ? prev.remainingMs : ms,
        };
      });
    },
    setMinutes: (m: number) => {
      setState((prev) => {
        const minutes = Math.max(0, Math.min(59, m));
        const ms = (prev.hours * 3600 + minutes * 60 + prev.seconds) * 1000;
        return {
          ...prev,
          minutes,
          totalMs: ms,
          remainingMs: prev.isRunning ? prev.remainingMs : ms,
        };
      });
    },
    setSeconds: (s: number) => {
      setState((prev) => {
        const seconds = Math.max(0, Math.min(59, s));
        const ms = (prev.hours * 3600 + prev.minutes * 60 + seconds) * 1000;
        return {
          ...prev,
          seconds,
          totalMs: ms,
          remainingMs: prev.isRunning ? prev.remainingMs : ms,
        };
      });
    },
    start,
    pause,
    resume,
    reset,
  };
}
