import { JSX, useMemo } from "react";
import {
  makeStyles,
  mergeClasses,
  tokens,
  Button,
  Text,
} from "@fluentui/react-components";
import { useStopwatch } from "../hooks/useStopwatch";
import { useAnnouncer } from "../hooks/useAnnouncer";
import { formatStopwatch, formatLap } from "../utils/format";

const useStyles = makeStyles({
  mode: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalL,
    width: "100%",
  },
  display: {
    paddingTop: tokens.spacingVerticalXXL,
    paddingBottom: tokens.spacingVerticalXXL,
  },
  controls: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  laps: {
    width: "100%",
    maxHeight: "220px",
    overflowX: "hidden",
    overflowY: "hidden",
    borderTopWidth: "1px",
    borderRightWidth: "1px",
    borderBottomWidth: "1px",
    borderLeftWidth: "1px",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  lapsHeader: {
    display: "flex",
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: tokens.colorNeutralForeground3,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  lapsList: {
    maxHeight: "176px",
    overflowY: "auto",
  },
  lapRow: {
    display: "flex",
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    fontVariantNumeric: "tabular-nums",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke3,
  },
  cell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0",
    textAlign: "center",
  },
  fastest: {
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  slowest: {
    color: tokens.colorStatusDangerForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflowX: "hidden",
    overflowY: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
  },
});

export function Stopwatch(): JSX.Element {
  const styles = useStyles();
  const timer = useStopwatch();
  const { announce, Announcer } = useAnnouncer();
  const reversedLaps = useMemo(() => [...timer.laps].reverse(), [timer.laps]);

  const { fastestId, slowestId } = useMemo(() => {
    if (timer.laps.length < 2) {
      return {
        fastestId: null as number | null,
        slowestId: null as number | null,
      };
    }
    let fast = timer.laps[0];
    let slow = timer.laps[0];
    for (const l of timer.laps) {
      if (l.split < fast.split) fast = l;
      if (l.split > slow.split) slow = l;
    }
    if (fast.split === slow.split) {
      return {
        fastestId: null as number | null,
        slowestId: null as number | null,
      };
    }
    return { fastestId: fast.id, slowestId: slow.id };
  }, [timer.laps]);

  const handleStart = () => {
    timer.start();
    announce("Stopwatch started.");
  };
  const handleStop = () => {
    timer.stop();
    announce("Stopwatch stopped.");
  };
  const handleLap = () => {
    announce(`Lap ${timer.laps.length + 1} recorded.`);
    timer.lap();
  };
  const handleReset = () => {
    timer.reset();
    announce("Stopwatch reset.");
  };

  return (
    <div className={styles.mode}>
      <div className={styles.display}>
        <Text size={1000} weight="bold" font="numeric">
          {formatStopwatch(timer.elapsedMs)}
        </Text>
      </div>

      <div className={styles.controls}>
        {!timer.isRunning ? (
          <Button appearance="primary" onClick={handleStart}>
            Start
          </Button>
        ) : (
          <>
            <Button onClick={handleStop}>Stop</Button>
            <Button appearance="outline" onClick={handleLap}>
              Lap
            </Button>
          </>
        )}
        {timer.laps.length > 0 && !timer.isRunning && (
          <Button onClick={handleReset}>Reset</Button>
        )}
      </div>

      {timer.laps.length > 0 && (
        <div className={styles.laps}>
          <div className={styles.lapsHeader}>
            <Text className={styles.cell} size={200} weight="semibold">
              Lap
            </Text>
            <Text className={styles.cell} size={200} weight="semibold">
              Split
            </Text>
            <Text className={styles.cell} size={200} weight="semibold">
              Total
            </Text>
          </div>
          <div className={styles.lapsList}>
            {reversedLaps.map((lap) => {
              const isFastest = lap.id === fastestId;
              const isSlowest = lap.id === slowestId;
              return (
                <div key={lap.id} className={styles.lapRow}>
                  <span className={styles.cell}>{lap.id}</span>
                  <span
                    className={mergeClasses(
                      styles.cell,
                      isFastest && styles.fastest,
                      isSlowest && styles.slowest
                    )}
                  >
                    {formatLap(lap.split)}
                    {isFastest && (
                      <span className={styles.srOnly}> (fastest lap)</span>
                    )}
                    {isSlowest && (
                      <span className={styles.srOnly}> (slowest lap)</span>
                    )}
                  </span>
                  <span className={styles.cell}>{formatLap(lap.total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Announcer />
    </div>
  );
}
