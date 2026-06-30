import { JSX } from "react";
import {
  makeStyles,
  mergeClasses,
  tokens,
  Text,
} from "@fluentui/react-components";

interface TimerDisplayProps {
  progress: number;
  time: string;
  label?: string;
  color?: string;
  flashing?: boolean;
}

const useStyles = makeStyles({
  wrap: {
    position: "relative",
    width: "220px",
    height: "220px",
  },
  ring: {
    width: "100%",
    height: "100%",
  },
  progress: {
    transitionProperty: "stroke-dashoffset",
    transitionDuration: "0.1s",
    transitionTimingFunction: "linear",
  },
  flashing: {
    animationName: {
      from: { stroke: tokens.colorBrandBackground },
      to: { stroke: tokens.colorStatusDangerBackground3 },
    },
    animationDuration: "0.6s",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    "@media (prefers-reduced-motion: reduce)": {
      animationName: "none",
      stroke: tokens.colorStatusDangerBackground3,
    },
  },
  center: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalXXS,
  },
  label: {
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: tokens.colorNeutralForeground3,
  },
  time: {
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.02em",
  },
});

export function TimerDisplay({
  progress,
  time,
  label,
  color = tokens.colorBrandBackground,
  flashing = false,
}: TimerDisplayProps): JSX.Element {
  const styles = useStyles();
  const radius = 90;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  const accessibleLabel = label ? `${label}, ${time}` : time;

  return (
    <div className={styles.wrap}>
      <svg
        viewBox="0 0 200 200"
        className={styles.ring}
        role="img"
        aria-label={accessibleLabel}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={tokens.colorNeutralStroke2}
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
          className={mergeClasses(styles.progress, flashing && styles.flashing)}
        />
      </svg>
      <div className={styles.center} aria-hidden="true">
        {label && (
          <Text className={styles.label} size={200} weight="semibold">
            {label}
          </Text>
        )}
        <Text className={styles.time} size={800} weight="bold">
          {time}
        </Text>
      </div>
    </div>
  );
}
