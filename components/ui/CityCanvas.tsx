"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useLowPower } from "@/hooks/useLowPower";

// ─── Camera ───────────────────────────────────────────────────────────────────
const FOV       = 560;
const CAM_Z     = 260;
const CAM_Y     = 250;
const HORIZON_Y = 0.22;

// ─── World (full-quality defaults) ───────────────────────────────────────────
const CELL         = 72;
const ROWS         = 32;
const COLS         = 22;
const LP_ROWS      = 16;   // low-power: ~50% fewer rows
const LP_COLS      = 12;   // low-power: ~45% fewer cols
const STREET_N     = 5;
const SCROLL_SPEED = 0.20;

// ─── Hologram face colors ─────────────────────────────────────────────────────
const FACE_FILL = "rgba(4,12,4,0.82)";
const SIDE_FILL = "rgba(4,12,4,0.72)";

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
type BldType  = "tower" | "block" | "slab" | "stub";

interface Building {
  wx1: number; wx2: number;
  wz1: number; wz2: number;
  h:   number;
  district: District;
  type: BldType;
  tier2H:   number | null;
  tier3H:   number | null;
  ins2:     number;
  ins3:     number;
  hasTower: boolean;
  hasHelip: boolean;
}

// ─── Projection ───────────────────────────────────────────────────────────────
const project = (wx: number, wy: number, wz: number, W: number, H: number) => {
  const d = wz + CAM_Z;
  if (d <= 0) return null;
  const s = FOV / d;
  return { x: W / 2 + wx * s, y: H * HORIZON_Y + (CAM_Y - wy) * s };
};

// ─── City generator ───────────────────────────────────────────────────────────
function buildCity(rng: () => number, rows: number, cols: number): Building[] {
  const out: Building[] = [];
  const halfW     = ((cols - 1) * CELL) / 2;
  const centreCol = cols / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (col % STREET_N === 0 || row % STREET_N === 0) continue;

      const distX: number = Math.abs(col - centreCol) / centreCol;

      let district: District;
      if      (distX < 0.28) district = "downtown";
      else if (distX < 0.60) district = "midtown";
      else                   district = "suburb";

      const r = rng();
      let type: BldType;
      if (district === "downtown") {
        type = r < 0.50 ? "tower" : r < 0.82 ? "block" : "slab";
      } else if (district === "midtown") {
        type = r < 0.15 ? "tower" : r < 0.52 ? "block" : r < 0.82 ? "slab" : "stub";
      } else {
        type = r < 0.08 ? "block" : r < 0.40 ? "slab" : "stub";
      }

      let minH: number, maxH: number;
      let padX1: number, padX2: number, padZ1: number, padZ2: number;

      switch (type) {
        case "tower":
          padX1 = CELL * (0.24 + rng() * 0.10);
          padX2 = CELL * (0.24 + rng() * 0.10);
          padZ1 = CELL * (0.22 + rng() * 0.08);
          padZ2 = CELL * (0.22 + rng() * 0.08);
          minH = 88; maxH = 155;
          break;
        case "block":
          padX1 = CELL * (0.11 + rng() * 0.10);
          padX2 = CELL * (0.11 + rng() * 0.10);
          padZ1 = CELL * (0.10 + rng() * 0.08);
          padZ2 = CELL * (0.10 + rng() * 0.08);
          minH = 38; maxH = 82;
          break;
        case "slab":
          padX1 = CELL * (0.05 + rng() * 0.07);
          padX2 = CELL * (0.05 + rng() * 0.07);
          padZ1 = CELL * (0.14 + rng() * 0.10);
          padZ2 = CELL * (0.14 + rng() * 0.10);
          minH = 14; maxH = 44;
          break;
        default: // stub
          padX1 = CELL * (0.20 + rng() * 0.14);
          padX2 = CELL * (0.20 + rng() * 0.14);
          padZ1 = CELL * (0.20 + rng() * 0.14);
          padZ2 = CELL * (0.20 + rng() * 0.14);
          minH = 8; maxH = 26;
          break;
      }

      const h  = minH + rng() * (maxH - minH);
      const bw = CELL - padX1 - padX2;

      let tier2H: number | null = null;
      let tier3H: number | null = null;
      let ins2 = 0, ins3 = 0;

      if (type === "tower") {
        tier2H = h * (0.42 + rng() * 0.12);
        ins2   = bw * (0.14 + rng() * 0.10);
        if (h > 115 && rng() > 0.35) {
          tier3H = h * (0.72 + rng() * 0.10);
          ins3   = bw * (0.26 + rng() * 0.10);
        }
      }

      out.push({
        wx1: col * CELL + padX1 - halfW,
        wx2: (col + 1) * CELL - padX2 - halfW,
        wz1: row * CELL + padZ1,
        wz2: (row + 1) * CELL - padZ2,
        h, district, type,
        tier2H, tier3H, ins2, ins3,
        hasTower: type === "tower" && h > 118 && rng() > 0.38,
        hasHelip: type === "block" && h > 44   && rng() > 0.52,
      });
    }
  }
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CityCanvas() {
  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const lowPower             = useLowPower();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Grid dimensions based on device capability ──────────────────────────
    const activeRows = lowPower ? LP_ROWS : ROWS;
    const activeCols = lowPower ? LP_COLS : COLS;
    const maxView    = activeRows * CELL;
    // FPS cap: 30fps on low-power, uncapped otherwise
    const fpsInterval = lowPower ? 1000 / 30 : 0;

    let rafId: number;
    let offset  = 0;
    let lastT   = 0;
    let city: Building[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      city = buildCity(mkRng(canvas.width * 7 + canvas.height * 13), activeRows, activeCols);
    };

    const fillFace = (
      pts: [number, number, number][],
      style: string, W: number, H: number
    ) => {
      const ps = pts.map(([wx, wy, wz]) => project(wx, wy, wz, W, H));
      if (ps.some(p => !p)) return;
      ctx.beginPath();
      ctx.moveTo(ps[0]!.x, ps[0]!.y);
      for (let i = 1; i < ps.length; i++) ctx.lineTo(ps[i]!.x, ps[i]!.y);
      ctx.closePath();
      ctx.fillStyle = style;
      ctx.fill();
    };

    const edge = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      alpha: number, lw: number, W: number, H: number
    ) => {
      const p1 = project(ax, ay, az, W, H);
      const p2 = project(bx, by, bz, W, H);
      if (!p1 || !p2) return;
      ctx.lineWidth = lw;
      ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(4)})`;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const drawTier = (
      wx1: number, wx2: number, wz1: number, wz2: number,
      yBase: number, yTop: number,
      base: number, isTopTier: boolean,
      W: number, H: number, lw: number
    ) => {
      const roofA = isTopTier ? Math.min(base * 2.4, 0.30) : base * 1.0;
      const wallA = base;
      const sideA = base * 0.60;
      const bh = yTop - yBase;
      const bw = wx2 - wx1;

      fillFace([[wx1,yBase,wz1],[wx1,yBase,wz2],[wx1,yTop,wz2],[wx1,yTop,wz1]], SIDE_FILL, W, H);
      fillFace([[wx1,yBase,wz1],[wx2,yBase,wz1],[wx2,yTop,wz1],[wx1,yTop,wz1]], FACE_FILL, W, H);
      fillFace([[wx1,yTop,wz1],[wx2,yTop,wz1],[wx2,yTop,wz2],[wx1,yTop,wz2]], FACE_FILL, W, H);

      edge(wx1,yBase,wz1, wx1,yTop,wz1,  wallA,       lw,      W, H);
      edge(wx2,yBase,wz1, wx2,yTop,wz1,  wallA,       lw,      W, H);
      edge(wx1,yBase,wz2, wx1,yTop,wz2,  sideA,       lw,      W, H);
      edge(wx2,yBase,wz2, wx2,yTop,wz2,  sideA,       lw,      W, H);
      edge(wx1,yTop,wz1,  wx2,yTop,wz1,  roofA,       lw,      W, H);
      edge(wx1,yTop,wz2,  wx2,yTop,wz2,  roofA * 0.6, lw,      W, H);
      edge(wx1,yTop,wz1,  wx1,yTop,wz2,  roofA * 0.6, lw,      W, H);
      edge(wx2,yTop,wz1,  wx2,yTop,wz2,  roofA * 0.6, lw,      W, H);

      if (yBase > 0) {
        edge(wx1,yBase,wz1, wx2,yBase,wz1, wallA * 0.65, lw * 0.8, W, H);
        edge(wx1,yBase,wz1, wx1,yBase,wz2, sideA * 0.55, lw * 0.8, W, H);
        edge(wx2,yBase,wz1, wx2,yBase,wz2, sideA * 0.55, lw * 0.8, W, H);
      }

      // ── Detail geometry: skip on low-power devices ─────────────────────────
      if (!lowPower) {
        // Structural columns on front face
        const nV = Math.max(1, Math.round(bw / 14));
        for (let v = 1; v < nV; v++)
          edge(wx1 + bw*(v/nV), yBase, wz1, wx1 + bw*(v/nV), yTop, wz1, wallA * 0.35, lw*0.55, W, H);

        // Floor lines — front face
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 16));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx2, fy, wz1, wallA * 0.30, lw*0.50, W, H);
          }
        }
        // Floor lines — left side
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 20));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx1, fy, wz2, sideA * 0.28, lw*0.45, W, H);
          }
        }
      }
    };

    const draw = (t = 0) => {
      // FPS cap: skip frame if not enough time has passed
      if (fpsInterval > 0 && t - lastT < fpsInterval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastT = t;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      offset += SCROLL_SPEED;
      const scrollMod = offset % maxView;
      const halfW     = ((activeCols - 1) * CELL) / 2;

      const visible = city
        .map((b) => {
          let wz = b.wz1 - scrollMod;
          if (wz < -CELL * 2) wz += maxView;
          return { b, wz };
        })
        .filter(({ wz }) => wz + CAM_Z > 8 && wz < maxView * 0.88)
        .sort((a, b) => b.wz - a.wz);

      for (const { b, wz } of visible) {
        const wz1    = wz;
        const wz2    = wz + (b.wz2 - b.wz1);
        const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.78)));
        const base   = 0.040 + depthT * 0.15;
        const lw     = 0.42  + depthT * 0.55;

        if (b.type === "tower" && b.tier2H !== null) {
          const t2 = b.tier2H, t3 = b.tier3H, i2 = b.ins2, i3 = b.ins3;
          drawTier(b.wx1,    b.wx2,    wz1,          wz2,          0,  t2,      base,       false,    width, height, lw);
          drawTier(b.wx1+i2, b.wx2-i2, wz1+i2*0.45, wz2-i2*0.45, t2, t3??b.h, base*0.92, t3===null, width, height, lw*0.9);
          if (t3 !== null)
            drawTier(b.wx1+i3, b.wx2-i3, wz1+i3*0.45, wz2-i3*0.45, t3, b.h,   base*0.82, true,      width, height, lw*0.8);
        } else {
          drawTier(b.wx1, b.wx2, wz1, wz2, 0, b.h, base, true, width, height, lw);
        }

        edge(b.wx1, 0, wz1, b.wx2, 0, wz1, base*0.20, 0.28, width, height);
        edge(b.wx1, 0, wz1, b.wx1, 0, wz2, base*0.16, 0.28, width, height);
        edge(b.wx2, 0, wz1, b.wx2, 0, wz2, base*0.16, 0.28, width, height);

        if (b.hasTower) {
          const cx  = (b.wx1 + b.wx2) / 2;
          const ant = Math.min(base * 2.5, 0.32);
          edge(cx, b.h,    wz1, cx, b.h+24, wz1, ant,     0.55, width, height);
          edge(cx, b.h+18, wz1, cx, b.h+27, wz1, ant*0.4, 0.45, width, height);
        }

        if (b.hasHelip) {
          const cx  = (b.wx1 + b.wx2) / 2;
          const cz  = (wz1 + wz2) / 2;
          const arm = Math.max(2.5, (b.wx2 - b.wx1) * 0.22);
          const pa  = Math.min(base * 1.3, 0.18);
          edge(cx-arm, b.h, cz, cx+arm, b.h, cz, pa, 0.42, width, height);
          edge(cx, b.h, cz-arm, cx, b.h, cz+arm, pa, 0.42, width, height);
        }
      }

      // Street grid
      for (let row = 0; row < activeRows; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += maxView;
        if (wz + CAM_Z <= 8 || wz > maxView * 0.88) continue;
        const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.78)));
        const alpha  = 0.010 + depthT * 0.032;
        for (let col = 0; col < activeCols - 1; col++) {
          const wx1 = col * CELL - halfW;
          edge(wx1, 0, wz, wx1+CELL, 0, wz, alpha, 0.28, width, height);
        }
      }

      // Street lamps
      for (let row = 0; row < activeRows; row += STREET_N) {
        for (let col = 0; col < activeCols; col += STREET_N) {
          let wz = row * CELL - scrollMod;
          if (wz < -CELL) wz += maxView;
          if (wz + CAM_Z <= 8 || wz > maxView * 0.75) continue;
          const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.75)));
          edge(col*CELL - halfW, 0, wz, col*CELL - halfW, 10, wz,
            0.06 + depthT*0.13, 0.50, width, height);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);
    rebuild();
    draw();

    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [prefersReducedMotion, lowPower]);

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
