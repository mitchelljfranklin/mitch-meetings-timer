import { JSX, useState, useEffect } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { TimerTabs } from "./components/TimerTabs";
import { Countdown } from "./components/Countdown";
import { Stopwatch } from "./components/Stopwatch";
import { Pomodoro } from "./components/Pomodoro";
import { ConfigView } from "./components/ConfigView";
import { themeForName } from "./theme";
import { loadState, saveState } from "./utils/persist";
import type { TimerMode } from "./types";

const MODE_KEY = "meeting-timer:mode";

function restoreMode(): TimerMode {
  const saved = loadState<TimerMode>(MODE_KEY);
  return saved === "countdown" || saved === "stopwatch" || saved === "pomodoro"
    ? saved
    : "countdown";
}

export function App(): JSX.Element {
  const [mode, setMode] = useState<TimerMode>(restoreMode);
  const [ready, setReady] = useState(false);
  const [frameContext, setFrameContext] = useState<string | undefined>();
  const [themeName, setThemeName] = useState<string>("default");

  useEffect(() => {
    saveState(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { app, pages } = await import("@microsoft/teams-js");
        await app.initialize();

        const context = await app.getContext();
        const ctxFrame = context.page?.frameContext as string | undefined;

        if (!cancelled) {
          setThemeName(context.app.theme || "default");
          setFrameContext(ctxFrame);
        }

        app.registerOnThemeChangeHandler((newTheme: string) => {
          if (!cancelled) setThemeName(newTheme);
        });

        if (ctxFrame === "settings") {
          const contentUrl = `${window.location.origin}/index.html`;
          pages.config.registerOnSaveHandler((saveEvent) => {
            pages.config
              .setConfig({
                suggestedDisplayName: "Mitch Meeting-Timer",
                entityId: "meeting-timer",
                contentUrl,
                websiteUrl: contentUrl,
              })
              .then(() => saveEvent.notifySuccess())
              .catch(() =>
                saveEvent.notifyFailure("Failed to save configuration")
              );
          });
          pages.config.setValidityState(true);
        }

        app.notifyAppLoaded();
        app.notifySuccess();
      } catch {
        // Not running inside Teams (e.g. browser preview) — use defaults.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FluentProvider theme={themeForName(themeName)} style={{ height: "100%" }}>
      {!ready ? (
        <div className="app-loading">
          <Spinner label="Loading…" />
        </div>
      ) : frameContext === "settings" ? (
        <ConfigView />
      ) : (
        <main className="app">
          <TimerTabs active={mode} onChange={setMode} />
          <div className="timer-content">
            {mode === "countdown" && <Countdown />}
            {mode === "stopwatch" && <Stopwatch />}
            {mode === "pomodoro" && <Pomodoro />}
          </div>
        </main>
      )}
    </FluentProvider>
  );
}
