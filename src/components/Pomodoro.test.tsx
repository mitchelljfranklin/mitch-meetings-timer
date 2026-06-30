import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { Pomodoro } from "./Pomodoro";

describe("Pomodoro", () => {
  it("renders the focus phase, controls, and the sound toggle", () => {
    render(
      <FluentProvider theme={teamsLightTheme}>
        <Pomodoro />
      </FluentProvider>
    );
    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /alert sound/i })
    ).toBeInTheDocument();
  });
});
