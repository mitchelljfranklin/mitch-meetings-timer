import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { Countdown } from "./Countdown";

beforeAll(() => {
  // jsdom doesn't implement canvas; stub it so the confetti overlay is a no-op.
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
});

function renderCountdown() {
  return render(
    <FluentProvider theme={teamsLightTheme}>
      <Countdown />
    </FluentProvider>
  );
}

describe("Countdown", () => {
  it("renders the controls, time inputs, and the toggles", () => {
    renderCountdown();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByText("hr")).toBeInTheDocument();
    expect(screen.getByText("min")).toBeInTheDocument();
    expect(screen.getByText("sec")).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /alert sound/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /confetti/i })
    ).toBeInTheDocument();
  });

  describe("when the countdown finishes", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("shows the time's-up message and a reset button", () => {
      renderCountdown();
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000 + 500);
      });
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
    });
  });
});
