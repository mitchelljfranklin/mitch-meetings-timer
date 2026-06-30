import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { TimerTabs } from "./TimerTabs";

describe("TimerTabs", () => {
  it("exposes a tab for each mode and marks the active one", () => {
    render(
      <FluentProvider theme={teamsLightTheme}>
        <TimerTabs active="countdown" onChange={() => {}} />
      </FluentProvider>
    );
    expect(screen.getByRole("tab", { name: "Countdown" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "Stopwatch" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pomodoro" })).toBeInTheDocument();
  });

  it("calls onChange with the selected mode", async () => {
    const onChange = vi.fn();
    render(
      <FluentProvider theme={teamsLightTheme}>
        <TimerTabs active="countdown" onChange={onChange} />
      </FluentProvider>
    );
    await userEvent.click(screen.getByRole("tab", { name: "Pomodoro" }));
    expect(onChange).toHaveBeenCalledWith("pomodoro");
  });
});
