import { describe, it, expect } from "vitest";
import {
  formatCountdown,
  formatMinutes,
  formatStopwatch,
  formatLap,
} from "./format";

describe("formatCountdown", () => {
  it("renders HH:MM:SS and rounds up partial seconds", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(1)).toBe("00:00:01");
    expect(formatCountdown(1000)).toBe("00:00:01");
    expect(formatCountdown(3_661_000)).toBe("01:01:01");
  });

  it("clamps negatives to zero", () => {
    expect(formatCountdown(-500)).toBe("00:00:00");
  });
});

describe("formatMinutes", () => {
  it("renders MM:SS and rounds up", () => {
    expect(formatMinutes(0)).toBe("00:00");
    expect(formatMinutes(25 * 60 * 1000)).toBe("25:00");
    expect(formatMinutes(1)).toBe("00:01");
  });
});

describe("formatStopwatch", () => {
  it("renders MM:SS.cc without hours by default", () => {
    expect(formatStopwatch(0)).toBe("00:00.00");
    expect(formatStopwatch(65_120)).toBe("01:05.12");
  });

  it("adds hours when over an hour", () => {
    expect(formatStopwatch(3_600_000)).toBe("01:00:00.00");
  });
});

describe("formatLap", () => {
  it("renders MM:SS.cc", () => {
    expect(formatLap(65_120)).toBe("01:05.12");
    expect(formatLap(0)).toBe("00:00.00");
  });
});
