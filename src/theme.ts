import {
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
  type Theme,
} from "@fluentui/react-components";

export function themeForName(name: string | undefined): Theme {
  switch (name) {
    case "dark":
      return teamsDarkTheme;
    case "contrast":
      return teamsHighContrastTheme;
    default:
      return teamsLightTheme;
  }
}
