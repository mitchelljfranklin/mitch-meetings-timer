import { JSX } from "react";

interface TimerDisplayProps {
  progress: number;
  time: string;
  label?: string;
  color?: string;
  flashing?: boolean;
}

export function TimerDisplay({
  progress,
  time,
  label,
  color = "var(--accent-color)",
  flashing = false,
}: TimerDisplayProps): JSX.Element {
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div className={`timer-display ${flashing ? "flashing" : ""}`}>
      <svg viewBox="0 0 200 200" className="timer-ring">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--ring-bg)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          className="timer-progress"
        />
      </svg>
      <div className="timer-center">
        {label && <div className="timer-label">{label}</div>}
        <div className="timer-time">{time}</div>
      </div>
    </div>
  );
}
