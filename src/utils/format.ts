function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** HH:MM:SS for countdown remaining time. Rounds up so any remainder shows 1s. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** MM:SS for pomodoro phase remaining time. Rounds up. */
export function formatMinutes(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

/** [HH:]MM:SS.cc for stopwatch elapsed time. Floors. Hours shown only when > 0. */
export function formatStopwatch(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
  }
  return `${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}

/** MM:SS.cc for stopwatch lap split/total times. Floors. */
export function formatLap(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}
