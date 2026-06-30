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

type InitResult = { frameContext?: string };

async function initTeams(): Promise<InitResult> {
  try {
    const { app, pages } = await import("@microsoft/teams-js");
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

    const frameContext = context.page?.frameContext as string | undefined;

    if (frameContext === "settings") {
      try {
        const contentUrl = `${window.location.origin}/index.html`;
        pages.config.registerOnSaveHandler((saveEvent) => {
          pages.config
            .setConfig({
              suggestedDisplayName: "Meeting Timer",
              entityId: "meeting-timer",
              contentUrl,
              websiteUrl: contentUrl,
            })
            .then(() => saveEvent.notifySuccess())
            .catch(() => saveEvent.notifyFailure("Failed to save configuration"));
        });
        pages.config.setValidityState(true);
      } catch {
        applyTheme("default");
      }
    }

    app.notifyAppLoaded();
    app.notifySuccess();

    return { frameContext };
  } catch {
    applyTheme("default");
    return {};
  }
}

export function App(): JSX.Element {
  const [mode, setMode] = useState<TimerMode>("countdown");
  const [ready, setReady] = useState(false);
  const [frameContext, setFrameContext] = useState<string | undefined>();

  useEffect(() => {
    initTeams()
      .then((res) => setFrameContext(res.frameContext))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="app-loading">
        <div className="timer-time">Loading...</div>
      </div>
    );
  }

  if (frameContext === "settings") {
    return (
      <div className="app app-config">
        <div className="config-message">
          <h2>Meeting Timer</h2>
          <p>
            Adds a countdown, stopwatch, and pomodoro timer to your meeting side
            panel so everyone can see the time. Click <strong>Save</strong> to
            add it.
          </p>
        </div>
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
