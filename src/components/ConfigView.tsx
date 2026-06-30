import { JSX } from "react";
import { makeStyles, tokens, Text, Title3 } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingVerticalM,
    height: "100%",
    padding: tokens.spacingHorizontalXXL,
    textAlign: "center",
  },
});

export function ConfigView(): JSX.Element {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Title3>Mitch Meeting-Timer</Title3>
      <Text>
        Adds a countdown, stopwatch, and pomodoro timer to your meeting side
        panel. Click <b>Save</b> to add it.
      </Text>
    </div>
  );
}
