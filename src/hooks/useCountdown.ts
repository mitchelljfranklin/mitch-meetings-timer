import { useState, useRef, useCallback, useEffect } from "react";

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

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function useCountdown(): CountdownState & CountdownActions {
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 5,
    seconds: 0,
    remainingMs: 5 * 60 * 1000,
    totalMs: 5 * 60 * 1000,
    isRunning: false,
    isPaused: false,
    isFinished: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

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

  useEffect(() => clearTimer, [clearTimer]);

  return {
    ...state,
    setHours: (h: number) => {
      const ms = (h * 3600 + state.minutes * 60 + state.seconds) * 1000;
      setState((prev) => ({
        ...prev,
        hours: Math.max(0, Math.min(99, h)),
        totalMs: ms,
        remainingMs: prev.isRunning ? prev.remainingMs : ms,
      }));
    },
    setMinutes: (m: number) => {
      const ms = (state.hours * 3600 + m * 60 + state.seconds) * 1000;
      setState((prev) => ({
        ...prev,
        minutes: Math.max(0, Math.min(59, m)),
        totalMs: ms,
        remainingMs: prev.isRunning ? prev.remainingMs : ms,
      }));
    },
    setSeconds: (s: number) => {
      const ms = (state.hours * 3600 + state.minutes * 60 + s) * 1000;
      setState((prev) => ({
        ...prev,
        seconds: Math.max(0, Math.min(59, s)),
        totalMs: ms,
        remainingMs: prev.isRunning ? prev.remainingMs : ms,
      }));
    },
    start,
    pause,
    resume,
    reset,
  };
}

export { formatTime };
