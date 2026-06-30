import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { Stopwatch } from "./Stopwatch";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Stopwatch", () => {
  it("highlights the fastest and slowest laps", () => {
    render(
      <FluentProvider theme={teamsLightTheme}>
        <Stopwatch />
      </FluentProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Lap" })); // split ~1s
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Lap" })); // split ~3s

    expect(screen.getByText(/fastest lap/i)).toBeInTheDocument();
    expect(screen.getByText(/slowest lap/i)).toBeInTheDocument();
  });
});
