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

// ─── Tuning ───────────────────────────────────────────────────────────────────
// Everything you would reach for to change how the city looks lives here. The
// values below are the only place any colour or opacity is written down; the
// drawing code reads from them and never hardcodes its own.

// ── Building bodies ──────────────────────────────────────────────────────────
// The top third of a building is genuinely opaque — it occludes whatever is
// behind it — and from there down the volume dissolves to nothing. At full
// opacity the faces can no longer be told apart by alpha, so the three shade by
// colour instead: the receding side darker, the roof catching more light.
// These carry no alpha of their own; the height ramp supplies it.
const FACE_RGB = "16,40,9";
const SIDE_RGB = "9,24,5";
const ROOF_RGB = "28,64,15";

/** Opaque at or above HOLD (as a fraction of height), down to MIN at the base. */
const FADE_HOLD = 2 / 3;
const FADE_MIN  = 0.01;

// ── Wireframe lines ──────────────────────────────────────────────────────────
const EDGE_RGB = "168,255,0";
/** Brightness by distance: FAR at the horizon, FAR+NEAR at the camera. */
const EDGE_A_FAR   = 0.06;
const EDGE_A_NEAR  = 0.44;
/** Above 1 this collapses the far half faster, so distance dissolves. */
const EDGE_A_CURVE = 1.35;
/** Line width by distance, same idea. */
const EDGE_W_FAR   = 0.42;
const EDGE_W_NEAR  = 0.55;

/** Brightness per kind of line, as a fraction of the distance-based base. */
const EDGE_MUL = {
  vertFront:  1.00,   // corner uprights on the lit face
  vertSide:   0.60,   // corner uprights on the receding face
  roofTop:    2.40,   // roof outline on the topmost tier, capped by ROOF_CAP
  roofOther:  1.00,   // roof outline on a lower tier
  roofBack:   0.60,   // the far half of a roof outline
  baseFront:  0.65,   // where a tier lands on the one below
  baseSide:   0.55,
  footFront:  0.20,   // the building's footprint on the ground
  footSide:   0.16,
  column:     0.35,   // structural uprights
  floorFront: 0.30,   // floor lines on the lit face
  floorSide:  0.28,
} as const;
/** Ceiling on the top tier's roof outline, which would otherwise blow out. */
const ROOF_CAP = 0.30;

/** Line width per kind, as a fraction of the distance-based width. */
const EDGE_LW = {
  base:   0.80,
  foot:   0.28,   // absolute, not a fraction
  column: 0.55,
  floorFront: 0.50,
  floorSide:  0.45,
} as const;

// ── Ground ───────────────────────────────────────────────────────────────────
const GRID_A_FAR  = 0.010;
const GRID_A_NEAR = 0.032;
const GRID_LW     = 0.28;
const LAMP_A_FAR  = 0.06;
const LAMP_A_NEAR = 0.13;
const LAMP_LW     = 0.50;
/** Wet-asphalt sheen along the ground plane. */
const GLOW_RGB    = "168,255,0";
const GLOW_A      = 0.022;

// ── Air traffic ──────────────────────────────────────────────────────────────
const CRAFT_TAIL_RGB = "168,255,0";   // fades to nothing behind the craft
const CRAFT_HEAD_RGB = "200,255,120";
const CRAFT_DOT_RGB  = "220,255,160";
const CRAFT_A_FAR    = 0.10;
const CRAFT_A_NEAR   = 0.50;
const CRAFT_DOT_CAP  = 0.85;

// ── Aircraft beacons ─────────────────────────────────────────────────────────
// The only red in an all-green scene, so it stays small and sparse
const BEACON_RGB = "255,60,45";

// ── Horizon haze ─────────────────────────────────────────────────────────────
const HAZE_RGB  = "6,10,6";
const HAZE_A_TOP = 0.78;
const HAZE_A_MID = 0.46;

// ── Derived ──────────────────────────────────────────────────────────────────
const heightFade = (y: number, total: number) => {
  if (total <= 0) return 1;
  const t = y / total;
  if (t >= FADE_HOLD) return 1;
  return FADE_MIN + (t / FADE_HOLD) * (1 - FADE_MIN);
};

const fillOf = (rgb: string, a: number) => `rgba(${rgb},${Math.min(1, a).toFixed(3)})`;

/** Steps a vertical edge is split into so it can follow the ramp. */
const V_FADE_STEPS = 5;

// ─── Depth of field ───────────────────────────────────────────────────────────
const DOF_BLUR      = 4;     // px at the reduced scale
const DOF_STRIPS    = 10;    // per band; enough that the ramp reads continuous
const DOF_SHARP_TOP = 0.40;  // fraction of height where the sharp strip begins
const DOF_SHARP_BOT = 0.74;  // and where it ends

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
  /** Blink phase for the aircraft beacon */
  phase: number;
  /** Rooftop clutter, in offsets from the building's own footprint */
  roof: { ox: number; oz: number; w: number; d: number; h: number }[];
  /** Skyway to a neighbour already placed in this row */
  sky: { x: number; y: number } | null;
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

      const b: Building = {
        wx1: col * CELL + padX1 - halfW,
        wx2: (col + 1) * CELL - padX2 - halfW,
        wz1: row * CELL + padZ1,
        wz2: (row + 1) * CELL - padZ2,
        h, district, type,
        tier2H, tier3H, ins2, ins3,
        hasTower: type === "tower" && h > 118 && rng() > 0.38,
        hasHelip: type === "block" && h > 44   && rng() > 0.52,
        phase: rng(),
        roof,
        sky: null,
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

    // Post-processing buffers. Two, not one: the downscale and the blur have to be
    // separate steps, because setting a blur filter and then drawing a
    // full-size source into a small canvas makes the browser blur at full
    // resolution first.
    const BLUR_DIV = 4;
    const small    = document.createElement("canvas");
    const smallCtx = small.getContext("2d");
    const blurBuf  = document.createElement("canvas");
    const blurCtx  = blurBuf.getContext("2d");
    if (!smallCtx || !blurCtx) return;

    // ── Grid dimensions based on device capability ──────────────────────────
    const activeRows = lowPower ? LP_ROWS : ROWS;
    const activeCols = lowPower ? LP_COLS : COLS;
    const maxView    = activeRows * CELL;
    // FPS cap: 30fps on low-power, uncapped otherwise
    const fpsInterval = lowPower ? 1000 / 30 : 0;

    let rafId: number;
    let offset  = 0;
    let lastT   = 0;
    let frameT  = 0;   // ms, shared by the beacons and the air traffic
    let city: Building[] = [];
    let craft: { x: number; z: number; y: number; vx: number; len: number }[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      small.width    = Math.max(1, Math.round(canvas.width  / BLUR_DIV));
      small.height   = Math.max(1, Math.round(canvas.height / BLUR_DIV));
      blurBuf.width  = small.width;
      blurBuf.height = small.height;
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
      style: string | CanvasGradient, W: number, H: number
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

    // Flat [x, y, alpha, ...] gathered during the building pass
    const beacons: number[] = [];

    const flushEdges = () => {
      for (const [key, arr] of segs) {
        if (arr.length === 0) continue;
        ctx.lineWidth   = (key & 255) / 20;
        ctx.strokeStyle = `rgba(${EDGE_RGB},${((key >> 8) / 200).toFixed(4)})`;
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
      depthT = 0, bTotal = 0
    ) => {
      const total = bTotal || yTop;
      const roofA = isTopTier
        ? Math.min(base * EDGE_MUL.roofTop, ROOF_CAP)
        : base * EDGE_MUL.roofOther;
      const wallA = base * EDGE_MUL.vertFront;
      const sideA = base * EDGE_MUL.vertSide;
      const bh = yTop - yBase;
      const bw = wx2 - wx1;

      const sideX = (wx1 + wx2) / 2 > 0 ? wx1 : wx2;

      // Vertical faces fade downward rather than carrying a flat alpha, so each
      // volume reads as a projection losing coherence toward its base instead
      // of as an evenly tinted pane of glass.
      // Sampled at several stops rather than two: a tier can straddle the hold
      // line, or sit entirely above or below it, and sampling handles all three
      // without special-casing any of them.
      // Sampled at several stops rather than two: a tier can straddle the hold
      // line, or sit entirely above or below it, and sampling handles all three
      // without special-casing any of them.
      const vertFill = (rgb: string, atX: number, atZ: number): string | CanvasGradient => {
        const pT = project(atX, yTop,  atZ, W, H);
        const pB = project(atX, yBase, atZ, W, H);
        if (!pT || !pB || Math.abs(pB.y - pT.y) < 1) return fillOf(rgb, heightFade(yTop, total));
        const g = ctx.createLinearGradient(0, pT.y, 0, pB.y);
        for (let i = 0; i <= 4; i++) {
          const p = i / 4;
          const wy = yTop - p * (yTop - yBase);
          g.addColorStop(p, fillOf(rgb, heightFade(wy, total)));
        }
        return g;
      };

      fillFace([[sideX,yBase,wz1],[sideX,yBase,wz2],[sideX,yTop,wz2],[sideX,yTop,wz1]], vertFill(SIDE_RGB, sideX, wz1), W, H);
      fillFace([[wx1,yBase,wz1],[wx2,yBase,wz1],[wx2,yTop,wz1],[wx1,yTop,wz1]], vertFill(FACE_RGB, wx1, wz1), W, H);
      fillFace([[wx1,yTop,wz1],[wx2,yTop,wz1],[wx2,yTop,wz2],[wx1,yTop,wz2]], fillOf(ROOF_RGB, heightFade(yTop, total)), W, H);

      // A vertical edge has to fade along its own length, but the batcher groups
      // segments by quantised alpha and strokes each group as one path — a
      // gradient stroke would force one path per edge and undo that. Splitting
      // the run into steps keeps every piece inside the batch.
      const vEdge = (x: number, z: number, alpha: number, lwv: number) => {
        for (let i = 0; i < V_FADE_STEPS; i++) {
          const a0 = yBase + (yTop - yBase) * (i / V_FADE_STEPS);
          const a1 = yBase + (yTop - yBase) * ((i + 1) / V_FADE_STEPS);
          edge(x, a0, z, x, a1, z, alpha * heightFade((a0 + a1) / 2, total), lwv, W, H);
        }
      };

      vEdge(wx1, wz1, wallA, lw);
      vEdge(wx2, wz1, wallA, lw);
      vEdge(wx1, wz2, sideA, lw);
      vEdge(wx2, wz2, sideA, lw);

      // Horizontal runs sit at one height, so they just sample the ramp there
      const fTop = heightFade(yTop, total);
      edge(wx1,yTop,wz1,  wx2,yTop,wz1,  roofA * fTop,                        lw, W, H);
      edge(wx1,yTop,wz2,  wx2,yTop,wz2,  roofA * EDGE_MUL.roofBack * fTop,    lw, W, H);
      edge(wx1,yTop,wz1,  wx1,yTop,wz2,  roofA * EDGE_MUL.roofBack * fTop,    lw, W, H);
      edge(wx2,yTop,wz1,  wx2,yTop,wz2,  roofA * EDGE_MUL.roofBack * fTop,    lw, W, H);

      if (yBase > 0) {
        const fBase = heightFade(yBase, total);
        edge(wx1,yBase,wz1, wx2,yBase,wz1, wallA * EDGE_MUL.baseFront * fBase, lw * EDGE_LW.base, W, H);
        edge(wx1,yBase,wz1, wx1,yBase,wz2, sideA * EDGE_MUL.baseSide * fBase, lw * EDGE_LW.base, W, H);
        edge(wx2,yBase,wz1, wx2,yBase,wz2, sideA * EDGE_MUL.baseSide * fBase, lw * EDGE_LW.base, W, H);
      }

      // ── Detail geometry ────────────────────────────────────────────────────
      // Gated on depth as well as capability: past the near band the depth blur
      // dissolves these lines entirely, so drawing them there is work the
      // next pass destroys.
      if (!lowPower && depthT > 0.52) {
        // Structural columns on front face
        const nV = Math.max(1, Math.round(bw / 14));
        for (let v = 1; v < nV; v++)
          vEdge(wx1 + bw*(v/nV), wz1, wallA * EDGE_MUL.column, lw * EDGE_LW.column);

        // Floor lines — front face
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 16));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx2, fy, wz1, wallA * EDGE_MUL.floorFront * heightFade(fy, total), lw * EDGE_LW.floorFront, W, H);
          }
        }
        // Floor lines — left side
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 20));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx1, fy, wz2, sideA * EDGE_MUL.floorSide * heightFade(fy, total), lw * EDGE_LW.floorSide, W, H);
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
      groundG.addColorStop(0,    fillOf(GLOW_RGB, 0));
      groundG.addColorStop(0.45, fillOf(GLOW_RGB, GLOW_A));
      groundG.addColorStop(1,    fillOf(GLOW_RGB, 0));
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
        if (++bandCount % 24 === 0) flushEdges();
        const wz1    = wz;
        const wz2    = wz + (b.wz2 - b.wz1);
        const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.78)));
        const base   = EDGE_A_FAR + Math.pow(depthT, EDGE_A_CURVE) * EDGE_A_NEAR;
        const lw     = EDGE_W_FAR + depthT * EDGE_W_NEAR;

        if (b.type === "tower" && b.tier2H !== null) {
          const t2 = b.tier2H, t3 = b.tier3H, i2 = b.ins2, i3 = b.ins3;
          drawTier(b.wx1,    b.wx2,    wz1,          wz2,          0,  t2,      base,       false,    width, height, lw, depthT, b.h);
          drawTier(b.wx1+i2, b.wx2-i2, wz1+i2*0.45, wz2-i2*0.45, t2, t3??b.h, base*0.92, t3===null, width, height, lw*0.9, depthT, b.h);
          if (t3 !== null)
            drawTier(b.wx1+i3, b.wx2-i3, wz1+i3*0.45, wz2-i3*0.45, t3, b.h,   base*0.82, true,      width, height, lw*0.8, depthT, b.h);
        } else {
          drawTier(b.wx1, b.wx2, wz1, wz2, 0, b.h, base, true, width, height, lw, depthT, b.h);
        }

        edge(b.wx1, 0, wz1, b.wx2, 0, wz1, base * EDGE_MUL.footFront, EDGE_LW.foot, width, height);
        edge(b.wx1, 0, wz1, b.wx1, 0, wz2, base * EDGE_MUL.footSide, EDGE_LW.foot, width, height);
        edge(b.wx2, 0, wz1, b.wx2, 0, wz2, base * EDGE_MUL.footSide, EDGE_LW.foot, width, height);

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
            fillFace([[rsx,b.h,rz1],[rsx,b.h,rz2],[rsx,b.h+r.h,rz2],[rsx,b.h+r.h,rz1]], fillOf(SIDE_RGB, 1), width, height);
            fillFace([[rx1,b.h,rz1],[rx2,b.h,rz1],[rx2,b.h+r.h,rz1],[rx1,b.h+r.h,rz1]], fillOf(FACE_RGB, 1), width, height);
            fillFace([[rx1,b.h+r.h,rz1],[rx2,b.h+r.h,rz1],[rx2,b.h+r.h,rz2],[rx1,b.h+r.h,rz2]], fillOf(ROOF_RGB, 1), width, height);
            edge(rx1, b.h, rz1, rx2, b.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h + r.h, rz1, rx2, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h, rz1, rx1, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx2, b.h, rz1, rx2, b.h + r.h, rz1, a, lw*0.6, width, height);
            edge(rx1, b.h + r.h, rz1, rx1, b.h + r.h, rz2, a*0.6, lw*0.5, width, height);
            edge(rx2, b.h + r.h, rz1, rx2, b.h + r.h, rz2, a*0.6, lw*0.5, width, height);
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

      // Street grid
      for (let row = 0; row < activeRows; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += maxView;
        if (wz + CAM_Z <= 8 || wz > maxView * 0.88) continue;
        const depthT = Math.max(0, Math.min(1, 1 - wz / (maxView * 0.78)));
        const alpha  = GRID_A_FAR + depthT * GRID_A_NEAR;
        for (let col = 0; col < activeCols - 1; col++) {
          const wx1 = col * CELL - halfW;
          edge(wx1, 0, wz, wx1+CELL, 0, wz, alpha, GRID_LW, width, height);
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
            LAMP_A_FAR + depthT * LAMP_A_NEAR, LAMP_LW, width, height);
        }
      }

      flushEdges();

      // ── Aircraft beacons ────────────────────────────────────────────────
      if (beacons.length) {
        for (let i = 0; i < beacons.length; i += 3) {
          ctx.fillStyle = fillOf(BEACON_RGB, beacons[i + 2]);
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

          const a = CRAFT_A_FAR + dT * CRAFT_A_NEAR;
          const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          g.addColorStop(0, fillOf(CRAFT_TAIL_RGB, 0));
          g.addColorStop(1, fillOf(CRAFT_HEAD_RGB, a));
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.5 + dT * 1.1;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(head.x, head.y);
          ctx.stroke();

          ctx.fillStyle = fillOf(CRAFT_DOT_RGB, Math.min(CRAFT_DOT_CAP, a * 1.6));
          ctx.beginPath();
          ctx.arc(head.x, head.y, 0.6 + dT * 1.1, 0, 6.283);
          ctx.fill();
        }
      }

      // ── Horizon haze ────────────────────────────────────────────────────
      // Last, so distant buildings dissolve into it. Near ones extend far
      // below the horizon and are barely touched.
      const hazeG = ctx.createLinearGradient(0, horizonY - height * 0.06, 0, horizonY + height * 0.30);
      hazeG.addColorStop(0,   fillOf(HAZE_RGB, HAZE_A_TOP));
      hazeG.addColorStop(0.4, fillOf(HAZE_RGB, HAZE_A_MID));
      hazeG.addColorStop(1,   fillOf(HAZE_RGB, 0));
      ctx.fillStyle = hazeG;
      ctx.fillRect(0, horizonY - height * 0.06, width, height * 0.36);

      // ── Depth of field ──────────────────────────────────────────────────
      // Same material a bloom pass would use — the finished frame, read back
      // small and blurred — but composited over instead of added, and only
      // across the top and bottom bands. The sharp strip in the middle is where
      // the buildings that matter sit; blurring the far horizon and the ground
      // underfoot is what makes this read as a model rather than a place.
      //
      // The bands are strips of rising alpha rather than a gradient mask.
      // Masking would need a second full-size canvas and a destination-in pass;
      // what lands here is already blurred, so the stepping between strips does
      // not survive to be seen.
      if (!lowPower) {
        smallCtx.clearRect(0, 0, small.width, small.height);
        smallCtx.drawImage(canvas, 0, 0, small.width, small.height);

        blurCtx.filter = "none";
        blurCtx.clearRect(0, 0, blurBuf.width, blurBuf.height);
        blurCtx.filter = `blur(${DOF_BLUR}px)`;
        blurCtx.drawImage(small, 0, 0);
        blurCtx.filter = "none";

        const sy = blurBuf.height / height;   // full-res y -> buffer y

        const band = (from: number, to: number, aFrom: number, aTo: number) => {
          const y0 = height * from;
          const h  = (height * to - y0) / DOF_STRIPS;
          for (let i = 0; i < DOF_STRIPS; i++) {
            const t = (i + 0.5) / DOF_STRIPS;
            ctx.globalAlpha = aFrom + (aTo - aFrom) * t;
            const dy = y0 + i * h;
            ctx.drawImage(
              blurBuf,
              0, dy * sy, blurBuf.width, h * sy,
              0, dy,      width,        h
            );
          }
          ctx.globalAlpha = 1;
        };

        band(0, DOF_SHARP_TOP, 1, 0);   // far: hardest at the horizon
        band(DOF_SHARP_BOT, 1, 0, 1);   // near: hardest underfoot
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
