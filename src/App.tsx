import { JSX, useState, useEffect } from "react";
import { TimerTabs } from "./components/TimerTabs";
import { Countdown } from "./components/Countdown";
import { Stopwatch } from "./components/Stopwatch";
import { Pomodoro } from "./components/Pomodoro";

type TimerMode = "countdown" | "stopwatch" | "pomodoro";

declare global {
  interface Window {
    __TEAMS_THEME__?: string;
  }
}

const THEME_CLASSES: Record<string, string> = {
  dark: "theme-dark",
  default: "theme-light",
  contrast: "theme-contrast",
};

function applyTheme(theme: string | undefined) {
  const root = document.documentElement;
  root.classList.remove(...Object.values(THEME_CLASSES));
  if (theme && THEME_CLASSES[theme]) {
    root.classList.add(THEME_CLASSES[theme]);
  }
}

async function initTeams(): Promise<void> {
  try {
    const { app } = await import("@microsoft/teams-js");
    await app.initialize();

    const context = await app.getContext();
    const theme = context.app.theme;
    if (theme) {
      window.__TEAMS_THEME__ = theme;
      applyTheme(theme);
    }

    app.registerOnThemeChangeHandler((newTheme: string) => {
      window.__TEAMS_THEME__ = newTheme;
      applyTheme(newTheme);
    });

    app.notifyAppLoaded();
    app.notifySuccess();
  } catch {
    applyTheme("default");
  }
}

export function App(): JSX.Element {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initTeams().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="app-loading">
        <div className="timer-time">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <TimerTabs active={mode} onChange={setMode} />
      <div className="timer-content">
        {mode === "countdown" && <Countdown />}
        {mode === "stopwatch" && <Stopwatch />}
        {mode === "pomodoro" && <Pomodoro />}
      </div>
    </div>
  );
}
