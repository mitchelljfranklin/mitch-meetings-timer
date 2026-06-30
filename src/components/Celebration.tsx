import { CSSProperties, JSX, useEffect, useRef } from "react";

interface CelebrationProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  born: number;
}

const COLORS = [
  "#6264a7",
  "#ffb900",
  "#e3008c",
  "#00b294",
  "#0078d4",
  "#ff8c00",
];

const WAVES = 3;
const WAVE_INTERVAL_MS = 900;
const PARTICLE_LIFE_MS = 1800;
const TOTAL_MS = (WAVES - 1) * WAVE_INTERVAL_MS + PARTICLE_LIFE_MS;

const canvasStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 1000,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function spawnWave(width: number, height: number, born: number): Particle[] {
  const particles: Particle[] = [];
  const bursts = [
    { x: width * 0.5, y: height * 0.4 },
    { x: width * 0.28, y: height * 0.46 },
    { x: width * 0.72, y: height * 0.46 },
  ];
  for (const burst of bursts) {
    const count = 44;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 3 + Math.random() * 5;
      particles.push({
        x: burst.x,
        y: burst.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        born,
      });
    }
  }
  return particles;
}

export function Celebration({ active }: CelebrationProps): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let particles: Particle[] = [];
    let wavesSpawned = 0;
    const start = performance.now();
    const gravity = 0.12;

    const tick = (now: number) => {
      const elapsed = now - start;

      while (
        wavesSpawned < WAVES &&
        elapsed >= wavesSpawned * WAVE_INTERVAL_MS
      ) {
        particles.push(...spawnWave(width, height, now));
        wavesSpawned++;
      }

      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        const life = 1 - (now - p.born) / PARTICLE_LIFE_MS;
        if (life <= 0) continue;
        ctx.save();
        ctx.globalAlpha = life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      particles = particles.filter((p) => now - p.born < PARTICLE_LIFE_MS);

      if (elapsed < TOTAL_MS) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [active]);

  if (!active || prefersReducedMotion()) return null;

  return <canvas ref={canvasRef} aria-hidden="true" style={canvasStyle} />;
}
