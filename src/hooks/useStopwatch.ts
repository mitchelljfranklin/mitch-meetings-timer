import { useState, useRef, useCallback, useEffect } from "react";

interface Lap {
  id: number;
  total: number;
  split: number;
}

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

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}

function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}

export function useStopwatch(): StopwatchState & StopwatchActions {
  const [state, setState] = useState<StopwatchState>({
    elapsedMs: 0,
    isRunning: false,
    laps: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lapStartRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    if (accumulatedRef.current === 0) {
      lapStartRef.current = startTimeRef.current;
    }
    setState((prev) => ({ ...prev, isRunning: true }));
    intervalRef.current = setInterval(() => {
      const elapsed = accumulatedRef.current + (Date.now() - startTimeRef.current);
      setState((prev) => ({ ...prev, elapsedMs: elapsed }));
    }, 10);
  }, [clearTimer]);

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
      laps: [
        ...prev.laps,
        { id: prev.laps.length + 1, total: now, split },
      ],
    }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    lapStartRef.current = 0;
    setState({ elapsedMs: 0, isRunning: false, laps: [] });
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { ...state, start, stop, lap, reset };
}

export { formatTime, formatLapTime };
