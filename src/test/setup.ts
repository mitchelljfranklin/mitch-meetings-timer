import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const globals = globalThis as Record<string, unknown>;

if (!("ResizeObserver" in globalThis)) {
  globals.ResizeObserver = ResizeObserverStub;
}

// Fluent UI's focus manager (tabster) references the global NodeFilter, which
// jsdom exposes on window but not always as a bare global.
if (typeof globals.NodeFilter === "undefined" && window.NodeFilter) {
  globals.NodeFilter = window.NodeFilter;
}
