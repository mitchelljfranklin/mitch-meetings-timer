import { JSX } from "react";
import { useStopwatch } from "../hooks/useStopwatch";

function formatDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
  }
  return `${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}

function formatLap(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}.${pad(centiseconds)}`;
}

export function Stopwatch(): JSX.Element {
  const timer = useStopwatch();
  const maxLap = timer.laps.length > 0
    ? Math.max(...timer.laps.map((l) => l.split))
    : 0;
  const progress = maxLap > 0 ? (timer.elapsedMs - maxLap) / (timer.elapsedMs || 1) : 1;

  return (
    <div className="timer-mode">
      <div className="stopwatch-display">
        <div className="timer-time large">{formatDisplay(timer.elapsedMs)}</div>
      </div>

      <div className="timer-controls">
        {!timer.isRunning ? (
          <button className="btn btn-primary" onClick={timer.start}>
            Start
          </button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={timer.stop}>
              Stop
            </button>
            <button className="btn btn-accent" onClick={timer.lap}>
              Lap
            </button>
          </>
        )}
        {timer.laps.length > 0 && !timer.isRunning && (
          <button className="btn btn-secondary" onClick={timer.reset}>
            Reset
          </button>
        )}
      </div>

      {timer.laps.length > 0 && (
        <div className="laps-container">
          <div className="laps-header">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          <div className="laps-list">
            {[...timer.laps].reverse().map((lap) => (
              <div key={lap.id} className="lap-row">
                <span className="lap-num">{lap.id}</span>
                <span className="lap-split">{formatLap(lap.split)}</span>
                <span className="lap-total">{formatLap(lap.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
