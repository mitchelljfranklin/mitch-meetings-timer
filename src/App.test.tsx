import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

const teams = vi.hoisted(() => ({
  context: {
    app: { theme: "default" },
    page: { frameContext: "content" },
  } as { app: { theme: string }; page: { frameContext: string } },
  setValidityState: vi.fn(),
  registerOnSaveHandler: vi.fn(),
  setConfig: vi.fn(() => Promise.resolve()),
}));

vi.mock("@microsoft/teams-js", () => ({
  app: {
    initialize: vi.fn(() => Promise.resolve()),
    getContext: vi.fn(() => Promise.resolve(teams.context)),
    registerOnThemeChangeHandler: vi.fn(),
    notifyAppLoaded: vi.fn(),
    notifySuccess: vi.fn(),
  },
  pages: {
    config: {
      registerOnSaveHandler: teams.registerOnSaveHandler,
      setConfig: teams.setConfig,
      setValidityState: teams.setValidityState,
    },
  },
}));

describe("App", () => {
  beforeEach(() => {
    teams.context = {
      app: { theme: "default" },
      page: { frameContext: "content" },
    };
  });

  it("renders the timer tabs in a normal meeting context", async () => {
    render(<App />);
    expect(
      await screen.findByRole("tab", { name: "Countdown" })
    ).toBeInTheDocument();
  });

  it("renders the config view and enables Save in the settings frame", async () => {
    teams.context = {
      app: { theme: "default" },
      page: { frameContext: "settings" },
    };
    render(<App />);
    expect(await screen.findByText("Mitch Meeting-Timer")).toBeInTheDocument();
    expect(teams.setValidityState).toHaveBeenCalledWith(true);
    expect(teams.registerOnSaveHandler).toHaveBeenCalled();
  });
});
