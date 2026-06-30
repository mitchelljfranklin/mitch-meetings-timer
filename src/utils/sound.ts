let ctx: AudioContext | null = null;

function getAudioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  const g = globalThis as typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext;
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/**
 * Create/resume the AudioContext while a user gesture is active (e.g. clicking
 * Start) so playback is unlocked by the time the timer finishes.
 */
export function primeAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") {
    void c.resume();
  }
}

/**
 * Play a short three-note "time's up" chime using the Web Audio API, repeated a
 * few times so it isn't missed.
 */
export function playChime(repeats = 3): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const now = c.currentTime;
  const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6 — a bright major arpeggio
  const noteGap = 0.18;
  const noteDuration = 0.35;
  const arpeggioLength = (notes.length - 1) * noteGap + noteDuration;
  const repeatGap = 0.45;

  for (let r = 0; r < Math.max(1, repeats); r++) {
    const base = now + r * (arpeggioLength + repeatGap);
    for (let i = 0; i < notes.length; i++) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "triangle";
      osc.frequency.value = notes[i];

      const startAt = base + i * noteGap;
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(0.25, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + noteDuration);

      osc.connect(gain).connect(c.destination);
      osc.start(startAt);
      osc.stop(startAt + noteDuration);
    }
  }
}
