import { JSX } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { TimerDisplay } from "./TimerDisplay";

function formatDisplay(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function Countdown(): JSX.Element {
  const timer = useCountdown();
  const progress = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;

  return (
    <div className="timer-mode">
      <TimerDisplay
        progress={timer.isFinished ? 0 : progress}
        time={formatDisplay(timer.remainingMs)}
        color="var(--accent-color)"
        flashing={timer.isFinished}
      />

      {!timer.isRunning ? (
        <div className="time-inputs">
          <div className="time-input-group">
            <input
              type="number"
              min={0}
              max={99}
              value={timer.hours}
              onChange={(e) => timer.setHours(Number(e.target.value))}
              disabled={timer.isRunning}
            />
            <label>hr</label>
          </div>
          <div className="time-input-group">
            <input
              type="number"
              min={0}
              max={59}
              value={timer.minutes}
              onChange={(e) => timer.setMinutes(Number(e.target.value))}
              disabled={timer.isRunning}
            />
            <label>min</label>
          </div>
          <div className="time-input-group">
            <input
              type="number"
              min={0}
              max={59}
              value={timer.seconds}
              onChange={(e) => timer.setSeconds(Number(e.target.value))}
              disabled={timer.isRunning}
            />
            <label>sec</label>
          </div>
        </div>
      ) : null}

      <div className="timer-controls">
        {!timer.isRunning && !timer.isPaused && (
          <button className="btn btn-primary" onClick={timer.start}>
            Start
          </button>
        )}
        {timer.isRunning && (
          <button className="btn btn-secondary" onClick={timer.pause}>
            Pause
          </button>
        )}
        {timer.isPaused && (
          <>
            <button className="btn btn-primary" onClick={timer.resume}>
              Resume
            </button>
            <button className="btn btn-secondary" onClick={timer.reset}>
              Reset
            </button>
          </>
        )}
        {timer.isFinished && (
          <button className="btn btn-primary" onClick={timer.reset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
