import { useState, useRef, useCallback, useEffect } from "react";
import { loadState, saveState } from "../utils/persist";

type Phase = "work" | "break" | "longBreak";

interface PomodoroState {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
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
  setLongBreakDuration: (m: number) => void;
  setSessionsBeforeLongBreak: (n: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

type PomodoroSnapshot = PomodoroState & { endTime: number };

const STORAGE_KEY = "meeting-timer:pomodoro";

const DEFAULT_STATE: PomodoroState = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  currentPhase: "work",
  remainingMs: 25 * 60 * 1000,
  phaseTotalMs: 25 * 60 * 1000,
  isRunning: false,
  isPaused: false,
  sessions: 0,
};

function phaseDuration(phase: Phase, s: PomodoroState): number {
  if (phase === "work") return s.workDuration * 60 * 1000;
  if (phase === "longBreak") return s.longBreakDuration * 60 * 1000;
  return s.breakDuration * 60 * 1000;
}

function nextPhaseState(prev: PomodoroState): PomodoroState {
  if (prev.currentPhase === "work") {
    const sessions = prev.sessions + 1;
    const isLong = sessions % prev.sessionsBeforeLongBreak === 0;
    const nextPhase: Phase = isLong ? "longBreak" : "break";
    const dur = phaseDuration(nextPhase, prev);
    return {
      ...prev,
      currentPhase: nextPhase,
      remainingMs: dur,
      phaseTotalMs: dur,
      sessions,
      isRunning: false,
      isPaused: false,
    };
  }
  const dur = phaseDuration("work", prev);
  return {
    ...prev,
    currentPhase: "work",
    remainingMs: dur,
    phaseTotalMs: dur,
    isRunning: false,
    isPaused: false,
  };
}

interface Restored {
  state: PomodoroState;
  endTime: number;
  rearm: boolean;
}

function restore(): Restored {
  const snap = loadState<PomodoroSnapshot>(STORAGE_KEY);
  if (
    !snap ||
    typeof snap.remainingMs !== "number" ||
    typeof snap.workDuration !== "number"
  ) {
    return { state: DEFAULT_STATE, endTime: 0, rearm: false };
  }

  const base: PomodoroState = {
    workDuration: snap.workDuration,
    breakDuration: snap.breakDuration,
    longBreakDuration: snap.longBreakDuration ?? 15,
    sessionsBeforeLongBreak: snap.sessionsBeforeLongBreak ?? 4,
    currentPhase: snap.currentPhase,
    remainingMs: snap.remainingMs,
    phaseTotalMs: snap.phaseTotalMs,
    isRunning: false,
    isPaused: false,
    sessions: snap.sessions,
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
    // Elapsed while away — advance to the next phase, idle.
    return { state: nextPhaseState(base), endTime: 0, rearm: false };
  }

  if (snap.isPaused) {
    return { state: { ...base, isPaused: true }, endTime: 0, rearm: false };
  }

  return { state: base, endTime: 0, rearm: false };
}

export function usePomodoro(): PomodoroState & PomodoroActions {
  const restoredRef = useRef<Restored | null>(null);
  if (restoredRef.current === null) restoredRef.current = restore();
  const restored = restoredRef.current;

  const [state, setState] = useState<PomodoroState>(restored.state);

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

  const switchPhase = useCallback(() => {
    setState((prev) => nextPhaseState(prev));
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
    const durationMs = phaseDuration(state.currentPhase, state);
    endTimeRef.current = Date.now() + (state.remainingMs || durationMs);
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
  }, [state, clearTimer, tick]);

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
      const ms = phaseDuration(prev.currentPhase, prev);
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
    saveState<PomodoroSnapshot>(STORAGE_KEY, {
      workDuration: state.workDuration,
      breakDuration: state.breakDuration,
      longBreakDuration: state.longBreakDuration,
      sessionsBeforeLongBreak: state.sessionsBeforeLongBreak,
      currentPhase: state.currentPhase,
      remainingMs: remainingRef.current,
      phaseTotalMs: state.phaseTotalMs,
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      sessions: state.sessions,
      endTime: endTimeRef.current,
    });
  }, [
    state.workDuration,
    state.breakDuration,
    state.longBreakDuration,
    state.sessionsBeforeLongBreak,
    state.currentPhase,
    state.phaseTotalMs,
    state.isRunning,
    state.isPaused,
    state.sessions,
  ]);

  return {
    ...state,
    setWorkDuration: (m: number) =>
      setState((prev) => {
        const workDuration = Math.max(1, Math.min(99, m));
        const ms = workDuration * 60 * 1000;
        return {
          ...prev,
          workDuration,
          ...(prev.currentPhase === "work" && !prev.isRunning
            ? { remainingMs: ms, phaseTotalMs: ms }
            : {}),
        };
      }),
    setBreakDuration: (m: number) =>
      setState((prev) => {
        const breakDuration = Math.max(1, Math.min(99, m));
        const ms = breakDuration * 60 * 1000;
        return {
          ...prev,
          breakDuration,
          ...(prev.currentPhase === "break" && !prev.isRunning
            ? { remainingMs: ms, phaseTotalMs: ms }
            : {}),
        };
      }),
    setLongBreakDuration: (m: number) =>
      setState((prev) => {
        const longBreakDuration = Math.max(1, Math.min(99, m));
        const ms = longBreakDuration * 60 * 1000;
        return {
          ...prev,
          longBreakDuration,
          ...(prev.currentPhase === "longBreak" && !prev.isRunning
            ? { remainingMs: ms, phaseTotalMs: ms }
            : {}),
        };
      }),
    setSessionsBeforeLongBreak: (n: number) =>
      setState((prev) => ({
        ...prev,
        sessionsBeforeLongBreak: Math.max(1, Math.min(12, n)),
      })),
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
