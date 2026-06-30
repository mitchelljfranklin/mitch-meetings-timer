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
import { useCountdown } from "../hooks/useCountdown";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { usePreferences } from "../hooks/usePreferences";
import { TimerDisplay } from "./TimerDisplay";
import { Celebration } from "./Celebration";
import { formatCountdown } from "../utils/format";
import { primeAudio, playChime } from "../utils/sound";

const useStyles = makeStyles({
  mode: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalL,
    width: "100%",
  },
  inputs: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    justifyContent: "center",
  },
  spin: {
    width: "76px",
  },
  controls: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  timesUp: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    color: tokens.colorStatusDangerForeground1,
  },
  toggles: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalL,
    justifyContent: "center",
  },
});

export function Countdown(): JSX.Element {
  const styles = useStyles();
  const timer = useCountdown();
  const { announce, Announcer } = useAnnouncer();
  const { soundEnabled, setSoundEnabled, confettiEnabled, setConfettiEnabled } =
    usePreferences();
  const progress = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    if (timer.isFinished) {
      announce("Countdown finished. Time is up.");
      if (soundEnabledRef.current) {
        playChime();
      }
    }
  }, [timer.isFinished, announce]);

  const handleStart = () => {
    primeAudio();
    timer.start();
    announce("Countdown started.");
  };
  const handlePause = () => {
    timer.pause();
    announce("Countdown paused.");
  };
  const handleResume = () => {
    primeAudio();
    timer.resume();
    announce("Countdown resumed.");
  };
  const handleReset = () => {
    timer.reset();
    announce("Countdown reset.");
  };

  return (
    <div className={styles.mode}>
      <TimerDisplay
        progress={timer.isFinished ? 0 : progress}
        time={formatCountdown(timer.remainingMs)}
        flashing={timer.isFinished}
      />

      {timer.isFinished && (
        <Text className={styles.timesUp} size={600} weight="bold">
          🎉 Time&apos;s up!
        </Text>
      )}

      {!timer.isRunning && (
        <div className={styles.inputs}>
          <Field label="hr">
            <SpinButton
              className={styles.spin}
              value={timer.hours}
              min={0}
              max={99}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setHours(next);
              }}
            />
          </Field>
          <Field label="min">
            <SpinButton
              className={styles.spin}
              value={timer.minutes}
              min={0}
              max={59}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setMinutes(next);
              }}
            />
          </Field>
          <Field label="sec">
            <SpinButton
              className={styles.spin}
              value={timer.seconds}
              min={0}
              max={59}
              onChange={(_e, data) => {
                const next = data.value ?? Number(data.displayValue);
                if (!Number.isNaN(next)) timer.setSeconds(next);
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
        {timer.isRunning && <Button onClick={handlePause}>Pause</Button>}
        {timer.isPaused && (
          <>
            <Button appearance="primary" onClick={handleResume}>
              Resume
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </>
        )}
        {timer.isFinished && (
          <Button appearance="primary" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      <div className={styles.toggles}>
        <Switch
          checked={soundEnabled}
          onChange={(_e, data) => setSoundEnabled(data.checked)}
          label="Alert sound"
        />
        <Switch
          checked={confettiEnabled}
          onChange={(_e, data) => setConfettiEnabled(data.checked)}
          label="Confetti"
        />
      </div>

      <Announcer />
      <Celebration active={timer.isFinished && confettiEnabled} />
    </div>
  );
}
