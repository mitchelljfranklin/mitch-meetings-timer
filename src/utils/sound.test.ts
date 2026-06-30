import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

class FakeOscillator {
  type = "";
  frequency = { value: 0 };
  connect(target: unknown): unknown {
    return target;
  }
  start(): void {}
  stop(): void {}
}

class FakeGain {
  gain = {
    setValueAtTime: (): void => {},
    linearRampToValueAtTime: (): void => {},
    exponentialRampToValueAtTime: (): void => {},
  };
  connect(target: unknown): unknown {
    return target;
  }
}

interface FakeCtxOptions {
  state?: AudioContextState;
  createOscillator?: () => FakeOscillator;
  resume?: () => Promise<void>;
}

function defineAudioContext(options: FakeCtxOptions): void {
  const create = options.createOscillator ?? (() => new FakeOscillator());
  const resumeFn = options.resume ?? (() => Promise.resolve());
  const state: AudioContextState = options.state ?? "running";
  class FakeAudioContext {
    state = state;
    currentTime = 0;
    destination = {};
    resume = resumeFn;
    createOscillator = create;
    createGain = (): FakeGain => new FakeGain();
  }
  (globalThis as Record<string, unknown>).AudioContext = FakeAudioContext;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  delete (globalThis as Record<string, unknown>).AudioContext;
  delete (globalThis as Record<string, unknown>).webkitAudioContext;
});

describe("playChime", () => {
  it("plays three oscillators per arpeggio, repeated three times by default", async () => {
    const createOscillator = vi.fn(() => new FakeOscillator());
    defineAudioContext({ createOscillator });
    const { playChime } = await import("./sound");

    playChime();
    expect(createOscillator).toHaveBeenCalledTimes(9);

    createOscillator.mockClear();
    playChime(1);
    expect(createOscillator).toHaveBeenCalledTimes(3);
  });

  it("does not throw when Web Audio is unavailable", async () => {
    const { playChime, primeAudio } = await import("./sound");
    expect(() => playChime()).not.toThrow();
    expect(() => primeAudio()).not.toThrow();
  });
});

describe("primeAudio", () => {
  it("resumes a suspended audio context", async () => {
    const resume = vi.fn(() => Promise.resolve());
    defineAudioContext({ state: "suspended", resume });
    const { primeAudio } = await import("./sound");

    primeAudio();
    expect(resume).toHaveBeenCalled();
  });
});
