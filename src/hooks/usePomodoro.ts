import { useState, useRef, useCallback, useEffect } from "react";

type Phase = "work" | "break";

interface PomodoroState {
  workDuration: number;
  breakDuration: number;
  currentPhase: Phase;
  remainingMs: number;
  phaseTotalMs: number;
  isRunning: boolean;
  isPaused: boolean;
  sessions: number;
}

interface PomodoroActions {
  setWorkDuration: (m: number) => void;
  setBreakDuration: (m: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}`;
}

export function usePomodoro(): PomodoroState & PomodoroActions {
  const [state, setState] = useState<PomodoroState>({
    workDuration: 25,
    breakDuration: 5,
    currentPhase: "work",
    remainingMs: 25 * 60 * 1000,
    phaseTotalMs: 25 * 60 * 1000,
    isRunning: false,
    isPaused: false,
    sessions: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchPhase = useCallback(() => {
    setState((prev) => {
      const nextPhase: Phase = prev.currentPhase === "work" ? "break" : "work";
      const durationMs =
        nextPhase === "work"
          ? prev.workDuration * 60 * 1000
          : prev.breakDuration * 60 * 1000;
      return {
        ...prev,
        currentPhase: nextPhase,
        remainingMs: durationMs,
        phaseTotalMs: durationMs,
        sessions:
          nextPhase === "work" ? prev.sessions + 1 : prev.sessions,
        isRunning: false,
        isPaused: false,
      };
    });
  }, []);

  const tick = useCallback(() => {
    const remaining = Math.max(0, endTimeRef.current - Date.now());
    if (remaining === 0) {
      clearTimer();
      switchPhase();
    } else {
      setState((prev) => ({ ...prev, remainingMs: remaining }));
    }
  }, [clearTimer, switchPhase]);

  const start = useCallback(() => {
    clearTimer();
    const durationMs =
      state.currentPhase === "work"
        ? state.workDuration * 60 * 1000
        : state.breakDuration * 60 * 1000;
    endTimeRef.current = Date.now() + state.remainingMs || durationMs;
    setState((prev) => {
      const actualMs = prev.remainingMs > 0 ? prev.remainingMs : durationMs;
      return {
        ...prev,
        remainingMs: actualMs,
        phaseTotalMs: actualMs,
        isRunning: true,
        isPaused: false,
      };
    });
    intervalRef.current = setInterval(tick, 100);
  }, [state.currentPhase, state.workDuration, state.breakDuration, state.remainingMs, clearTimer, tick]);

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
    setState((prev) => {
      const ms =
        prev.currentPhase === "work"
          ? prev.workDuration * 60 * 1000
          : prev.breakDuration * 60 * 1000;
      return {
        ...prev,
        remainingMs: ms,
        phaseTotalMs: ms,
        isRunning: false,
        isPaused: false,
      };
    });
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    switchPhase();
  }, [clearTimer, switchPhase]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    ...state,
    setWorkDuration: (m: number) =>
      setState((prev) => {
        const ms = m * 60 * 1000;
        return {
          ...prev,
          workDuration: Math.max(1, Math.min(99, m)),
          ...(prev.currentPhase === "work" && !prev.isRunning
            ? { remainingMs: ms, phaseTotalMs: ms }
            : {}),
        };
      }),
    setBreakDuration: (m: number) =>
      setState((prev) => {
        const ms = m * 60 * 1000;
        return {
          ...prev,
          breakDuration: Math.max(1, Math.min(99, m)),
          ...(prev.currentPhase === "break" && !prev.isRunning
            ? { remainingMs: ms, phaseTotalMs: ms }
            : {}),
        };
      }),
    start,
    pause,
    resume,
    reset,
    skip,
  };
}

export { formatTime };
