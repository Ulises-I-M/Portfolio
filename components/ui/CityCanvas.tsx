"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL         = 80;   // world units per city block (building + street)
const B_PAD        = 10;   // inset from cell edge (creates alley gaps)
const COLS         = 20;   // grid columns
const ROWS         = 28;   // grid rows (extra for seamless scroll)
const FOV          = 480;
const CAM_Z        = 220;
const CAM_Y        = 90;
const SCROLL_SPEED = 0.15;
const STREET_N     = 5;    // every Nth col/row is a street (no building)
const MAX_VIEW     = ROWS * CELL;

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Building {
  col: number; row: number;
  lx: number; rx: number;  // local X extents within cell
  lz: number; rz: number;  // local Z extents within cell
  h:  number;              // height (world units)
}

// ─── Projection ───────────────────────────────────────────────────────────────
const project = (wx: number, wy: number, wz: number, W: number, H: number) => {
  const d = wz + CAM_Z;
  if (d <= 0) return { sx: 0, sy: 0, valid: false };
  const scale = FOV / d;
  return {
    sx: W / 2 + wx * scale,
    sy: H * 0.42 + (wy - CAM_Y) * scale,
    valid: true,
  };
};

// ─── City layout (built once per resize) ─────────────────────────────────────
function buildCity(rng: () => number): Building[] {
  const out: Building[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (col % STREET_N === 0 || row % STREET_N === 0) continue;
      out.push({
        col, row,
        lx: col * CELL + B_PAD,
        rx: (col + 1) * CELL - B_PAD,
        lz: row * CELL + B_PAD,
        rz: (row + 1) * CELL - B_PAD,
        h:  18 + rng() * 110,
      });
    }
  }
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let offset = 0;
    let city:   Building[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      city = buildCity(mkRng(canvas.width * 7 + canvas.height * 13));
    };

    const seg = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      alpha: number, W: number, H: number
    ) => {
      const p1 = project(ax, ay, az, W, H);
      const p2 = project(bx, by, bz, W, H);
      if (!p1.valid || !p2.valid) return;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(4)})`;
      ctx.stroke();
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      offset += SCROLL_SPEED;
      const scrollMod = offset % MAX_VIEW;
      const halfW     = ((COLS - 1) * CELL) / 2;

      ctx.lineWidth = 0.55;

      // Sort back-to-front (painter's algorithm) using effective Z
      const visible = city
        .map((b) => {
          let wz = b.lz - scrollMod;
          if (wz < -CELL * 2) wz += MAX_VIEW; // wrap
          return { b, wz };
        })
        .filter(({ wz }) => wz + CAM_Z > 5 && wz < MAX_VIEW * 0.85)
        .sort((a, b) => b.wz - a.wz);

      for (const { b, wz } of visible) {
        const wx1 = b.lx - halfW;
        const wx2 = b.rx - halfW;
        const wz1 = wz;
        const wz2 = wz + (b.rz - b.lz);

        // Depth fog: far = faint, near = slightly brighter
        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.8)));
        const base   = 0.025 + depthT * 0.10;

        // ── Bottom rectangle (ground plane) ──
        seg(wx1, 0, wz1,  wx2, 0, wz1,  base * 0.4, width, height);
        seg(wx1, 0, wz2,  wx2, 0, wz2,  base * 0.3, width, height);
        seg(wx1, 0, wz1,  wx1, 0, wz2,  base * 0.3, width, height);
        seg(wx2, 0, wz1,  wx2, 0, wz2,  base * 0.3, width, height);

        // ── Vertical pillars ──
        seg(wx1, 0, wz1,  wx1, b.h, wz1,  base,       width, height);
        seg(wx2, 0, wz1,  wx2, b.h, wz1,  base,       width, height);
        seg(wx1, 0, wz2,  wx1, b.h, wz2,  base * 0.7, width, height);
        seg(wx2, 0, wz2,  wx2, b.h, wz2,  base * 0.7, width, height);

        // ── Roofline (brightest) ──
        const roof = Math.min(base * 1.6, 0.18);
        seg(wx1, b.h, wz1,  wx2, b.h, wz1,  roof,       width, height);
        seg(wx1, b.h, wz2,  wx2, b.h, wz2,  roof * 0.7, width, height);
        seg(wx1, b.h, wz1,  wx1, b.h, wz2,  roof * 0.7, width, height);
        seg(wx2, b.h, wz1,  wx2, b.h, wz2,  roof * 0.7, width, height);
      }

      // ── Street grid (ground plane) ──
      ctx.lineWidth = 0.35;
      for (let row = 0; row < ROWS; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += MAX_VIEW;
        if (wz + CAM_Z <= 5 || wz > MAX_VIEW * 0.85) continue;

        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.8)));
        const alpha  = 0.008 + depthT * 0.028;

        for (let col = 0; col < COLS - 1; col++) {
          const wx1 = col * CELL - halfW;
          const wx2 = (col + 1) * CELL - halfW;
          seg(wx1, 0, wz, wx2, 0, wz, alpha, width, height);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);
    rebuild();
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
