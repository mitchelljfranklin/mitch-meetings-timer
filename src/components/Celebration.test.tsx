import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Celebration } from "./Celebration";

function setReducedMotion(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: reduced,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
});

beforeEach(() => {
  setReducedMotion(false);
});

describe("Celebration", () => {
  it("renders nothing when inactive", () => {
    const { container } = render(<Celebration active={false} />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders a canvas overlay when active", () => {
    const { container } = render(<Celebration active />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("renders nothing when reduced motion is preferred", () => {
    setReducedMotion(true);
    const { container } = render(<Celebration active />);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
