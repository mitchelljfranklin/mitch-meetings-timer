import { describe, it, expect } from "vitest";
import {
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
} from "@fluentui/react-components";
import { themeForName } from "./theme";

describe("themeForName", () => {
  it("maps Teams theme names to Fluent themes", () => {
    expect(themeForName("dark")).toBe(teamsDarkTheme);
    expect(themeForName("contrast")).toBe(teamsHighContrastTheme);
    expect(themeForName("default")).toBe(teamsLightTheme);
    expect(themeForName(undefined)).toBe(teamsLightTheme);
    expect(themeForName("anything-else")).toBe(teamsLightTheme);
  });
});
