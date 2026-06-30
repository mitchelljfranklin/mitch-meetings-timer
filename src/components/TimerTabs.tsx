import { JSX } from "react";
import {
  makeStyles,
  tokens,
  TabList,
  Tab,
  type SelectTabData,
  type SelectTabEvent,
} from "@fluentui/react-components";
import type { TimerMode } from "../types";

interface TimerTabsProps {
  active: TimerMode;
  onChange: (mode: TimerMode) => void;
}

const tabs: { mode: TimerMode; label: string }[] = [
  { mode: "countdown", label: "Countdown" },
  { mode: "stopwatch", label: "Stopwatch" },
  { mode: "pomodoro", label: "Pomodoro" },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "center",
    paddingTop: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: tokens.colorNeutralStroke2,
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

export function TimerTabs({ active, onChange }: TimerTabsProps): JSX.Element {
  const styles = useStyles();
  const onTabSelect = (_e: SelectTabEvent, data: SelectTabData) => {
    onChange(data.value as TimerMode);
  };
  return (
    <TabList
      className={styles.root}
      selectedValue={active}
      onTabSelect={onTabSelect}
    >
      {tabs.map((tab) => (
        <Tab key={tab.mode} value={tab.mode}>
          {tab.label}
        </Tab>
      ))}
    </TabList>
  );
}
