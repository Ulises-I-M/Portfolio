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

// ─── Detail tuning ────────────────────────────────────────────────────────────
const CRAFT_N       = 12;

/**
 * Cheap deterministic hash. Window state is derived from this per cell rather
 * than stored: a mask per building would be ~40KB of state to keep in sync with
 * the tier geometry, and this costs a few multiplies instead.
 */
const hash1 = (a: number) => {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

// ─── Hologram face colors ─────────────────────────────────────────────────────
const FACE_FILL = "rgba(4,12,4,0.96)";
const SIDE_FILL = "rgba(4,12,4,0.94)";

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
/**
 * Roof treatments. The city only ever tapered inward, which reads as 20th
 * century setback massing; the cyberpunk silhouette comes from crowns that
 * cantilever OUT past the shaft, and from apertures cut through the top.
 */
type Crown = "flat" | "hammer" | "ring" | "spires" | "pagoda";

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
  /** Seed for window cells and blink phase — keeps both stable per building */
  id: number;
  phase: number;
  /** Rooftop clutter, in offsets from the building's own footprint */
  roof: { ox: number; oz: number; w: number; d: number; h: number }[];
  /** Facade billboard: vertical span as a fraction of height */
  bill: { y0: number; y1: number } | null;
  /** Skyway to a neighbour already placed in this row */
  sky: { x: number; y: number } | null;
  crown: Crown;
  /** Lateral drift per setback, so tiers step off-axis instead of concentric */
  skew: number;
  /** Sign blade projecting perpendicular from the facade */
  blade: { y: number; h: number; out: number } | null;
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

  let id = 0;

  for (let row = 0; row < rows; row++) {
    // Reset per row: skyways only ever connect neighbours in the same row
    let prev: Building | null = null;

    for (let col = 0; col < cols; col++) {
      if (col % STREET_N === 0 || row % STREET_N === 0) { prev = null; continue; }

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

      // Rooftop clutter — tanks and plant on the flatter roofs
      const roof: Building["roof"] = [];
      if ((type === "block" || type === "slab") && rng() > 0.45) {
        const n = 1 + Math.floor(rng() * 3);
        for (let k = 0; k < n; k++) {
          roof.push({
            ox: 0.12 + rng() * 0.6,
            oz: 0.12 + rng() * 0.6,
            w:  0.10 + rng() * 0.16,
            d:  0.10 + rng() * 0.16,
            h:  3 + rng() * 7,
          });
        }
      }

      // Facade billboard, on taller mid-city stock
      const bill =
        h > 55 && district !== "suburb" && rng() > 0.82
          ? { y0: 0.42 + rng() * 0.18, y1: 0.60 + rng() * 0.16 }
          : null;

      // Crowns weight toward the tall stock: a hammerhead on a stub reads as
      // noise, on a tower it reads as architecture.
      const cr = rng();
      let crown: Crown = "flat";
      if (type === "tower") {
        crown = cr < 0.30 ? "hammer" : cr < 0.48 ? "ring" : cr < 0.70 ? "spires" : cr < 0.84 ? "pagoda" : "flat";
      } else if (type === "block" && h > 55) {
        crown = cr < 0.22 ? "hammer" : cr < 0.34 ? "pagoda" : "flat";
      }

      const bw0 = CELL - padX1 - padX2;

      const b: Building = {
        wx1: col * CELL + padX1 - halfW,
        wx2: (col + 1) * CELL - padX2 - halfW,
        wz1: row * CELL + padZ1,
        wz2: (row + 1) * CELL - padZ2,
        h, district, type,
        tier2H, tier3H, ins2, ins3,
        hasTower: type === "tower" && h > 118 && rng() > 0.38,
        hasHelip: type === "block" && h > 44   && rng() > 0.52,
        id: id++,
        phase: rng(),
        roof,
        bill,
        sky: null,
        crown,
        skew: (rng() - 0.5) * bw0 * 0.30,
        blade:
          h > 40 && district !== "suburb" && rng() > 0.72
            ? { y: h * (0.45 + rng() * 0.35), h: 8 + rng() * 16, out: 9 + rng() * 12 }
            : null,
      };

      // Skyway between two tall neighbours, hung below both roofs
      if (prev && prev.type === "tower" && type === "tower" && rng() > 0.78) {
        const y = Math.min(prev.h, h) * (0.55 + rng() * 0.25);
        prev.sky = { x: b.wx1, y };
      }

      out.push(b);
      prev = b;
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
    let frameT  = 0;   // ms, shared by window flicker, beacons and traffic
    let city: Building[] = [];
    let craft: { x: number; z: number; y: number; vx: number; len: number }[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      city = buildCity(mkRng(canvas.width * 7 + canvas.height * 13), activeRows, activeCols);

      // Air traffic — a small fixed pool on fixed lanes, wrapping at the edges
      const cr = mkRng(canvas.width * 31 + 17);
      const span = ((activeCols - 1) * CELL) / 2 + CELL * 3;
      craft = Array.from({ length: lowPower ? 0 : CRAFT_N }, () => {
        const dir = cr() > 0.5 ? 1 : -1;
        return {
          x:   (cr() * 2 - 1) * span,
          z:   CELL * 2 + cr() * (activeRows * CELL * 0.55),
          y:   185 + cr() * 130,
          vx:  dir * (0.9 + cr() * 1.5),
          len: 16 + cr() * 26,
        };
      });
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

    // ── Batched edge stroking ────────────────────────────────────────────────
    // Previously every segment did its own beginPath/stroke: at ~500 buildings
    // by ~26 segments that was upwards of 13k stroke calls a frame, and the
    // scene only managed 43fps before any of the detail below existed.
    // Segments now accumulate into buckets keyed by quantised alpha and width,
    // and each bucket strokes as a single path.
    //
    // Buckets are flushed in depth bands rather than once at the end: buildings
    // are painted back-to-front over near-opaque fills, so deferring every edge
    // to the end would let distant edges draw over near facades.
    const segs = new Map<number, number[]>();

    const edge = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      alpha: number, lw: number, W: number, H: number
    ) => {
      if (alpha < 0.006) return;            // below visibility — never shows
      const p1 = project(ax, ay, az, W, H);
      const p2 = project(bx, by, bz, W, H);
      if (!p1 || !p2) return;
      // 0.005 alpha steps, 0.05 width steps: finer than the eye can separate at
      // these values, and collapses the many near-identical shades per building
      const qa = Math.min(255, Math.round(alpha * 200));
      const ql = Math.min(255, Math.round(lw * 20));
      const key = qa * 256 + ql;
      let arr = segs.get(key);
      if (!arr) { arr = []; segs.set(key, arr); }
      arr.push(p1.x, p1.y, p2.x, p2.y);
    };

    // Windows are filled quads, not strokes, so they need their own buckets.
    // Perspective means they are not axis-aligned, hence polygons over rect().
    const quads = new Map<number, number[]>();
    // Flat [x, y, alpha, ...] gathered during the building pass
    const beacons: number[] = [];

    const quad = (
      pts: [number, number, number][], alpha: number, W: number, H: number
    ) => {
      if (alpha < 0.01) return;
      const ps = pts.map(([wx, wy, wz]) => project(wx, wy, wz, W, H));
      if (ps.some(p => !p)) return;
      const key = Math.min(255, Math.round(alpha * 200));
      let arr = quads.get(key);
      if (!arr) { arr = []; quads.set(key, arr); }
      for (const pt of ps) arr.push(pt!.x, pt!.y);
    };

    const flushQuads = () => {
      for (const [key, arr] of quads) {
        if (arr.length === 0) continue;
        ctx.fillStyle = `rgba(190,255,90,${(key / 200).toFixed(4)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 8) {
          ctx.moveTo(arr[i], arr[i + 1]);
          ctx.lineTo(arr[i + 2], arr[i + 3]);
          ctx.lineTo(arr[i + 4], arr[i + 5]);
          ctx.lineTo(arr[i + 6], arr[i + 7]);
          ctx.closePath();
        }
        ctx.fill();
        arr.length = 0;
      }
    };

    const flushEdges = () => {
      for (const [key, arr] of segs) {
        if (arr.length === 0) continue;
        ctx.lineWidth   = (key & 255) / 20;
        ctx.strokeStyle = `rgba(168,255,0,${((key >> 8) / 200).toFixed(4)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 4) {
          ctx.moveTo(arr[i], arr[i + 1]);
          ctx.lineTo(arr[i + 2], arr[i + 3]);
        }
        ctx.stroke();
        arr.length = 0;                     // reuse the array, avoid GC churn
      }
    };

    const drawTier = (
      wx1: number, wx2: number, wz1: number, wz2: number,
      yBase: number, yTop: number,
      base: number, isTopTier: boolean,
      W: number, H: number, lw: number,
      seed = -1, depthT = 0
    ) => {
      const roofA = isTopTier ? Math.min(base * 2.4, 0.30) : base * 1.0;
      const wallA = base;
      const sideA = base * 0.60;
      const bh = yTop - yBase;
      const bw = wx2 - wx1;

      const sideX = (wx1 + wx2) / 2 > 0 ? wx1 : wx2;
      fillFace([[sideX,yBase,wz1],[sideX,yBase,wz2],[sideX,yTop,wz2],[sideX,yTop,wz1]], SIDE_FILL, W, H);
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
        const nV = Math.max(1, Math.round(bw / 26));

        // Floor lines — front face
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 30));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx2, fy, wz1, wallA * 0.30, lw*0.50, W, H);
          }
        }
        // Floor lines — left side
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 34));
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
      lastT  = t;
      frameT = t;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      offset += SCROLL_SPEED;
      const scrollMod = offset % maxView;
      const halfW     = ((activeCols - 1) * CELL) / 2;

      // Wet-asphalt glow along the ground plane, under everything
      const horizonY = height * HORIZON_Y;
      const groundG = ctx.createLinearGradient(0, horizonY, 0, height);
      groundG.addColorStop(0,    "rgba(168,255,0,0.000)");
      groundG.addColorStop(0.45, "rgba(168,255,0,0.022)");
      groundG.addColorStop(1,    "rgba(168,255,0,0.000)");
      ctx.fillStyle = groundG;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      const visible = city
        .map((b) => {
          let wz = b.wz1 - scrollMod;
          if (wz < -CELL * 2) wz += maxView;
          return { b, wz };
        })
        .filter(({ wz }) => wz + CAM_Z > 8 && wz < maxView * 0.72)
        .sort((a, b) => b.wz - a.wz);

      let bandCount = 0;
      for (const { b, wz } of visible) {
        // Band size trades stroke calls against occlusion fidelity. These are
        // consecutive in depth, so an edge drawing over a neighbour's facade
        // within a band is a sub-pixel concern.
        if (++bandCount % 24 === 0) { flushEdges(); flushQuads(); }
        const wz1    = wz;
        const wz2    = wz + (b.wz2 - b.wz1);
        const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.78)));
        const base   = 0.022 + Math.pow(depthT, 2.0) * 0.185;
        const lw     = 0.42  + depthT * 0.55;

        if (b.type === "tower" && b.tier2H !== null) {
          const t2 = b.tier2H, t3 = b.tier3H, i2 = b.ins2, i3 = b.ins3;
          drawTier(b.wx1,    b.wx2,    wz1,          wz2,          0,  t2,      base,       false,    width, height, lw,     b.id,          depthT);
          drawTier(b.wx1+i2+b.skew, b.wx2-i2+b.skew, wz1+i2*0.45, wz2-i2*0.45, t2, t3??b.h, base*0.92, t3===null, width, height, lw*0.9, b.id + 5000,   depthT);
          if (t3 !== null)
            drawTier(b.wx1+i3+b.skew*1.6, b.wx2-i3+b.skew*1.6, wz1+i3*0.45, wz2-i3*0.45, t3, b.h,   base*0.82, true,      width, height, lw*0.8, b.id + 9000,   depthT);
        } else {
          drawTier(b.wx1, b.wx2, wz1, wz2, 0, b.h, base, true, width, height, lw, b.id, depthT);
        }

        edge(b.wx1, 0, wz1, b.wx2, 0, wz1, base*0.20, 0.28, width, height);
        edge(b.wx1, 0, wz1, b.wx1, 0, wz2, base*0.16, 0.28, width, height);
        edge(b.wx2, 0, wz1, b.wx2, 0, wz2, base*0.16, 0.28, width, height);

        // ── Crown ────────────────────────────────────────────────────────
        if (!lowPower && b.crown !== "flat" && depthT > 0.22) {
          const bw3 = b.wx2 - b.wx1;
          const dz  = wz2 - wz1;
          const cx3 = (b.wx1 + b.wx2) / 2 + b.skew;
          const x1  = b.wx1 + b.skew;
          const x2  = b.wx2 + b.skew;
          const ca  = Math.min(0.55, base * 2.6);
          const clw = lw * 0.85;

          const box = (ax: number, bx: number, az: number, bz: number, y0: number, y1: number, a: number) => {
            // Solid, not hollow: a crown is what gets read against the sky, and
            // an empty outline lets the whole city behind it through
            const sx3 = (ax + bx) / 2 > 0 ? ax : bx;
            fillFace([[sx3,y0,az],[sx3,y0,bz],[sx3,y1,bz],[sx3,y1,az]], SIDE_FILL, width, height);
            fillFace([[ax,y0,az],[bx,y0,az],[bx,y1,az],[ax,y1,az]], FACE_FILL, width, height);
            fillFace([[ax,y1,az],[bx,y1,az],[bx,y1,bz],[ax,y1,bz]], FACE_FILL, width, height);
            edge(ax, y0, az, bx, y0, az, a, clw, width, height);
            edge(ax, y1, az, bx, y1, az, a, clw, width, height);
            edge(ax, y0, az, ax, y1, az, a, clw, width, height);
            edge(bx, y0, az, bx, y1, az, a, clw, width, height);
            edge(ax, y1, az, ax, y1, bz, a * 0.6, clw * 0.8, width, height);
            edge(bx, y1, az, bx, y1, bz, a * 0.6, clw * 0.8, width, height);
            edge(ax, y1, bz, bx, y1, bz, a * 0.6, clw * 0.8, width, height);
          };

          if (b.crown === "hammer") {
            // Cap wider than the shaft, on a narrow neck — the overhang is the
            // whole point, so it has to read clearly against the sky
            const oh = bw3 * 0.34;
            const nk = bw3 * 0.30;
            box(cx3 - nk, cx3 + nk, wz1 + dz * 0.2, wz2 - dz * 0.2, b.h, b.h + 13, ca * 0.8);
            box(x1 - oh, x2 + oh, wz1 - dz * 0.12, wz2 + dz * 0.12, b.h + 13, b.h + 26, ca);
            edge(x1 - oh, b.h + 13, wz1 - dz * 0.12, x1, b.h + 13, wz1, ca * 0.7, clw, width, height);
            edge(x2 + oh, b.h + 13, wz1 - dz * 0.12, x2, b.h + 13, wz1, ca * 0.7, clw, width, height);
          } else if (b.crown === "ring") {
            // Twin uprights bridged at the top: the gap between them is the
            // aperture that makes the silhouette read as engineered
            const inset = bw3 * 0.16;
            const postW = bw3 * 0.20;
            const top = b.h + 34;
            box(x1 + inset, x1 + inset + postW, wz1, wz2, b.h, top, ca);
            box(x2 - inset - postW, x2 - inset, wz1, wz2, b.h, top, ca);
            edge(x1 + inset, top, wz1, x2 - inset, top, wz1, ca, clw, width, height);
            edge(x1 + inset, top - 7, wz1, x2 - inset, top - 7, wz1, ca * 0.55, clw * 0.8, width, height);
          } else if (b.crown === "spires") {
            const n = 3;
            for (let k = 0; k < n; k++) {
              const sx = x1 + bw3 * (0.24 + k * 0.26);
              const sh = 20 + ((b.id * 37 + k * 13) % 26);
              edge(sx, b.h, wz1 + dz * 0.5, sx, b.h + sh, wz1 + dz * 0.5, ca * 0.9, clw * 0.8, width, height);
              edge(sx - 2.5, b.h + sh * 0.55, wz1 + dz * 0.5, sx + 2.5, b.h + sh * 0.55, wz1 + dz * 0.5, ca * 0.5, clw * 0.6, width, height);
            }
          } else if (b.crown === "pagoda") {
            // Stacked slabs, each overhanging the one below
            let y = b.h;
            for (let k = 0; k < 3; k++) {
              const grow = bw3 * (0.10 + k * 0.09);
              box(x1 - grow, x2 + grow, wz1 - dz * 0.08, wz2 + dz * 0.08, y, y + 7, ca * (1 - k * 0.18));
              y += 11;
            }
          }
        }

        // ── Sign blade ───────────────────────────────────────────────────
        // Panel cantilevered off the facade, the signature of the reference
        if (!lowPower && b.blade && depthT > 0.36) {
          const bl = b.blade;
          const sx = b.wx2;
          const zf = wz1 - bl.out;
          const a  = Math.min(0.42, base * 2.0);
          quad([[sx, bl.y, wz1], [sx, bl.y, zf], [sx, bl.y + bl.h, zf], [sx, bl.y + bl.h, wz1]],
            Math.min(0.20, base * 1.0), width, height);
          edge(sx, bl.y, wz1, sx, bl.y, zf, a, lw * 0.8, width, height);
          edge(sx, bl.y + bl.h, wz1, sx, bl.y + bl.h, zf, a, lw * 0.8, width, height);
          edge(sx, bl.y, zf, sx, bl.y + bl.h, zf, a, lw * 0.8, width, height);
        }

        if (b.hasTower) {
          const cx  = (b.wx1 + b.wx2) / 2;
          const ant = Math.min(base * 2.5, 0.32);
          edge(cx, b.h,    wz1, cx, b.h+24, wz1, ant,     0.55, width, height);
          edge(cx, b.h+18, wz1, cx, b.h+27, wz1, ant*0.4, 0.45, width, height);

          // Aircraft warning beacon. The only red in an all-green scene, so it
          // stays small and sparse rather than becoming the subject.
          if (!lowPower && depthT > 0.3) {
            const on = ((frameT / 1500 + b.phase) % 1) < 0.42;
            if (on) {
              const pt = project(cx, b.h + 28, wz1, width, height);
              if (pt) {
                beacons.push(pt.x, pt.y, Math.min(0.75, 0.25 + depthT * 0.7));
              }
            }
          }
        }

        if (!lowPower && depthT > 0.34) {
          // Rooftop clutter
          const bw2 = b.wx2 - b.wx1;
          const bd2 = wz2 - wz1;
          for (const r of b.roof) {
            const rx1 = b.wx1 + bw2 * r.ox;
            const rx2 = rx1 + bw2 * r.w;
            const rz1 = wz1 + bd2 * r.oz;
            const rz2 = rz1 + bd2 * r.d;
            const a = base * 0.7;
            const rsx = (rx1 + rx2) / 2 > 0 ? rx1 : rx2;
            fillFace([[rsx,b.h,rz1],[rsx,b.h,rz2],[rsx,b.h+r.h,rz2],[rsx,b.h+r.h,rz1]], SIDE_FILL, width, height);
            fillFace([[rx1,b.h,rz1],[rx2,b.h,rz1],[rx2,b.h+r.h,rz1],[rx1,b.h+r.h,rz1]], FACE_FILL, width, height);
            fillFace([[rx1,b.h+r.h,rz1],[rx2,b.h+r.h,rz1],[rx2,b.h+r.h,rz2],[rx1,b.h+r.h,rz2]], FACE_FILL, width, height);
            edge(rx1, b.h, rz1, rx2, b.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h + r.h, rz1, rx2, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h, rz1, rx1, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx2, b.h, rz1, rx2, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h + r.h, rz1, rx1, b.h + r.h, rz2, a*0.6, lw*0.5, width, height);
            edge(rx2, b.h + r.h, rz1, rx2, b.h + r.h, rz2, a*0.6, lw*0.5, width, height);
          }

          // Facade billboard — brighter than the wall it sits on
          if (b.bill) {
            const bx1 = b.wx1 + bw2 * 0.30;
            const bx2 = b.wx2 - bw2 * 0.30;
            const by1 = b.h * b.bill.y0;
            const by2 = b.h * b.bill.y1;
            const pulse = 0.55 + 0.45 * Math.sin(frameT / 900 + b.phase * 6.28);
            quad([[bx1,by1,wz1],[bx2,by1,wz1],[bx2,by2,wz1],[bx1,by2,wz1]],
              Math.min(0.22, base * 1.1 * pulse), width, height);
            const ba = Math.min(0.34, base * 1.7);
            edge(bx1, by1, wz1, bx2, by1, wz1, ba, lw*0.8, width, height);
            edge(bx1, by2, wz1, bx2, by2, wz1, ba, lw*0.8, width, height);
            edge(bx1, by1, wz1, bx1, by2, wz1, ba, lw*0.8, width, height);
            edge(bx2, by1, wz1, bx2, by2, wz1, ba, lw*0.8, width, height);
          }

          // Skyway to the neighbour recorded at generation time
          if (b.sky) {
            const y = b.sky.y;
            const zc = (wz1 + wz2) / 2;
            const a = base * 1.1;
            edge(b.wx2, y,   zc - 4, b.sky.x, y,   zc - 4, a, lw*0.8, width, height);
            edge(b.wx2, y+7, zc - 4, b.sky.x, y+7, zc - 4, a, lw*0.8, width, height);
            edge(b.wx2, y,   zc + 4, b.sky.x, y,   zc + 4, a*0.6, lw*0.6, width, height);
            edge(b.wx2, y,   zc - 4, b.wx2,   y+7, zc - 4, a*0.7, lw*0.6, width, height);
            edge(b.sky.x, y, zc - 4, b.sky.x, y+7, zc - 4, a*0.7, lw*0.6, width, height);
          }
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

      flushEdges();
      flushQuads();

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

      flushEdges();

      // ── Aircraft beacons ────────────────────────────────────────────────
      if (beacons.length) {
        for (let i = 0; i < beacons.length; i += 3) {
          ctx.fillStyle = `rgba(255,60,45,${beacons[i + 2].toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(beacons[i], beacons[i + 1], 1.5, 0, 6.283);
          ctx.fill();
        }
        beacons.length = 0;
      }

      // ── Air traffic ─────────────────────────────────────────────────────
      // Drawn after the city: these fly above it, so occlusion is not worth
      // resolving. Same projection and depth fade as everything else.
      if (craft.length) {
        const wrapAt = ((activeCols - 1) * CELL) / 2 + CELL * 4;
        for (const c of craft) {
          c.x += c.vx;
          if (c.x >  wrapAt) c.x = -wrapAt;
          if (c.x < -wrapAt) c.x =  wrapAt;

          let cz = c.z - scrollMod;
          if (cz < -CELL * 2) cz += maxView;
          if (cz + CAM_Z <= 8 || cz > maxView * 0.8) continue;

          const dT = Math.max(0, Math.min(1, 1 - cz / (maxView * 0.78)));
          const head = project(c.x, c.y, cz, width, height);
          const tail = project(c.x - c.vx * c.len, c.y, cz, width, height);
          if (!head || !tail) continue;

          const a = 0.10 + dT * 0.5;
          const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          g.addColorStop(0, "rgba(168,255,0,0)");
          g.addColorStop(1, `rgba(200,255,120,${a.toFixed(3)})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.5 + dT * 1.1;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(head.x, head.y);
          ctx.stroke();

          ctx.fillStyle = `rgba(220,255,160,${Math.min(0.85, a * 1.6).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 0.6 + dT * 1.1, 0, 6.283);
          ctx.fill();
        }
      }

      // ── Horizon haze ────────────────────────────────────────────────────
      // Last, so distant buildings dissolve into it. Near ones extend far
      // below the horizon and are barely touched.
      const hazeG = ctx.createLinearGradient(0, horizonY - height * 0.06, 0, horizonY + height * 0.30);
      hazeG.addColorStop(0,   "rgba(6,10,6,0.78)");
      hazeG.addColorStop(0.4, "rgba(6,10,6,0.46)");
      hazeG.addColorStop(1,   "rgba(6,10,6,0)");
      ctx.fillStyle = hazeG;
      ctx.fillRect(0, horizonY - height * 0.06, width, height * 0.36);

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
