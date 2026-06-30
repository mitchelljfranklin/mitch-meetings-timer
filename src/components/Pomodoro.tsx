import { JSX, useEffect, useRef } from "react";
import {
  makeStyles,
  tokens,
  Button,
  SpinButton,
  Field,
  Switch,
  Text,
} from "@fluentui/react-components";
import { usePomodoro } from "../hooks/usePomodoro";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { usePreferences } from "../hooks/usePreferences";
import { TimerDisplay } from "./TimerDisplay";
import { formatMinutes } from "../utils/format";
import { primeAudio, playChime } from "../utils/sound";

const useStyles = makeStyles({
  mode: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalL,
    width: "100%",
  },
  info: {
    color: tokens.colorNeutralForeground3,
  },
  settings: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalM,
    justifyContent: "center",
  },
  spin: {
    width: "96px",
  },
  controls: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  toggles: {
    display: "flex",
    justifyContent: "center",
  },
});

function phaseLabel(phase: string): string {
  if (phase === "work") return "Focus";
  if (phase === "longBreak") return "Long Break";
  return "Break";
}

function phaseStartedMessage(phase: string): string {
  if (phase === "work") return "Focus time started.";
  if (phase === "longBreak") return "Long break started.";
  return "Break time started.";
}

function phaseColor(phase: string): string {
  if (phase === "work") return tokens.colorBrandBackground;
  if (phase === "longBreak") return tokens.colorPaletteBlueForeground2;
  return tokens.colorPaletteGreenForeground1;
}

export function Pomodoro(): JSX.Element {
  const styles = useStyles();
  const timer = usePomodoro();
  const { announce, Announcer } = useAnnouncer();
  const { soundEnabled, setSoundEnabled } = usePreferences();
  const progress =
    timer.phaseTotalMs > 0 ? timer.remainingMs / timer.phaseTotalMs : 0;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const prevPhase = useRef(timer.currentPhase);
  useEffect(() => {
    if (timer.currentPhase !== prevPhase.current) {
      prevPhase.current = timer.currentPhase;
      announce(phaseStartedMessage(timer.currentPhase));
      if (soundEnabledRef.current) {
        playChime(1);
      }
    }
  }, [timer.currentPhase, announce]);

  const handleStart = () => {
    primeAudio();
    timer.start();
    announce(phaseStartedMessage(timer.currentPhase));
  };
  const handlePause = () => {
    timer.pause();
    announce("Pomodoro paused.");
  };
  const handleResume = () => {
    primeAudio();
    timer.resume();
    announce("Pomodoro resumed.");
  };
  const handleReset = () => {
    timer.reset();
    announce("Pomodoro reset.");
  };

  return (
    <div className={styles.mode}>
      <TimerDisplay
        progress={progress}
        time={formatMinutes(timer.remainingMs)}
        label={phaseLabel(timer.currentPhase)}
        color={phaseColor(timer.currentPhase)}
      />

      <Text className={styles.info} weight="semibold">
        Sessions: {timer.sessions}
      </Text>

      {!timer.isRunning && (
        <div className={styles.settings}>
          <Field label="work min">
            <SpinButton
              className={styles.spin}
              value={timer.workDuration}
              min={1}
              max={99}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setWorkDuration(next);
              }}
            />
          </Field>
          <Field label="break min">
            <SpinButton
              className={styles.spin}
              value={timer.breakDuration}
              min={1}
              max={99}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setBreakDuration(next);
              }}
            />
          </Field>
          <Field label="long min">
            <SpinButton
              className={styles.spin}
              value={timer.longBreakDuration}
              min={1}
              max={99}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setLongBreakDuration(next);
              }}
            />
          </Field>
          <Field label="long every">
            <SpinButton
              className={styles.spin}
              value={timer.sessionsBeforeLongBreak}
              min={1}
              max={12}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setSessionsBeforeLongBreak(next);
              }}
            />
          </Field>
        </div>
      )}

      <div className={styles.controls}>
        {!timer.isRunning && !timer.isPaused && (
          <Button appearance="primary" onClick={handleStart}>
            Start
          </Button>
        )}
        {timer.isRunning && (
          <>
            <Button onClick={handlePause}>Pause</Button>
            <Button appearance="outline" onClick={timer.skip}>
              Skip
            </Button>
          </>
        )}
        {timer.isPaused && (
          <>
            <Button appearance="primary" onClick={handleResume}>
              Resume
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </>
        )}
      </div>

      <div className={styles.toggles}>
        <Switch
          checked={soundEnabled}
          onChange={(_e, data) => setSoundEnabled(data.checked)}
          label="Alert sound"
        />
      </div>

      <Announcer />
    </div>
  );
}
