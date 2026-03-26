"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// ─── Camera & world constants ─────────────────────────────────────────────────
const FOV          = 560;
const CAM_Z        = 260;  // focal depth offset
const CAM_Y        = 250;  // altitude above ground
const HORIZON_Y    = 0.22; // horizon at 22% of screen — high bird's-eye

const CELL         = 68;   // world units per block
const COLS         = 22;
const ROWS         = 32;
const STREET_N     = 5;    // every 5th row/col = street
const MAX_VIEW     = ROWS * CELL;
const SCROLL_SPEED = 0.20;

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── Building type per district ───────────────────────────────────────────────
type District = "downtown" | "midtown" | "suburb";

interface Building {
  wx1: number; wx2: number; // X extents (world, centred)
  wz1: number; wz2: number; // Z extents (local, scroll-adjusted each frame)
  h:   number;
  district: District;
  hasTower:  boolean;
  hasHelip:  boolean;
}

// ─── Projection: high-altitude downward-looking camera ───────────────────────
const project = (wx: number, wy: number, wz: number, W: number, H: number) => {
  const d = wz + CAM_Z;
  if (d <= 0) return { sx: 0, sy: 0, valid: false as const };
  const scale = FOV / d;
  return {
    sx: W / 2 + wx * scale,
    sy: H * HORIZON_Y + (CAM_Y - wy) * scale,  // Y flipped: ground below horizon
    valid: true as const,
    scale,
  };
};

// ─── City generator ───────────────────────────────────────────────────────────
function buildCity(rng: () => number): Building[] {
  const out: Building[] = [];
  const halfW = ((COLS - 1) * CELL) / 2;
  const centreCol = COLS / 2;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (col % STREET_N === 0 || row % STREET_N === 0) continue;

      const distX: number = Math.abs(col - centreCol) / centreCol; // 0 = centre, 1 = edge

      let district: District;
      let minH: number, maxH: number, padL: number, padR: number;

      if (distX < 0.28) {
        district = "downtown";
        minH = 75; maxH = 145;
        // Slim towers — variable width gives variety
        const slim = 0.22 + rng() * 0.14;
        padL = CELL * slim;
        padR = CELL * (slim + 0.22 + rng() * 0.12);
      } else if (distX < 0.60) {
        district = "midtown";
        minH = 28; maxH = 78;
        padL = CELL * (0.10 + rng() * 0.12);
        padR = CELL * (0.10 + rng() * 0.12);
      } else {
        district = "suburb";
        minH = 8; maxH = 30;
        padL = CELL * (0.08 + rng() * 0.08);
        padR = CELL * (0.08 + rng() * 0.08);
      }

      const h = minH + rng() * (maxH - minH);

      out.push({
        wx1: col * CELL + padL - halfW,
        wx2: (col + 1) * CELL - padR - halfW,
        wz1: row * CELL + 6,
        wz2: (row + 1) * CELL - 6,
        h,
        district,
        hasTower:  district === "downtown" && h > 110 && rng() > 0.4,
        hasHelip:  district === "midtown"  && h > 45  && rng() > 0.55,
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
    let city: Building[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      city = buildCity(mkRng(canvas.width * 7 + canvas.height * 13));
    };

    // Draw a single world-space segment
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

      // ── Back-to-front sort ──
      const visible = city
        .map((b) => {
          let wz = b.wz1 - scrollMod;
          if (wz < -CELL * 2) wz += MAX_VIEW;
          return { b, wz };
        })
        .filter(({ wz }) => wz + CAM_Z > 8 && wz < MAX_VIEW * 0.88)
        .sort((a, b) => b.wz - a.wz);

      // ── Buildings ──
      for (const { b, wz } of visible) {
        const wx1 = b.wx1;
        const wx2 = b.wx2;
        const wz1 = wz;
        const wz2 = wz + (b.wz2 - b.wz1);
        const h   = b.h;

        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.78)));
        const base   = 0.018 + depthT * 0.11;
        const roof   = Math.min(base * 1.8, 0.20);

        // Line width scales with depth for crisper near-buildings
        ctx.lineWidth = 0.35 + depthT * 0.45;

        // ── 4 vertical pillars ──
        seg(wx1, 0, wz1, wx1, h, wz1,  base,       width, height);
        seg(wx2, 0, wz1, wx2, h, wz1,  base,       width, height);
        seg(wx1, 0, wz2, wx1, h, wz2,  base * 0.6, width, height);
        seg(wx2, 0, wz2, wx2, h, wz2,  base * 0.6, width, height);

        // ── Roofline ──
        seg(wx1, h, wz1, wx2, h, wz1,  roof,       width, height);
        seg(wx1, h, wz2, wx2, h, wz2,  roof * 0.6, width, height);
        seg(wx1, h, wz1, wx1, h, wz2,  roof * 0.6, width, height);
        seg(wx2, h, wz1, wx2, h, wz2,  roof * 0.6, width, height);

        // ── Front face horizontal ledges (window bands on tall buildings) ──
        if (h > 50) {
          const bands = b.district === "downtown" ? 4 : 2;
          ctx.lineWidth = 0.3;
          for (let i = 1; i < bands; i++) {
            const wy = h * (i / bands);
            seg(wx1, wy, wz1, wx2, wy, wz1, base * 0.45, width, height);
          }
        }

        // ── Antenna on towers ──
        if (b.hasTower) {
          const cx = (wx1 + wx2) / 2;
          ctx.lineWidth = 0.5;
          seg(cx, h,      wz1, cx, h + 22, wz1, roof * 0.9, width, height);
          seg(cx, h + 22, wz1, cx, h + 28, wz1, roof * 0.4, width, height);
        }

        // ── Rooftop helipad cross ──
        if (b.hasHelip) {
          const cx = (wx1 + wx2) / 2;
          const cz = (wz1 + wz2) / 2;
          const arm = Math.max(2, (wx2 - wx1) * 0.2);
          ctx.lineWidth = 0.4;
          seg(cx - arm, h, cz, cx + arm, h, cz, base * 0.7, width, height);
          seg(cx, h, cz - arm, cx, h, cz + arm, base * 0.7, width, height);
        }

        // ── Ground footprint ──
        ctx.lineWidth = 0.3;
        seg(wx1, 0, wz1, wx2, 0, wz1, base * 0.25, width, height);
        seg(wx1, 0, wz1, wx1, 0, wz2, base * 0.20, width, height);
        seg(wx2, 0, wz1, wx2, 0, wz2, base * 0.20, width, height);
      }

      // ── Street grid ──
      ctx.lineWidth = 0.3;
      const halfW = ((COLS - 1) * CELL) / 2;
      for (let row = 0; row < ROWS; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += MAX_VIEW;
        if (wz + CAM_Z <= 8 || wz > MAX_VIEW * 0.88) continue;

        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.78)));
        const alpha  = 0.006 + depthT * 0.022;

        for (let col = 0; col < COLS - 1; col++) {
          const wx1 = col * CELL - halfW;
          const wx2 = wx1 + CELL;
          seg(wx1, 0, wz, wx2, 0, wz, alpha, width, height);
        }
      }

      // ── Street lamp posts at intersections ──
      ctx.lineWidth = 0.5;
      for (let row = 0; row < ROWS; row += STREET_N) {
        for (let col = 0; col < COLS; col += STREET_N) {
          let wz = row * CELL - scrollMod;
          if (wz < -CELL) wz += MAX_VIEW;
          if (wz + CAM_Z <= 8 || wz > MAX_VIEW * 0.75) continue;

          const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.75)));
          const alpha  = 0.04 + depthT * 0.10;
          const wx     = col * CELL - halfW;

          seg(wx, 0, wz, wx, 10, wz, alpha, width, height);
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
