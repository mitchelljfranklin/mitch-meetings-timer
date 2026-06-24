import { JSX } from "react";

type TimerMode = "countdown" | "stopwatch" | "pomodoro";

interface TimerTabsProps {
  active: TimerMode;
  onChange: (mode: TimerMode) => void;
}

const tabs: { mode: TimerMode; label: string }[] = [
  { mode: "countdown", label: "Countdown" },
  { mode: "stopwatch", label: "Stopwatch" },
  { mode: "pomodoro", label: "Pomodoro" },
];

export function TimerTabs({ active, onChange }: TimerTabsProps): JSX.Element {
  return (
    <div className="timer-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          className={`timer-tab ${active === tab.mode ? "active" : ""}`}
          onClick={() => onChange(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
