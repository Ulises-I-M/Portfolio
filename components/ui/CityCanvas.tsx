"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// ─── Camera ───────────────────────────────────────────────────────────────────
const FOV          = 560;
const CAM_Z        = 260;
const CAM_Y        = 250;   // high altitude
const HORIZON_Y    = 0.22;  // horizon near top of screen

// ─── World ────────────────────────────────────────────────────────────────────
const CELL         = 68;
const COLS         = 22;
const ROWS         = 32;
const STREET_N     = 5;
const MAX_VIEW     = ROWS * CELL;
const SCROLL_SPEED = 0.20;

// ─── RNG ──────────────────────────────────────────────────────────────────────
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
type District = "downtown" | "midtown" | "suburb";

interface Building {
  wx1: number; wx2: number;
  wz1: number; wz2: number;
  h:   number;
  district: District;
  // Setback tiers (downtown only)
  tier2H:  number | null;  // Y at which tier 2 starts
  tier3H:  number | null;  // Y at which tier 3 starts
  ins2:    number;         // X/Z inset for tier 2
  ins3:    number;         // X/Z inset for tier 3
  hasTower:  boolean;
  hasHelip:  boolean;
}

// ─── Projection ───────────────────────────────────────────────────────────────
const project = (wx: number, wy: number, wz: number, W: number, H: number) => {
  const d = wz + CAM_Z;
  if (d <= 0) return { sx: 0, sy: 0, valid: false as const };
  const scale = FOV / d;
  return {
    sx: W / 2 + wx * scale,
    sy: H * HORIZON_Y + (CAM_Y - wy) * scale,
    valid: true as const,
  };
};

// ─── City layout ─────────────────────────────────────────────────────────────
function buildCity(rng: () => number): Building[] {
  const out: Building[] = [];
  const halfW      = ((COLS - 1) * CELL) / 2;
  const centreCol  = COLS / 2;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (col % STREET_N === 0 || row % STREET_N === 0) continue;

      const distX    = Math.abs(col - centreCol) / centreCol;
      let district: District;
      let minH: number, maxH: number;
      let padLX: number, padRX: number, padZ: number;

      if (distX < 0.28) {
        district = "downtown";
        minH = 80; maxH = 155;
        const slim = 0.18 + rng() * 0.14;
        padLX = CELL * slim;
        padRX = CELL * (slim + 0.16 + rng() * 0.10);
        padZ  = CELL * 0.10;
      } else if (distX < 0.60) {
        district = "midtown";
        minH = 26; maxH = 80;
        padLX = CELL * (0.09 + rng() * 0.11);
        padRX = CELL * (0.09 + rng() * 0.11);
        padZ  = CELL * 0.09;
      } else {
        district = "suburb";
        minH = 7; maxH = 28;
        padLX = CELL * (0.07 + rng() * 0.08);
        padRX = CELL * (0.07 + rng() * 0.08);
        padZ  = CELL * 0.08;
      }

      const h       = minH + rng() * (maxH - minH);
      const bw      = CELL - padLX - padRX;        // building width
      let tier2H: number | null = null;
      let tier3H: number | null = null;
      let ins2 = 0, ins3 = 0;

      if (district === "downtown") {
        tier2H = h * (0.40 + rng() * 0.14);
        ins2   = bw * (0.12 + rng() * 0.10);
        if (h > 110 && rng() > 0.35) {
          tier3H = h * (0.70 + rng() * 0.10);
          ins3   = bw * (0.22 + rng() * 0.10);
        }
      }

      out.push({
        wx1: col * CELL + padLX - halfW,
        wx2: (col + 1) * CELL - padRX - halfW,
        wz1: row * CELL + padZ,
        wz2: (row + 1) * CELL - padZ,
        h, district,
        tier2H, tier3H, ins2, ins3,
        hasTower: district === "downtown" && h > 118 && rng() > 0.38,
        hasHelip: district === "midtown"  && h > 44  && rng() > 0.52,
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

    // ── Single segment ─────────────────────────────────────────────────────
    const seg = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      alpha: number, lw: number,
      W: number, H: number
    ) => {
      const p1 = project(ax, ay, az, W, H);
      const p2 = project(bx, by, bz, W, H);
      if (!p1.valid || !p2.valid) return;
      ctx.lineWidth = lw;
      ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(4)})`;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.stroke();
    };

    // ── Draw one box tier ──────────────────────────────────────────────────
    const drawTier = (
      wx1: number, wx2: number, wz1: number, wz2: number,
      yBase: number, yTop: number,
      base: number, isTopTier: boolean,
      W: number, H: number,
      lw: number
    ) => {
      const roofA = isTopTier ? Math.min(base * 2.2, 0.28) : base * 1.0;
      const wallA = base;
      const sideA = base * 0.55;

      const bh = yTop - yBase;
      const bw = wx2 - wx1;
      const bd = wz2 - wz1;

      // Pillars
      seg(wx1, yBase, wz1, wx1, yTop, wz1,  wallA,       lw,      W, H);
      seg(wx2, yBase, wz1, wx2, yTop, wz1,  wallA,       lw,      W, H);
      seg(wx1, yBase, wz2, wx1, yTop, wz2,  sideA,       lw,      W, H);
      seg(wx2, yBase, wz2, wx2, yTop, wz2,  sideA,       lw,      W, H);

      // Top rectangle
      seg(wx1, yTop, wz1, wx2, yTop, wz1,  roofA,       lw,      W, H);
      seg(wx1, yTop, wz2, wx2, yTop, wz2,  roofA * 0.6, lw,      W, H);
      seg(wx1, yTop, wz1, wx1, yTop, wz2,  roofA * 0.6, lw,      W, H);
      seg(wx2, yTop, wz1, wx2, yTop, wz2,  roofA * 0.6, lw,      W, H);

      // Setback base ledge
      if (yBase > 0) {
        seg(wx1, yBase, wz1, wx2, yBase, wz1,  wallA * 0.65, lw * 0.8, W, H);
        seg(wx1, yBase, wz1, wx1, yBase, wz2,  sideA * 0.55, lw * 0.8, W, H);
        seg(wx2, yBase, wz1, wx2, yBase, wz2,  sideA * 0.55, lw * 0.8, W, H);
      }

      // Front face — vertical structural columns
      const nV = Math.max(1, Math.round(bw / 15));
      for (let v = 1; v < nV; v++) {
        seg(wx1 + bw * (v / nV), yBase, wz1,
            wx1 + bw * (v / nV), yTop,  wz1,
            wallA * 0.35, lw * 0.55, W, H);
      }

      // Front face — horizontal floor lines
      if (bh > 12) {
        const nF = Math.max(1, Math.round(bh / 16));
        for (let f = 1; f < nF; f++) {
          const fy = yBase + bh * (f / nF);
          seg(wx1, fy, wz1, wx2, fy, wz1, wallA * 0.30, lw * 0.50, W, H);
        }
      }

      // Left side face — horizontal floor lines
      if (bh > 12 && bd > 4) {
        const nF = Math.max(1, Math.round(bh / 20));
        for (let f = 1; f < nF; f++) {
          const fy = yBase + bh * (f / nF);
          seg(wx1, fy, wz1, wx1, fy, wz2, sideA * 0.28, lw * 0.45, W, H);
        }
      }
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      offset += SCROLL_SPEED;
      const scrollMod = offset % MAX_VIEW;

      const visible = city
        .map((b) => {
          let wz = b.wz1 - scrollMod;
          if (wz < -CELL * 2) wz += MAX_VIEW;
          return { b, wz };
        })
        .filter(({ wz }) => wz + CAM_Z > 8 && wz < MAX_VIEW * 0.88)
        .sort((a, b) => b.wz - a.wz);

      for (const { b, wz } of visible) {
        const wz1    = wz;
        const wz2    = wz + (b.wz2 - b.wz1);
        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.78)));
        const base   = 0.035 + depthT * 0.13;   // higher base visibility
        const lw     = 0.40 + depthT * 0.55;

        if (b.district === "downtown" && b.tier2H !== null) {
          // ── Tiered skyscraper ──
          const t2y = b.tier2H;
          const t3y = b.tier3H;
          const i2  = b.ins2;
          const i3  = b.ins3;

          // Tier 1: full footprint
          drawTier(b.wx1, b.wx2, wz1, wz2,
            0, t2y, base, false, width, height, lw);

          // Tier 2: setback
          drawTier(b.wx1 + i2, b.wx2 - i2, wz1 + i2 * 0.45, wz2 - i2 * 0.45,
            t2y, t3y ?? b.h, base * 0.9, t3y === null, width, height, lw * 0.9);

          // Tier 3 (optional)
          if (t3y !== null) {
            drawTier(b.wx1 + i3, b.wx2 - i3, wz1 + i3 * 0.45, wz2 - i3 * 0.45,
              t3y, b.h, base * 0.8, true, width, height, lw * 0.8);
          }
        } else {
          // ── Simple box (midtown / suburb) ──
          drawTier(b.wx1, b.wx2, wz1, wz2,
            0, b.h, base, true, width, height, lw);
        }

        // Ground footprint
        seg(b.wx1, 0, wz1, b.wx2, 0, wz1, base * 0.22, 0.28, width, height);
        seg(b.wx1, 0, wz1, b.wx1, 0, wz2, base * 0.18, 0.28, width, height);
        seg(b.wx2, 0, wz1, b.wx2, 0, wz2, base * 0.18, 0.28, width, height);

        // Antenna
        if (b.hasTower) {
          const cx   = (b.wx1 + b.wx2) / 2;
          const rant = Math.min(base * 2.4, 0.30);
          seg(cx, b.h,      wz1, cx, b.h + 24, wz1, rant,       0.55, width, height);
          seg(cx, b.h + 18, wz1, cx, b.h + 27, wz1, rant * 0.4, 0.45, width, height);
        }

        // Helipad cross
        if (b.hasHelip) {
          const cx  = (b.wx1 + b.wx2) / 2;
          const cz  = (wz1 + wz2) / 2;
          const arm = Math.max(2.5, (b.wx2 - b.wx1) * 0.22);
          const pa  = Math.min(base * 1.3, 0.17);
          seg(cx - arm, b.h, cz, cx + arm, b.h, cz, pa, 0.42, width, height);
          seg(cx, b.h, cz - arm, cx, b.h, cz + arm, pa, 0.42, width, height);
        }
      }

      // ── Street grid ──────────────────────────────────────────────────────
      const halfW = ((COLS - 1) * CELL) / 2;
      for (let row = 0; row < ROWS; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += MAX_VIEW;
        if (wz + CAM_Z <= 8 || wz > MAX_VIEW * 0.88) continue;
        const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.78)));
        const alpha  = 0.009 + depthT * 0.030;
        for (let col = 0; col < COLS - 1; col++) {
          const wx1 = col * CELL - halfW;
          seg(wx1, 0, wz, wx1 + CELL, 0, wz, alpha, 0.28, width, height);
        }
      }

      // ── Street lamp posts at intersections ───────────────────────────────
      for (let row = 0; row < ROWS; row += STREET_N) {
        for (let col = 0; col < COLS; col += STREET_N) {
          let wz = row * CELL - scrollMod;
          if (wz < -CELL) wz += MAX_VIEW;
          if (wz + CAM_Z <= 8 || wz > MAX_VIEW * 0.75) continue;
          const depthT = Math.max(0, Math.min(1, 1 - wz / (MAX_VIEW * 0.75)));
          const alpha  = 0.06 + depthT * 0.13;
          const wx     = col * CELL - halfW;
          seg(wx, 0, wz, wx, 10, wz, alpha, 0.50, width, height);
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
