export type TimerMode = "countdown" | "stopwatch" | "pomodoro";

export interface Lap {
  id: number;
  total: number;
  split: number;
}
