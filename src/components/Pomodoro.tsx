import { JSX } from "react";
import { usePomodoro } from "../hooks/usePomodoro";
import { TimerDisplay } from "./TimerDisplay";

function formatDisplay(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}`;
}

export function Pomodoro(): JSX.Element {
  const timer = usePomodoro();
  const progress = timer.remainingMs / timer.phaseTotalMs;
  const isWork = timer.currentPhase === "work";

  return (
    <div className="timer-mode">
      <TimerDisplay
        progress={progress}
        time={formatDisplay(timer.remainingMs)}
        label={isWork ? "Focus" : "Break"}
        color={isWork ? "var(--accent-color)" : "var(--break-color)"}
      />

      <div className="pomodoro-info">
        <span>Sessions: {timer.sessions}</span>
      </div>

      {!timer.isRunning ? (
        <div className="pomodoro-settings">
          <div className="time-input-group">
            <input
              type="number"
              min={1}
              max={99}
              value={timer.workDuration}
              onChange={(e) => timer.setWorkDuration(Number(e.target.value))}
              disabled={timer.isRunning}
            />
            <label>work min</label>
          </div>
          <div className="time-input-group">
            <input
              type="number"
              min={1}
              max={99}
              value={timer.breakDuration}
              onChange={(e) => timer.setBreakDuration(Number(e.target.value))}
              disabled={timer.isRunning}
            />
            <label>break min</label>
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
          <>
            <button className="btn btn-secondary" onClick={timer.pause}>
              Pause
            </button>
            <button className="btn btn-accent" onClick={timer.skip}>
              Skip
            </button>
          </>
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
      </div>
    </div>
  );
}
