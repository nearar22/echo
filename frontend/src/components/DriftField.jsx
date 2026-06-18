import { useEffect, useRef } from 'react';

// The hero motif as a living background: playful color-block tiles drift across
// a warm cream field, slowly converging toward each other and SNAPPING together
// with a little burst when two meet, then springing apart. Real canvas with
// requestAnimationFrame, devicePixelRatio-aware, paused when the tab is hidden
// and disabled entirely under prefers-reduced-motion.
const PALETTE = [
  { r: 255, g: 93, b: 143 }, // magenta
  { r: 42, g: 212, b: 192 }, // teal
  { r: 255, g: 210, b: 63 }, // sunflower
];

function makeTiles(w, h) {
  const tiles = [];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const c = PALETTE[i % PALETTE.length];
    tiles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: 46 + Math.random() * 46,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.0008,
      color: c,
      flash: 0,
    });
  }
  return tiles;
}

export default function DriftField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let running = true;
    let width = 0;
    let height = 0;
    let tiles = [];
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!tiles.length) tiles = makeTiles(width, height);
    };

    const roundRect = (x, y, s, rot, color, flash) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const half = s / 2;
      const radius = s * 0.28;
      const alpha = 0.16 + flash * 0.5;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(-half + radius, -half);
      ctx.arcTo(half, -half, half, half, radius);
      ctx.arcTo(half, half, -half, half, radius);
      ctx.arcTo(-half, half, -half, -half, radius);
      ctx.arcTo(-half, -half, half, -half, radius);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const step = (t) => {
      if (!running) return;
      const dt = Math.min(50, t - last || 16);
      last = t;
      ctx.clearRect(0, 0, width, height);

      // Gentle attraction between nearby pairs; snap-flash on contact.
      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          const a = tiles[i];
          const b = tiles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = (a.size + b.size) * 0.5;
          if (dist < 240) {
            const pull = 0.0009;
            a.vx += (dx / dist) * pull * dt;
            a.vy += (dy / dist) * pull * dt;
            b.vx -= (dx / dist) * pull * dt;
            b.vy -= (dy / dist) * pull * dt;
          }
          if (dist < minDist) {
            // Snap burst, then spring apart.
            a.flash = 1;
            b.flash = 1;
            const push = 0.04;
            a.vx -= (dx / dist) * push;
            a.vy -= (dy / dist) * push;
            b.vx += (dx / dist) * push;
            b.vy += (dy / dist) * push;
          }
        }
      }

      for (const tile of tiles) {
        tile.x += tile.vx * dt;
        tile.y += tile.vy * dt;
        tile.rot += tile.vr * dt;
        // Soft speed clamp so the field stays calm.
        tile.vx = Math.max(-0.35, Math.min(0.35, tile.vx * 0.995));
        tile.vy = Math.max(-0.35, Math.min(0.35, tile.vy * 0.995));
        // Wrap around edges.
        if (tile.x < -80) tile.x = width + 80;
        if (tile.x > width + 80) tile.x = -80;
        if (tile.y < -80) tile.y = height + 80;
        if (tile.y > height + 80) tile.y = -80;
        tile.flash *= 0.92;
        roundRect(tile.x, tile.y, tile.size, tile.rot, tile.color, tile.flash);
      }

      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running && !reduce) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    if (reduce) {
      // Draw one static frame, no animation loop.
      running = false;
      for (const tile of tiles) roundRect(tile.x, tile.y, tile.size, tile.rot, tile.color, 0);
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
