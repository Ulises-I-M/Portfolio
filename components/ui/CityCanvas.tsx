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
/** World units per millisecond. Time-based, not per-frame: the low-power
 *  path caps at 30fps and a 120Hz display runs at double, and a per-frame step
 *  would scroll the city at half and twice the intended speed respectively. */
const SCROLL_SPEED = 0.20 / (1000 / 60);

// ─── Detail tuning ────────────────────────────────────────────────────────────
const CRAFT_N       = 12;
const PARTICLE_N    = 84;

// ─── Tuning ───────────────────────────────────────────────────────────────────
// Everything you would reach for to change how the city looks lives here. The
// values below are the only place any colour or opacity is written down; the
// drawing code reads from them and never hardcodes its own.
//
// The scene is a projection, not a place. Depth is the single dial that decides
// how much of a building actually gets projected: near the camera a volume is
// opaque, shaded and rimmed with light, and by the horizon that same volume is
// down to a few uprights, a scatter of dots and whatever the haze lends it.
// Every constant below is a stop along that ramp.

// ── Building bodies ──────────────────────────────────────────────────────────
// The top third of a building is genuinely opaque — it occludes whatever is
// behind it — and from there down the volume dissolves to nothing. At full
// opacity the faces can no longer be told apart by alpha, so the three shade by
// colour instead: the receding side darker, the roof catching more light.
// These carry no alpha of their own; the height ramp supplies it.
const FACE_RGB = "16,40,9";
const SIDE_RGB = "9,24,5";
const ROOF_RGB = "28,64,15";

/** All three converge on this with distance, so contrast drains along with
 *  opacity — a far building is one flat tone, not three shaded faces. */
const FAR_BODY_RGB = "13,32,13";

/** Opaque at or above HOLD (as a fraction of height), down to MIN at the base.
 *  Both ends move with depth: near buildings hold their body lower and keep a
 *  little of it at street level, far ones are opaque only at the very top. */
const FADE_HOLD_NEAR = 0.52;
const FADE_HOLD_FAR  = 0.78;
const FADE_MIN_NEAR  = 0.10;
const FADE_MIN_FAR   = 0.01;

/** Face opacity at the camera and at the horizon, and the curve between them.
 *  Above 1 the curve keeps the near half solid and drains the far half fast. */
const SOLID_NEAR  = 1.00;
const SOLID_FAR   = 0.045;
const SOLID_CURVE = 1.55;

/** Two buildings the same distance out should not render alike. This is the
 *  full width of the window a building's own integrity shifts it along the
 *  depth ramp — half of it either way — so a far block can still be fairly
 *  defined while its neighbour is already down to a luminous frame. */
const INTEGRITY_SPREAD = 0.46;

// ── Dissolve ─────────────────────────────────────────────────────────────────
// Past FRAG_START a wall stops being a single pane and becomes FRAG_BANDS
// stacked ones, of which some never get drawn: the projection is not resolving
// that part of the city. What is missing leaves marks behind — a dot at each
// end of the gap, sometimes a short run of line — rather than a clean hole.
// FRAG_SOFT is the width of the fade either side of the cut, so a band thins
// out over a few metres of travel instead of blinking off.
const FRAG_START  = 0.72;
const FRAG_MAX    = 0.76;
const FRAG_BANDS  = 6;
const FRAG_SOFT   = 0.16;
const FRAG_MARK_RGB = "120,190,60";
const FRAG_MARK_A   = 0.42;

/** Below this depth a building can lose its receding face and its roof
 *  outright, leaving uprights and a roof outline: volume gone, structure left. */
const VOL_MIN = 0.30;

/** Distance has to take lines away, not just dim them. Hundreds of far
 *  buildings each drawing their full complement of edges stack into a solid
 *  mat however faint each one is, and a mat is the opposite of dissolving. So
 *  a building sheds whole classes of line as it recedes: first its footprint on
 *  the ground, then everything on its far side, and by the horizon it is down
 *  to the two lit uprights and a roof run. */
const FOOT_MIN = 0.42;
const BACK_MIN = 0.34;

/** The topmost roof outline is the brightest line a building owns, which at
 *  distance is what welds the far city into that mat. Its multiplier and its
 *  ceiling both come down with depth. */
const ROOF_DEPTH_FLOOR = 0.40;

// ── Wireframe lines ──────────────────────────────────────────────────────────
const EDGE_RGB = "168,255,0";
/** Brightness by distance: FAR at the horizon, FAR+NEAR at the camera. Lines
 *  hold up better than bodies do — that is what leaves the far city reading as
 *  structure and light rather than as mass. */
const EDGE_A_FAR   = 0.055;
const EDGE_A_NEAR  = 0.44;
/** Above 1 this collapses the far half faster, so distance dissolves. */
const EDGE_A_CURVE = 1.70;
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
  column:     0.28,   // structural uprights
  floorFront: 0.24,   // floor lines on the lit face
  floorSide:  0.20,
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

// ── Rim glow ─────────────────────────────────────────────────────────────────
// Near buildings carry a second stroke under the first: the same silhouette,
// several times the width at a fraction of the alpha. Butt caps and all, at
// these widths it reads as light bleeding off an edge, not as a second line.
// It comes up only in the near band; the bloom pass covers the rest.
const RIM_START = 0.54;
const RIM_A     = 0.15;
const RIM_W     = 3.4;

// ── Data marks ───────────────────────────────────────────────────────────────
// Small groups of dots, stacked ticks and single lit runs on a third or so of
// the buildings. They are readouts, not windows: enough to say the city is a
// visualisation being driven by something, and no more than that.
const DATA_RGB    = "190,255,110";
const DATA_A_FAR  = 0.11;
const DATA_A_NEAR = 0.42;
/** Seconds-scale breathing on each mark, out of phase building to building. */
const DATA_PULSE_HZ = 0.00042;

/** The same slow breathing, applied to a building's own edge brightness. */
const GLOW_PULSE_HZ  = 0.00026;
const GLOW_PULSE_AMP = 0.16;

// ── Digital wireframe layer ──────────────────────────────────────────────────
// A second, sparser pass that only exists in the distance: dashed runs on a few
// planes that scroll with the city, and phantom boxes standing slightly proud
// of a scattering of far buildings. Solid geometry stays solid — this mixes in
// behind it, and near facades paint straight over it.
const WIRE_PLANES  = 3;
const WIRE_ROWS    = 4;
const WIRE_DASHES  = 15;
const WIRE_COLS    = 5;
const WIRE_TOP     = 150;
const WIRE_GRID_A  = 0.055;
const WIRE_BOX_A   = 0.085;
const WIRE_BOX_MAX = 0.46;   // depth above which phantom boxes stop appearing
const WIRE_BOX_PAD = 5;

// ── Ground ───────────────────────────────────────────────────────────────────
const GRID_A_FAR  = 0.010;
const GRID_A_NEAR = 0.048;
const GRID_LW     = 0.28;
const LAMP_A_FAR  = 0.06;
const LAMP_A_NEAR = 0.13;
const LAMP_LW     = 0.50;

// ── Emitter ──────────────────────────────────────────────────────────────────
// The surface the city is standing on, lit from within rather than washed by a
// sky. A flat gradient across the whole lower frame said "wet asphalt"; an
// ellipse pooled under the vanishing point says the light has a source and the
// city is sitting in it. Same squashed-ellipse construction as the horizon
// haze, and one gradient either way, so it costs nothing to prefer this one.
const EMIT_RGB    = "126,255,84";
const EMIT_A      = 0.095;
const EMIT_R      = 0.44;   // fraction of width
const EMIT_SQUASH = 0.40;
const EMIT_DROP   = 0.24;   // centre, as a fraction of height below the horizon

// ── Surface grid ─────────────────────────────────────────────────────────────
// A straight line in the world projects to a straight line on screen, so a
// ground rung is one segment however far it runs — the old code drew one per
// cell and paid twenty-one projections for a line that needed two.
// The longitudinal half did not exist at all, and without it the ground reads
// as a ladder rather than a surface. It is split in depth only so that alpha
// can follow the ramp, since one segment can carry only one alpha.
const GRID_Z_MUL   = 0.72;   // longitudinal lines against the lateral ones
const GRID_Z_STEPS = 6;
/** Every STREET_N-th line is a sector boundary and reads brighter. */
const SECTOR_MUL   = 3.2;

// ── Volume limits ────────────────────────────────────────────────────────────
// The projection has to end somewhere. Rather than letting the city run off the
// sides of the canvas — which reads as a window onto a world — it fades toward
// its own lateral edges and is bounded by a rail running the length of each
// side. The rails converge on the vanishing point, which is what makes the
// ground read as a surface with a far edge rather than as an open plain.
/** Where the lateral fade starts, as a fraction of the half-width, and what is
 *  left of a building at the very edge. */
const EDGE_HOLD = 0.58;
const EDGE_MIN  = 0.12;

// A rail is a border, not structure, so it sits in the 0.3-0.5 band the rest of
// the HUD reserves for borders rather than down with the grid. It also keeps a
// floor under its depth ramp: a boundary that dissolves is not a boundary.
const RAIL_OUT   = 0.5;    // how far outside the last column the rail sits, in cells
const RAIL_A     = 0.30;
const RAIL_A_MIN = 0.34;   // fraction of RAIL_A that survives at the far end
const RAIL_LW    = 0.55;
/** Posts along each rail, every STREET_N cells — the edge ticks of the HUD
 *  frames, stood up in the world. They are what actually reads at a glance;
 *  a bare line converging on the vanishing point does not. */
const POST_H     = 15;
const POST_A     = 1.5;    // multiple of the rail's alpha at that depth
/** Corner brackets echo the two-step stair of hudFrameGeometry's FRAME (C=20,
 *  S=8) rather than a plain L — the stair is the shape the rest of the HUD
 *  uses, and at this size it is the only part of it that survives. */
const BRACKET_ARM  = 1.15;   // in cells
const BRACKET_STEP = 0.42;   // in cells
const BRACKET_RISE = 46;     // world units the corner post climbs

/** A few sector cells lit at a time, cycling slowly. Never all of them: the
 *  whole look depends on selective accents over dark mass. */
const CELL_N       = 4;
const CELL_RGB     = "126,255,84";
const CELL_A       = 0.05;
const CELL_PERIOD  = 5200;   // ms a cell takes to rise and fall

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

// ── Motes ────────────────────────────────────────────────────────────────────
// Single pixels drifting upward through the city, brightest close in. Slow
// enough that they read as suspended rather than as rising.
const PART_RGB    = "168,255,0";
const PART_A_FAR  = 0.06;
const PART_A_NEAR = 0.40;
const PART_TOP    = 215;

// ── Scan sweeps ──────────────────────────────────────────────────────────────
// A plane at constant depth crossing the whole city, drawn as the horizontal
// line it projects to plus a soft wake behind it. Slow, additive, and gone for
// most of its own cycle.
const SCAN_RGB    = "168,255,0";
const SCAN_N      = 2;
const SCAN_PERIOD = 17000;   // ms for one pass, horizon to camera
const SCAN_A      = 0.085;
const SCAN_WAKE   = 26;      // px of falloff above the line
const SCAN_STRIPS = 7;       // strips the wake is built from, see below

// ── Tracking reticle ─────────────────────────────────────────────────────────
// One building at a time is framed, held, and then handed over to another. It
// is the single thing in the scene that says somebody is reading it rather than
// just looking at it, and it costs eight projections and a dozen segments.
// The bracket is the HUDCardFrame corner — arm, elbow dot — and the centre mark
// is the Crosshair's gapped cross, so the instrument belongs to the same kit as
// the rest of the HUD instead of being a new invention.
const TRK_ARM     = 14;      // px along each side of a corner
const TRK_GAP     = 6;       // px gap at the centre of the cross, as Crosshair
const TRK_CROSS   = 7;       // px arm of the centre cross
const TRK_PAD     = 7;       // px the frame stands off the silhouette
const TRK_A       = 0.72;
const TRK_LW      = 1.1;
const TRK_HOLD    = 4600;    // ms on one target
const TRK_TRAVEL  = 520;     // ms crossing to the next
/** Only lock onto something with enough presence to be worth framing. */
const TRK_MIN_PX  = 34;
const TRK_DEPTH_LO = 0.30;
const TRK_DEPTH_HI = 0.86;

// ── Re-render sweep ──────────────────────────────────────────────────────────
// A band that climbs the city in world height, brightening edges as it passes,
// as though that slice were being recomputed. A plane of constant world y does
// NOT project to a horizontal line on screen — screen y depends on wz as well —
// so this is a modulation of alpha by height, never a drawn line. That is what
// separates it from the depth sweep, which is a plane of constant z and does
// project to one line.
const SWEEP_PERIOD = 15000;  // ms between passes
const SWEEP_RISE   = 2600;   // ms to climb
const SWEEP_TOP    = 210;    // world units it climbs to
const SWEEP_BAND   = 26;     // world units of falloff either side
const SWEEP_A      = 1.5;    // peak multiplier on edge brightness

// ── Instability ──────────────────────────────────────────────────────────────
// Long waits, short bursts — the scheduling shape GlitchScanlines uses, in ms
// rather than frames now that the clock drives everything else too.
const GLITCH_GAP_MIN = 4200;
const GLITCH_GAP_VAR = 7000;
const GLITCH_MS      = 70;   // how long one burst lasts
const GLITCH_SHIFT   = 3;    // px of lateral judder
const GLITCH_TEAR    = 11;   // px a torn strip slides
const GLITCH_TEAR_H  = 30;   // px, the tallest a torn strip gets
const GLITCH_DROP    = 0.34; // what survives in a dropped depth band

// ── Horizon haze ─────────────────────────────────────────────────────────────
// Two layers. The dark one drains the far city of contrast; the green one is
// light put back, an ellipse of it around the vanishing point, so the distance
// dissolves into a lit field rather than into black.
const HAZE_RGB   = "6,10,6";
const HAZE_A_TOP = 0.70;
const HAZE_A_MID = 0.42;

const HOLO_RGB    = "126,255,84";
const HOLO_CORE_A = 0.13;    // at the vanishing point itself
const HOLO_BAND_A = 0.020;   // along the rest of the horizon line
const HOLO_SQUASH = 0.38;    // how flat the ellipse of light is

// ── On the absence of a bloom pass ───────────────────────────────────────────
// There is deliberately none. An additive pass over the frame was tried twice
// and rejected twice: once for costing more than the depth-of-field that
// replaced it, and once again here, where it also had to stop at the near band
// and left a visible step in the alpha where it did. The light it was adding is
// supplied instead by things that are already being drawn — the emitter pool
// under the city, the rim on the near silhouettes, and the ellipse of haze on
// the vanishing point — none of which cost a full-width composite.

// ── Derived ──────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const heightFade = (y: number, total: number, hold: number, min: number) => {
  if (total <= 0) return 1;
  const t = y / total;
  if (t >= hold) return 1;
  return min + (t / hold) * (1 - min);
};

const fillOf = (rgb: string, a: number) => `rgba(${rgb},${Math.min(1, a).toFixed(3)})`;

/** Body tones are mixed toward FAR_BODY_RGB by depth. Mixing per building per
 *  frame would build a few hundred throwaway strings a frame, so each tone is
 *  pre-rolled into a short ramp and looked up by quantised depth instead. */
const RAMP_STEPS = 10;
const mixRgb = (a: string, b: string, t: number) => {
  const A = a.split(",");
  const B = b.split(",");
  return A.map((v, i) => Math.round(+v + (+B[i] - +v) * t)).join(",");
};
const mkRamp = (near: string, far: string) =>
  Array.from({ length: RAMP_STEPS + 1 }, (_, i) => mixRgb(near, far, 1 - i / RAMP_STEPS));
const FACE_RAMP = mkRamp(FACE_RGB, FAR_BODY_RGB);
const SIDE_RAMP = mkRamp(SIDE_RGB, FAR_BODY_RGB);
const ROOF_RAMP = mkRamp(ROOF_RGB, FAR_BODY_RGB);

/** Stable, cheap, and repeatable across frames: which bands of which wall a
 *  building drops has to be a property of the building, not of the frame. */
const hash3 = (a: number, b: number, c: number) => {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177)) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

/** Quantisation the ink batcher buckets on: 0.005 alpha steps, 0.05 width
 *  steps, quarter-pixel dot radii. Finer than the eye can separate at these
 *  values, and it collapses the many near-identical shades a building carries
 *  into one stroke each. Named because the batching and the flush have to
 *  agree on them. */
const A_STEPS = 200;
const W_STEPS = 20;
const R_STEPS = 4;

/** Steps a vertical edge is split into so it can follow the ramp. */
const V_FADE_STEPS = 5;

/** Below this a face is indistinguishable from the backdrop, so it is skipped
 *  rather than filled. Dissolving walls put a great many near-nothing bands on
 *  screen and each one still costs a path and a fill. */
const FACE_CUTOFF = 0.030;

// ─── Depth of field ───────────────────────────────────────────────────────────
const DOF_BLUR      = 4;     // px at the reduced scale
const DOF_STRIPS    = 10;    // per band; enough that the ramp reads continuous
const DOF_SHARP_TOP = 0.40;  // fraction of height where the sharp strip begins
const DOF_SHARP_BOT = 0.74;  // and where it ends
const DOF_A_TOP     = 0.90;  // held below 1 so the far city survives the blur

/** Where the city stops, as a fraction of its own depth. The depth ramp and the
 *  visibility filter both read it and they have to agree: the ramp normalises
 *  against this plane, so if the filter kept buildings past it their depth would
 *  clamp at 0 and they would render as horizon while still being visibly large. */
const CULL_Z = 0.72;

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

/** 0 dot column, 1 stacked ticks, 2 a single lit run */
interface DataMark { kind: 0 | 1 | 2; u: number; v: number; n: number; len: number; ph: number }

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
  /** Stable index, so a building drops the same bands every frame */
  seed: number;
  /** How well this one resolves, independent of where it stands */
  integrity: number;
  /** Carries a phantom wireframe once it is far enough out */
  wire: boolean;
  /** Phase of this building's own glow breathing */
  glowPh: number;
  data: DataMark | null;
}

/** Everything depth decides about one building, rebuilt in place each frame. */
interface Depth {
  t: number;        // raw, 1 at the camera and 0 at the horizon
  tb: number;       // the same, shifted by the building's own integrity
  solid: number;    // multiplier on every face alpha
  frag: number;     // fraction of wall bands that never get drawn
  hold: number;     // height fraction above which the body is opaque
  min: number;      // what is left of the body at street level
  rim: number;      // 0 until the near band, then up to 1
  lat: number;      // lateral fade toward the edges of the projection
  volume: boolean;  // false once the receding face and roof are gone
  foot: boolean;    // footprint on the ground
  back: boolean;    // anything on the far side of the building
  detail: boolean;  // columns and floor lines
  face: string; side: string; roof: string;
  seed: number;
  /** The tier being drawn, folded into the seed. Without it every tier of a
   *  tower hashes identically and drops the same bands at the same relative
   *  heights, which reads as a repeating pattern climbing the building. */
  tseed: number;
  pulse: number;    // slow multiplier on edge brightness
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
  const halfSpan     = ((cols - 1) * CELL) / 2;
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

      // A readout on roughly a third of them, placed on the lit face
      let data: DataMark | null = null;
      if (rng() > 0.64) {
        const k = rng();
        data = {
          kind: k < 0.46 ? 0 : k < 0.78 ? 1 : 2,
          u:    0.16 + rng() * 0.66,
          v:    0.24 + rng() * 0.52,
          n:    3 + Math.floor(rng() * 4),
          len:  0.10 + rng() * 0.18,
          ph:   rng(),
        };
      }

      const b: Building = {
        wx1: col * CELL + padX1 - halfSpan,
        wx2: (col + 1) * CELL - padX2 - halfSpan,
        wz1: row * CELL + padZ1,
        wz2: (row + 1) * CELL - padZ2,
        h, district, type,
        tier2H, tier3H, ins2, ins3,
        hasTower: type === "tower" && h > 118 && rng() > 0.38,
        hasHelip: type === "block" && h > 44   && rng() > 0.52,
        phase: rng(),
        roof,
        sky: null,
        seed: out.length + 1,
        integrity: rng(),
        wire: rng() > 0.62,
        glowPh: rng(),
        data,
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
    // A strip has to be lifted out before it can be put back somewhere else:
    // drawing the canvas onto itself only ever adds a second copy, and on a
    // transparent canvas a second copy of near-transparent pixels is nothing.
    const tearBuf  = document.createElement("canvas");
    const tearCtx  = tearBuf.getContext("2d");
    if (!smallCtx || !blurCtx || !tearCtx) return;

    // ── Grid dimensions based on device capability ──────────────────────────
    const activeRows = lowPower ? LP_ROWS : ROWS;
    const activeCols = lowPower ? LP_COLS : COLS;
    const maxView    = activeRows * CELL;
    const citySpan   = activeCols * CELL;
    const halfSpan   = ((activeCols - 1) * CELL) / 2;
    const nSecX      = Math.max(1, Math.floor(activeCols / STREET_N));
    const nSecZ      = Math.max(1, Math.floor(activeRows / STREET_N));

    // ── Depth as the eye reads it ───────────────────────────────────────────
    // Ramping on world distance spends four fifths of the ramp on the near
    // quarter of the city, because that is what perspective does to a ground
    // plane: everything from a third of the way back to the horizon lands in
    // the same handful of pixels. Dissolving on that ramp would put the whole
    // transition into a band too thin to see. Ramping on projected scale
    // instead spreads it across the screen the way it looks like it should.
    // The root softens the result, which is otherwise so steep that a building
    // two blocks back would already be half gone.
    const S_NEAR = FOV / CAM_Z;
    const S_FAR  = FOV / (maxView * CULL_Z + CAM_Z);
    const S_SPAN = S_NEAR - S_FAR;
    const depthAt = (wz: number) =>
      Math.pow(clamp01((FOV / (wz + CAM_Z) - S_FAR) / S_SPAN), 0.55);
    // FPS cap: 30fps on low-power, uncapped otherwise
    const fpsInterval = lowPower ? 1000 / 30 : 0;

    let rafId: number;
    let offset  = 0;
    let lastT   = 0;
    let prevT   = 0;   // previous frame's timestamp, for the scroll step
    let frameT  = 0;   // ms, shared by the beacons, the traffic and every pulse
    let city: Building[] = [];
    // Scratch for the per-frame visible set, sized once in rebuild()
    let visB: Building[] = [];
    let visZ = new Float64Array(0);
    let visN = 0;
    const trkFromScratch = new Float64Array(4);
    let scrollModRef = 0;

    // Reticle: the building being framed, when the lock expires, and the box it
    // is travelling from so a hand-over reads as a move rather than a jump.
    let trkB: Building | null = null;
    let trkUntil = 0;
    let trkT0 = -1e9;
    const trkFrom = new Float64Array(4);
    const trkShown = new Float64Array(4);

    // Instability: one burst at a time, with a long wait behind it
    let glitchAt = 3000;
    let glitchEnd = 0;
    let glitchKind = 0;
    let glitchShift = 0;
    let glitchTearY = 0;
    let glitchTearH = 0;
    let glitchTearX = 0;
    let glitchDropLo = 0;
    let glitchDropHi = 0;

    // Sweep: -1 when idle, otherwise the world height the band is passing
    let sweepY = -1;
    let craft: { x: number; z: number; y: number; vx: number; len: number }[] = [];
    let motes: { x: number; y: number; z: number; vy: number; ph: number }[] = [];

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      small.width    = Math.max(1, Math.round(canvas.width  / BLUR_DIV));
      small.height   = Math.max(1, Math.round(canvas.height / BLUR_DIV));
      blurBuf.width  = small.width;
      blurBuf.height = small.height;
      tearBuf.width  = canvas.width;
      tearBuf.height = GLITCH_TEAR_H;
      city = buildCity(mkRng(canvas.width * 7 + canvas.height * 13), activeRows, activeCols);
      visB = new Array(city.length);
      visZ = new Float64Array(city.length);
      visN = 0;

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

      // Motes — the same wrapping trick as the buildings, so they hold their
      // place in the city rather than drifting across a flat field
      const pr = mkRng(canvas.width * 53 + 91);
      motes = Array.from({ length: lowPower ? 0 : PARTICLE_N }, () => ({
        x:  (pr() * 2 - 1) * (citySpan / 2),
        y:  8 + pr() * PART_TOP,
        z:  pr() * maxView,
        vy: 0.05 + pr() * 0.16,
        ph: pr(),
      }));
    };

    // Projects its four corners inline rather than through project(): a
    // dissolving wall calls this once per band, and the array-of-tuples version
    // it replaces allocated six arrays and four point objects every time.
    const fillQuad = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      cx: number, cy: number, cz: number,
      dx: number, dy: number, dz: number,
      style: string | CanvasGradient, W: number, H: number
    ) => {
      const da = az + CAM_Z, db = bz + CAM_Z, dc = cz + CAM_Z, dd = dz + CAM_Z;
      if (da <= 0 || db <= 0 || dc <= 0 || dd <= 0) return;
      const hx = W / 2, hy = H * HORIZON_Y;
      const sa = FOV / da, sb = FOV / db, sc = FOV / dc, sd = FOV / dd;
      ctx.beginPath();
      ctx.moveTo(hx + ax * sa, hy + (CAM_Y - ay) * sa);
      ctx.lineTo(hx + bx * sb, hy + (CAM_Y - by) * sb);
      ctx.lineTo(hx + cx * sc, hy + (CAM_Y - cy) * sc);
      ctx.lineTo(hx + dx * sd, hy + (CAM_Y - dy) * sd);
      ctx.closePath();
      ctx.fillStyle = style;
      ctx.fill();
    };

    // ── Batched ink ──────────────────────────────────────────────────────────
    // Previously every segment did its own beginPath/stroke: at ~500 buildings
    // by ~26 segments that was upwards of 13k stroke calls a frame, and the
    // scene only managed 43fps before any of the detail below existed.
    // Segments now accumulate into buckets keyed by quantised colour, alpha and
    // width, and each bucket strokes as a single path. Dots ride the same
    // scheme — they arrive in the hundreds now that dissolving walls leave them
    // behind — as square marks, which are cheaper than arcs and read as pixels
    // of a projection rather than as lamps.
    //
    // Buckets are flushed in depth bands rather than once at the end: buildings
    // are painted back-to-front over near-opaque fills, so deferring every mark
    // to the end would let distant ones draw over near facades.
    const INK = [EDGE_RGB, DATA_RGB, FRAG_MARK_RGB, PART_RGB] as const;
    const segs = new Map<number, number[]>();
    const dots = new Map<number, number[]>();

    const edge = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      alpha: number, lw: number, W: number, H: number, ci = 0
    ) => {
      if (alpha < 0.006) return;            // below visibility — never shows
      const p1 = project(ax, ay, az, W, H);
      const p2 = project(bx, by, bz, W, H);
      if (!p1 || !p2) return;
      const qa = Math.min(255, Math.round(alpha * A_STEPS));
      const ql = Math.min(255, Math.round(lw * W_STEPS));
      const key = (ci << 16) | (qa << 8) | ql;
      let arr = segs.get(key);
      if (!arr) { arr = []; segs.set(key, arr); }
      arr.push(p1.x, p1.y, p2.x, p2.y);
    };

    /** Same batching as edge(), for marks that live on the glass rather than in
     *  the world — the reticle is an instrument reading the projection, not a
     *  thing standing inside it. */
    const sEdge = (
      x1: number, y1: number, x2: number, y2: number,
      alpha: number, lw: number, ci = 0
    ) => {
      if (alpha < 0.006) return;
      const qa = Math.min(255, Math.round(alpha * A_STEPS));
      const ql = Math.min(255, Math.round(lw * W_STEPS));
      const key = (ci << 16) | (qa << 8) | ql;
      let arr = segs.get(key);
      if (!arr) { arr = []; segs.set(key, arr); }
      arr.push(x1, y1, x2, y2);
    };

    const dot = (x: number, y: number, r: number, alpha: number, ci = 0) => {
      if (alpha < 0.01) return;
      const qa = Math.min(255, Math.round(alpha * A_STEPS));
      const qr = Math.max(1, Math.min(15, Math.round(r * R_STEPS)));
      const key = (ci << 12) | (qa << 4) | qr;
      let arr = dots.get(key);
      if (!arr) { arr = []; dots.set(key, arr); }
      arr.push(x, y);
    };

    // Flat [x, y, alpha, ...] gathered during the building pass
    const beacons: number[] = [];

    const flushInk = () => {
      for (const [key, arr] of segs) {
        if (arr.length === 0) continue;
        ctx.lineWidth   = (key & 255) / W_STEPS;
        ctx.strokeStyle = `rgba(${INK[key >>> 16]},${(((key >> 8) & 255) / A_STEPS).toFixed(4)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 4) {
          ctx.moveTo(arr[i], arr[i + 1]);
          ctx.lineTo(arr[i + 2], arr[i + 3]);
        }
        ctx.stroke();
        arr.length = 0;                     // reuse the array, avoid GC churn
      }
      for (const [key, arr] of dots) {
        if (arr.length === 0) continue;
        const r = (key & 15) / R_STEPS;
        ctx.fillStyle = `rgba(${INK[key >>> 12]},${(((key >> 4) & 255) / A_STEPS).toFixed(4)})`;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 2) ctx.rect(arr[i] - r, arr[i + 1] - r, r * 2, r * 2);
        ctx.fill();
        arr.length = 0;
      }
    };

    // ── Depth ────────────────────────────────────────────────────────────────
    // One object, rewritten per building rather than allocated per building:
    // at ~500 visible a frame the garbage would outweigh the work.
    const dep: Depth = {
      t: 0, tb: 0, solid: 1, frag: 0, hold: FADE_HOLD_NEAR, min: FADE_MIN_NEAR,
      rim: 0, lat: 1, volume: true, foot: true, back: true, detail: false,
      face: FACE_RGB, side: SIDE_RGB, roof: ROOF_RGB, seed: 0, tseed: 0, pulse: 1,
    };

    /** 1 across the middle of the city, easing to EDGE_MIN at its lateral edge. */
    const lateral = (cx: number) => {
      const u = Math.abs(cx) / halfSpan;
      if (u <= EDGE_HOLD) return 1;
      const k = (u - EDGE_HOLD) / (1 - EDGE_HOLD);
      const e = k * k * (3 - 2 * k);          // smoothstep
      return 1 - e * (1 - EDGE_MIN);
    };

    /** Edge brightness multiplier for a given world height while the re-render
     *  band is passing through it. Returns 1 — and costs one compare — for the
     *  four fifths of the cycle when nothing is sweeping. */
    const sweepAt = (wy: number) => {
      if (sweepY < 0) return 1;
      const d = Math.abs(wy - sweepY);
      if (d >= SWEEP_BAND) return 1;
      const k = 1 - d / SWEEP_BAND;
      return 1 + SWEEP_A * k * k;
    };

    const setDepth = (wz: number, b: Building) => {
      const t  = depthAt(wz);
      // The building's own integrity slides it along the ramp, so distance sets
      // the trend and not every neighbour resolves to the same degree
      const tb = clamp01(t + (b.integrity - 0.5) * INTEGRITY_SPREAD);
      const qi = Math.round(tb * RAMP_STEPS);

      dep.t      = t;
      dep.tb     = tb;
      dep.seed   = b.seed;
      dep.tseed  = b.seed;
      dep.solid  = SOLID_FAR + Math.pow(tb, SOLID_CURVE) * (SOLID_NEAR - SOLID_FAR);
      dep.frag   = tb >= FRAG_START ? 0 : FRAG_MAX * Math.pow((FRAG_START - tb) / FRAG_START, 0.70);
      dep.hold   = mix(FADE_HOLD_FAR, FADE_HOLD_NEAR, tb);
      dep.min    = mix(FADE_MIN_FAR,  FADE_MIN_NEAR,  tb);
      dep.rim    = clamp01((tb - RIM_START) / (1 - RIM_START));
      dep.lat    = lateral((b.wx1 + b.wx2) / 2);
      dep.solid *= dep.lat;
      // Losing the receding face is what takes the last of the volume away, so
      // only the least intact of the far buildings ever do
      dep.volume = tb > VOL_MIN || b.integrity > 0.45;
      dep.foot   = tb > FOOT_MIN;
      dep.back   = tb > BACK_MIN;
      dep.detail = !lowPower && tb > 0.52;
      dep.face   = FACE_RAMP[qi];
      dep.side   = SIDE_RAMP[qi];
      dep.roof   = ROOF_RAMP[qi];
      dep.pulse  = 1 + GLOW_PULSE_AMP * Math.sin(frameT * GLOW_PULSE_HZ + b.glowPh * TAU);
    };

    // ── Walls ────────────────────────────────────────────────────────────────
    // Up close a wall is one quad carrying a gradient down its own height. Once
    // the projection starts failing it becomes a stack of bands, of which the
    // ones this building's hash puts under the dissolve threshold are never
    // drawn — leaving a dot at each end and, now and then, a stub of line where
    // the wall used to be.
    const fillWall = (
      ax: number, az: number, bx: number, bz: number,
      yBase: number, yTop: number, rgb: string,
      total: number, salt: number, lw: number, W: number, H: number
    ) => {
      if (heightFade(yTop, total, dep.hold, dep.min) * dep.solid < FACE_CUTOFF) return;

      if (dep.frag < 0.03) {
        const pT = project(ax, yTop,  az, W, H);
        const pB = project(ax, yBase, az, W, H);
        let style: string | CanvasGradient;
        if (!pT || !pB || Math.abs(pB.y - pT.y) < 1) {
          style = fillOf(rgb, heightFade(yTop, total, dep.hold, dep.min) * dep.solid);
        } else {
          const g = ctx.createLinearGradient(0, pT.y, 0, pB.y);
          for (let i = 0; i <= 4; i++) {
            const p  = i / 4;
            const wy = yTop - p * (yTop - yBase);
            g.addColorStop(p, fillOf(rgb, heightFade(wy, total, dep.hold, dep.min) * dep.solid));
          }
          style = g;
        }
        fillQuad(ax, yBase, az, bx, yBase, bz, bx, yTop, bz, ax, yTop, az, style, W, H);
        return;
      }

      const span = yTop - yBase;
      const markA = FRAG_MARK_A * (0.3 + dep.tb);
      for (let i = 0; i < FRAG_BANDS; i++) {
        const y0 = yBase + span * (i / FRAG_BANDS);
        const y1 = yBase + span * ((i + 1) / FRAG_BANDS);
        const ym = (y0 + y1) / 2;
        const hv = hash3(dep.tseed, salt, i);
        const k  = (hv - dep.frag) / FRAG_SOFT;

        if (k <= 0) {
          // Nothing rendered here. What is left is the readout of a wall.
          const h2 = hash3(dep.tseed, salt + 40, i);
          if (h2 > 0.28) {
            const pa = project(ax + (bx - ax) * 0.18, ym, az + (bz - az) * 0.18, W, H);
            const pb = project(ax + (bx - ax) * 0.78, ym, az + (bz - az) * 0.78, W, H);
            if (pa) dot(pa.x, pa.y, 0.5 + dep.tb * 0.6, markA, 2);
            if (pb) dot(pb.x, pb.y, 0.5 + dep.tb * 0.6, markA * 0.7, 2);
          }
          if (h2 > 0.74) {
            edge(ax + (bx - ax) * 0.30, ym, az + (bz - az) * 0.30,
                 ax + (bx - ax) * 0.64, ym, az + (bz - az) * 0.64,
                 markA * 0.8, lw * 0.45, W, H, 2);
          }
          continue;
        }

        // A band on the way out thins rather than blinks: at these sizes the
        // flat alpha per band is indistinguishable from a gradient, and cheaper
        const a = heightFade(ym, total, dep.hold, dep.min) * dep.solid * Math.min(1, k);
        if (a < FACE_CUTOFF) continue;
        fillQuad(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y1, az, fillOf(rgb, a), W, H);
      }
    };

    const drawTier = (
      wx1: number, wx2: number, wz1: number, wz2: number,
      yBase: number, yTop: number,
      base: number, isTopTier: boolean,
      W: number, H: number, lw: number,
      total: number, tier: number
    ) => {
      dep.tseed = dep.seed + tier * 7919;
      const rf = ROOF_DEPTH_FLOOR + (1 - ROOF_DEPTH_FLOOR) * dep.tb;
      const roofA = isTopTier
        ? Math.min(base * EDGE_MUL.roofTop * rf, ROOF_CAP * rf)
        : base * EDGE_MUL.roofOther;
      const wallA = base * EDGE_MUL.vertFront;
      const sideA = base * EDGE_MUL.vertSide;
      const bh = yTop - yBase;
      const bw = wx2 - wx1;
      const fine = dep.tb > 0.35;
      const vSteps = fine ? V_FADE_STEPS : 3;

      const sideX = (wx1 + wx2) / 2 > 0 ? wx1 : wx2;

      // Vertical faces fade downward rather than carrying a flat alpha, so each
      // volume reads as a projection losing coherence toward its base instead
      // of as an evenly tinted pane of glass. How far down the body holds, and
      // how much of it survives at street level, both move with depth.
      if (dep.volume) fillWall(sideX, wz1, sideX, wz2, yBase, yTop, dep.side, total, 1, lw, W, H);
      fillWall(wx1, wz1, wx2, wz1, yBase, yTop, dep.face, total, 2, lw, W, H);
      if (dep.volume) {
        fillQuad(
          wx1, yTop, wz1, wx2, yTop, wz1, wx2, yTop, wz2, wx1, yTop, wz2,
          fillOf(dep.roof, heightFade(yTop, total, dep.hold, dep.min) * dep.solid * (1 - dep.frag * 0.5)),
          W, H,
        );
      }

      // A vertical edge has to fade along its own length, but the batcher groups
      // segments by quantised alpha and strokes each group as one path — a
      // gradient stroke would force one path per edge and undo that. Splitting
      // the run into steps keeps every piece inside the batch.
      // Once the building is dissolving the run breaks up as well: the pieces
      // this building's hash puts under the threshold are never stroked, and
      // some leave a dot where the upright used to carry on. This is most of
      // what actually reads as a far building coming apart — the bodies are
      // too faint out there for anyone to miss them.
      const vEdge = (x: number, z: number, alpha: number, lwv: number, salt = 0, steps = vSteps) => {
        const frag = dep.frag * 0.8;
        for (let i = 0; i < steps; i++) {
          const a0 = yBase + (yTop - yBase) * (i / steps);
          const a1 = yBase + (yTop - yBase) * ((i + 1) / steps);
          const am = (a0 + a1) / 2;
          const fade = heightFade(am, total, dep.hold, dep.min) * sweepAt(am);
          if (frag > 0.03) {
            const hv = hash3(dep.tseed, salt + 60, i);
            if (hv < frag) {
              if (hv > frag * 0.5) {
                const pm = project(x, am, z, W, H);
                if (pm) dot(pm.x, pm.y, 0.5 + dep.tb * 0.5, alpha * fade * 2.2, 2);
              }
              continue;
            }
          }
          edge(x, a0, z, x, a1, z, alpha * fade, lwv, W, H);
        }
      };

      // Rim light, near band only: the silhouette again, wide and faint, under
      // the sharp line. Only the four uprights and the front roof run — a halo
      // on every floor line would just be a fog.
      if (dep.rim > 0.02) {
        const ra = wallA * RIM_A * dep.rim;
        const rw = lw * RIM_W;
        // Same salt and the same step count as the sharp uprights below, so a
        // halo can never survive where the line it belongs to was dropped.
        vEdge(wx1, wz1, ra, rw, 1);
        vEdge(wx2, wz1, ra, rw, 2);
        edge(wx1, yTop, wz1, wx2, yTop, wz1,
          roofA * RIM_A * 1.6 * dep.rim * heightFade(yTop, total, dep.hold, dep.min), rw, W, H);
      }

      // Horizontal runs have to break up the same way, and they matter more:
      // a roof outline is the brightest line a building owns, and a rank of
      // unbroken bright rectangles is exactly what stops a far city dissolving
      // however faint each rectangle is.
      const hEdge = (
        x1: number, z1: number, x2: number, z2: number, y: number,
        alpha: number, lwv: number, salt: number
      ) => {
        const frag = dep.frag * 0.85;
        alpha *= sweepAt(y);
        if (frag < 0.03) { edge(x1, y, z1, x2, y, z2, alpha, lwv, W, H); return; }
        const N = fine ? 4 : 2;
        for (let i = 0; i < N; i++) {
          const hv = hash3(dep.tseed, salt + 90, i);
          const u0 = i / N, u1 = (i + 1) / N;
          if (hv < frag) {
            if (hv > frag * 0.55) {
              const um = (u0 + u1) / 2;
              const pm = project(x1 + (x2 - x1) * um, y, z1 + (z2 - z1) * um, W, H);
              if (pm) dot(pm.x, pm.y, 0.5 + dep.tb * 0.5, alpha * 2, 2);
            }
            continue;
          }
          edge(x1 + (x2 - x1) * u0, y, z1 + (z2 - z1) * u0,
               x1 + (x2 - x1) * u1, y, z1 + (z2 - z1) * u1, alpha, lwv, W, H);
        }
      };

      vEdge(wx1, wz1, wallA, lw, 1);
      vEdge(wx2, wz1, wallA, lw, 2);
      if (dep.back) {
        vEdge(wx1, wz2, sideA, lw, 3);
        vEdge(wx2, wz2, sideA, lw, 4);
      }

      // Horizontal runs sit at one height, so they just sample the ramp there
      const fTop = heightFade(yTop, total, dep.hold, dep.min);
      hEdge(wx1, wz1, wx2, wz1, yTop, roofA * fTop, lw, 1);
      if (dep.back) {
        hEdge(wx1, wz2, wx2, wz2, yTop, roofA * EDGE_MUL.roofBack * fTop, lw, 2);
        hEdge(wx1, wz1, wx1, wz2, yTop, roofA * EDGE_MUL.roofBack * fTop, lw, 3);
        hEdge(wx2, wz1, wx2, wz2, yTop, roofA * EDGE_MUL.roofBack * fTop, lw, 4);
      }

      if (yBase > 0 && dep.foot) {
        const fBase = heightFade(yBase, total, dep.hold, dep.min);
        hEdge(wx1, wz1, wx2, wz1, yBase, wallA * EDGE_MUL.baseFront * fBase, lw * EDGE_LW.base, 5);
        if (dep.back) {
          hEdge(wx1, wz1, wx1, wz2, yBase, sideA * EDGE_MUL.baseSide * fBase, lw * EDGE_LW.base, 6);
          hEdge(wx2, wz1, wx2, wz2, yBase, sideA * EDGE_MUL.baseSide * fBase, lw * EDGE_LW.base, 7);
        }
      }

      // ── Detail geometry ────────────────────────────────────────────────────
      // Gated on depth as well as capability: past the near band the depth blur
      // dissolves these lines entirely, so drawing them there is work the
      // next pass destroys.
      if (dep.detail) {
        // Structural columns on front face
        const nV = Math.max(1, Math.round(bw / 14));
        for (let v = 1; v < nV; v++)
          vEdge(wx1 + bw*(v/nV), wz1, wallA * EDGE_MUL.column, lw * EDGE_LW.column, 10 + v);

        // Floor lines — front face
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 16));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx2, fy, wz1, wallA * EDGE_MUL.floorFront * heightFade(fy, total, dep.hold, dep.min), lw * EDGE_LW.floorFront, W, H);
          }
        }
        // Floor lines — left side
        if (bh > 12) {
          const nF = Math.max(1, Math.round(bh / 20));
          for (let f = 1; f < nF; f++) {
            const fy = yBase + bh*(f/nF);
            edge(wx1, fy, wz1, wx1, fy, wz2, sideA * EDGE_MUL.floorSide * heightFade(fy, total, dep.hold, dep.min), lw * EDGE_LW.floorSide, W, H);
          }
        }
      }
    };

    // ── Readouts ─────────────────────────────────────────────────────────────
    // Placed on the lit face in world space, so they scale and scroll with the
    // building carrying them. Each breathes on its own phase, which is most of
    // what keeps the far city from reading as a still.
    const drawData = (b: Building, wz1: number, W: number, H: number) => {
      const m = b.data;
      if (!m) return;
      const pulse = 0.55 + 0.45 * Math.sin(frameT * DATA_PULSE_HZ + m.ph * TAU);
      const a = (DATA_A_FAR + dep.tb * (DATA_A_NEAR - DATA_A_FAR)) * pulse;
      if (a < 0.02) return;

      const bw = b.wx2 - b.wx1;
      const x0 = b.wx1 + bw * m.u;
      const y0 = b.h * m.v;
      const r  = 0.5 + dep.tb * 0.7;

      if (m.kind === 0) {
        const step = b.h * 0.055;
        for (let i = 0; i < m.n; i++) {
          const p = project(x0, y0 + i * step, wz1, W, H);
          if (p) dot(p.x, p.y, r, i === 0 ? a : a * 0.7, 1);
        }
      } else if (m.kind === 1) {
        const step = b.h * 0.05;
        for (let i = 0; i < m.n; i++) {
          const y = y0 + i * step;
          edge(x0, y, wz1, x0 + bw * m.len, y, wz1, a * 0.75, 0.5, W, H, 1);
        }
      } else {
        edge(x0, y0, wz1, x0, y0 + b.h * m.len * 1.8, wz1, a, 0.65, W, H, 1);
        const p = project(x0, y0 + b.h * m.len * 1.8, wz1, W, H);
        if (p) dot(p.x, p.y, r, a, 1);
      }
    };

    // ── Digital wireframe layer ──────────────────────────────────────────────
    // Drawn before the buildings and flushed straight away, so solid facades
    // paint over it and only the far half of the city — where the bodies are
    // barely there — lets it through.
    const drawWireLayer = (scrollMod: number, W: number, H: number) => {
      for (let k = 0; k < WIRE_PLANES; k++) {
        let wz = (k * maxView) / WIRE_PLANES - scrollMod;
        wz = ((wz % maxView) + maxView) % maxView;
        const lo = maxView * 0.38;
        const hi = maxView * 0.80;
        if (wz < lo || wz > hi) continue;

        // Full brightness mid-window, nothing at either end, so a plane never
        // arrives or leaves on a hard edge
        const fade = Math.sin(((wz - lo) / (hi - lo)) * Math.PI);
        const a    = WIRE_GRID_A * fade;
        if (a < 0.006) continue;

        const dashW = citySpan / WIRE_DASHES;
        for (let r = 0; r < WIRE_ROWS; r++) {
          const y = 14 + ((WIRE_TOP - 14) * r) / (WIRE_ROWS - 1);
          const ra = a * (1 - r / (WIRE_ROWS + 1));
          for (let d = 0; d < WIRE_DASHES; d++) {
            if (hash3(k + 1, r + 1, d) < 0.34) continue;   // an incomplete grid
            const x0 = -citySpan / 2 + d * dashW;
            edge(x0, y, wz, x0 + dashW * 0.55, y, wz, ra, 0.4, W, H);
          }
        }
        for (let c = 0; c < WIRE_COLS; c++) {
          const x = -citySpan / 2 + (citySpan * c) / (WIRE_COLS - 1);
          for (let s = 0; s < 3; s++) {
            if (hash3(k + 7, c + 1, s) < 0.3) continue;
            const y0 = (WIRE_TOP * s) / 3;
            edge(x, y0, wz, x, y0 + WIRE_TOP * 0.22, wz, a * 0.8, 0.4, W, H);
          }
        }
      }
    };

    // ── Tracking reticle ─────────────────────────────────────────────────────
    /** Screen-space bounds of a building's whole silhouette. Eight corners is
     *  all a box has, and only one building is ever measured per frame. Writes
     *  into `out` and returns false if any corner is behind the camera. */
    const silhouette = (b: Building, wz: number, W: number, H: number, out: Float64Array) => {
      const z2 = wz + (b.wz2 - b.wz1);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        const p = project(
          i & 1 ? b.wx2 : b.wx1,
          i & 2 ? b.h : 0,
          i & 4 ? z2 : wz, W, H,
        );
        if (!p) return false;
        if (p.x < x0) x0 = p.x;
        if (p.y < y0) y0 = p.y;
        if (p.x > x1) x1 = p.x;
        if (p.y > y1) y1 = p.y;
      }
      out[0] = x0; out[1] = y0; out[2] = x1; out[3] = y1;
      return true;
    };

    /** The corner of a HUD frame: two arms meeting at an elbow, with a dot on
     *  the elbow. `sx`/`sy` are ±1 for which way the arms run. */
    const bracket = (x: number, y: number, sx: number, sy: number, a: number) => {
      sEdge(x, y, x + sx * TRK_ARM, y, a, TRK_LW, 1);
      sEdge(x, y, x, y + sy * TRK_ARM, a, TRK_LW, 1);
      dot(x, y, 1, a, 1);
    };

    const drawReticle = (W: number, H: number) => {
      // Retarget when the lock expires or the current one has drifted out of
      // usefulness — the city is always moving toward the camera, so every
      // target eventually becomes too close or too large to frame.
      let ok = false;
      if (trkB) {
        let wz = trkB.wz1 - scrollModRef;
        if (wz < -CELL * 2) wz += maxView;
        const d = depthAt(wz);
        ok = d >= TRK_DEPTH_LO && d <= TRK_DEPTH_HI
          && silhouette(trkB, wz, W, H, trkShown)
          && trkShown[2] - trkShown[0] > 4;
      }

      if (!ok || frameT > trkUntil) {
        // Sample a handful of the visible set rather than ranking all of it
        let best: Building | null = null;
        let bestScore = -1;
        for (let n = 0; n < 14 && visN > 0; n++) {
          const cand = visB[(Math.random() * visN) | 0];
          let wz = cand.wz1 - scrollModRef;
          if (wz < -CELL * 2) wz += maxView;
          const d = depthAt(wz);
          if (d < TRK_DEPTH_LO || d > TRK_DEPTH_HI) continue;
          if (!silhouette(cand, wz, W, H, trkFromScratch)) continue;
          const h = trkFromScratch[3] - trkFromScratch[1];
          if (h < TRK_MIN_PX) continue;
          // Prefer the right-centre band, the one region of the Hero that no
          // DOM element covers at any breakpoint
          const cx = (trkFromScratch[0] + trkFromScratch[2]) / 2 / W;
          const cy = (trkFromScratch[1] + trkFromScratch[3]) / 2 / H;
          if (cx < 0.5 || cx > 0.97 || cy < 0.3 || cy > 0.75) continue;
          const score = h;
          if (score > bestScore) { bestScore = score; best = cand; }
        }
        if (best) {
          if (ok) { trkFrom.set(trkShown); } else { trkFrom[0] = trkFrom[2] = W * 0.75; trkFrom[1] = trkFrom[3] = H * 0.5; }
          trkB = best;
          trkT0 = frameT;
          trkUntil = frameT + TRK_HOLD;
          let wz = best.wz1 - scrollModRef;
          if (wz < -CELL * 2) wz += maxView;
          if (!silhouette(best, wz, W, H, trkShown)) return;
        } else if (!ok) {
          return;
        }
      }

      // Travel: ease from the box we left toward the one we are on
      const k = clamp01((frameT - trkT0) / TRK_TRAVEL);
      const e = k * k * (3 - 2 * k);
      const x0 = mix(trkFrom[0], trkShown[0], e) - TRK_PAD;
      const y0 = mix(trkFrom[1], trkShown[1], e) - TRK_PAD;
      const x1 = mix(trkFrom[2], trkShown[2], e) + TRK_PAD;
      const y1 = mix(trkFrom[3], trkShown[3], e) + TRK_PAD;

      // Dimmer while travelling, settled once it arrives
      const a = TRK_A * (0.35 + 0.65 * e);
      bracket(x0, y0,  1,  1, a);
      bracket(x1, y0, -1,  1, a);
      bracket(x0, y1,  1, -1, a);
      bracket(x1, y1, -1, -1, a);

      // Centre mark, gapped exactly as Crosshair draws it
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const ca = a * 0.7;
      sEdge(cx, cy - TRK_GAP, cx, cy - TRK_GAP - TRK_CROSS, ca, TRK_LW, 1);
      sEdge(cx, cy + TRK_GAP, cx, cy + TRK_GAP + TRK_CROSS, ca, TRK_LW, 1);
      sEdge(cx - TRK_GAP, cy, cx - TRK_GAP - TRK_CROSS, cy, ca, TRK_LW, 1);
      sEdge(cx + TRK_GAP, cy, cx + TRK_GAP + TRK_CROSS, cy, ca, TRK_LW, 1);
      dot(cx, cy, 1.25, ca, 1);
    };

    const draw = (t = 0) => {
      // FPS cap: skip frame if not enough time has passed
      if (fpsInterval > 0 && t - lastT < fpsInterval) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      // Clamp the step: a backgrounded tab resumes with a gap of seconds, and
      // an unclamped catch-up would teleport the city forward.
      const dt = prevT === 0 ? 16.7 : Math.min(64, t - prevT);
      prevT  = t;
      lastT  = t;
      frameT = t;

      // ── Sweep and instability bookkeeping ───────────────────────────────
      const sweepPh = (frameT % SWEEP_PERIOD) / SWEEP_RISE;
      sweepY = !lowPower && sweepPh < 1 ? sweepPh * SWEEP_TOP : -1;

      if (!lowPower && frameT >= glitchAt) {
        glitchEnd  = frameT + GLITCH_MS;
        glitchAt   = frameT + GLITCH_GAP_MIN + Math.random() * GLITCH_GAP_VAR;
        glitchKind = Math.floor(Math.random() * 3);
        glitchShift = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * GLITCH_SHIFT);
        glitchTearY = Math.random();
        glitchTearH = Math.random();
        glitchTearX = (Math.random() < 0.5 ? -1 : 1) * GLITCH_TEAR;
        glitchDropLo = Math.random() * 0.7;
        glitchDropHi = glitchDropLo + 0.12 + Math.random() * 0.18;
      }
      const glitching = frameT < glitchEnd;
      const judder = glitching && glitchKind === 0 ? glitchShift : 0;
      const dropping = glitching && glitchKind === 2;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      offset += SCROLL_SPEED * dt;
      const scrollMod = offset % maxView;
      scrollModRef = scrollMod;

      // The emitter the city stands in, under everything
      const horizonY = height * HORIZON_Y;
      ctx.save();
      ctx.translate(width / 2, horizonY + height * EMIT_DROP);
      ctx.scale(1, EMIT_SQUASH);
      const eR = width * EMIT_R;
      const emitG = ctx.createRadialGradient(0, 0, 0, 0, 0, eR);
      emitG.addColorStop(0,    fillOf(EMIT_RGB, EMIT_A));
      emitG.addColorStop(0.45, fillOf(EMIT_RGB, EMIT_A * 0.38));
      emitG.addColorStop(1,    fillOf(EMIT_RGB, 0));
      ctx.fillStyle = emitG;
      ctx.fillRect(-eR, -eR, eR * 2, eR * 2);
      ctx.restore();

      // Everything that lives in the projection judders together; the haze and
      // the emitter are atmosphere on the glass and stay put.
      if (judder !== 0) { ctx.save(); ctx.translate(judder, 0); }

      if (!lowPower) {
        drawWireLayer(scrollMod, width, height);
        flushInk();
      }

      // ── Surface grid ────────────────────────────────────────────────────
      const gridFar = maxView * 0.88;
      const xEnd    = (activeCols - 1) * CELL - halfSpan;

      // Lateral rungs — one segment each, whatever the city's width
      for (let row = 0; row < activeRows; row++) {
        let wz = row * CELL - scrollMod;
        if (wz < -CELL) wz += maxView;
        if (wz + CAM_Z <= 8 || wz > gridFar) continue;
        const alpha = (GRID_A_FAR + depthAt(wz) * GRID_A_NEAR)
                    * (row % STREET_N === 0 ? SECTOR_MUL : 1);
        edge(-halfSpan, 0, wz, xEnd, 0, wz, alpha, GRID_LW, width, height);
      }

      // Longitudinal runs — the half that was missing
      for (let col = 0; col < activeCols; col++) {
        const wx  = col * CELL - halfSpan;
        const sec = col % STREET_N === 0 ? SECTOR_MUL : 1;
        for (let k = 0; k < GRID_Z_STEPS; k++) {
          const z0 = (gridFar * k) / GRID_Z_STEPS;
          const z1 = (gridFar * (k + 1)) / GRID_Z_STEPS;
          const alpha = (GRID_A_FAR + depthAt((z0 + z1) / 2) * GRID_A_NEAR)
                      * GRID_Z_MUL * sec;
          edge(wx, 0, z0, wx, 0, z1, alpha, GRID_LW, width, height);
        }
      }

      // ── Volume rails and far corner brackets ────────────────────────────
      const railX = halfSpan + CELL * RAIL_OUT;
      /** The rail's own ramp, floored so the boundary survives to the far end. */
      const railA = (z: number) => RAIL_A * (RAIL_A_MIN + (1 - RAIL_A_MIN) * depthAt(z));

      for (let sgn = -1; sgn <= 1; sgn += 2) {
        const rx = sgn * railX;
        for (let k = 0; k < GRID_Z_STEPS; k++) {
          const z0 = (gridFar * k) / GRID_Z_STEPS;
          const z1 = (gridFar * (k + 1)) / GRID_Z_STEPS;
          edge(rx, 0, z0, rx, 0, z1, railA((z0 + z1) / 2), RAIL_LW, width, height);
        }

        // Posts every sector, scrolling with the world so the rail reads as
        // measured rather than as a bare converging line
        for (let row = 0; row < activeRows; row += STREET_N) {
          let pz = row * CELL - scrollMod;
          if (pz < -CELL) pz += maxView;
          if (pz + CAM_Z <= 8 || pz > gridFar) continue;
          edge(rx, 0, pz, rx, POST_H, pz, railA(pz) * POST_A, RAIL_LW, width, height);
        }

        // Far corner: a stair inward and a post upward, so the corner reads as
        // the edge of a volume and not as where two lines happen to cross
        const arm  = CELL * BRACKET_ARM;
        const step = CELL * BRACKET_STEP;
        const aF   = railA(gridFar) * 1.5;
        edge(rx, 0, gridFar, rx, 0, gridFar - arm, aF, RAIL_LW, width, height);
        edge(rx, 0, gridFar, rx - sgn * step, 0, gridFar, aF, RAIL_LW, width, height);
        edge(rx - sgn * step, 0, gridFar, rx - sgn * step, 0, gridFar - step, aF, RAIL_LW, width, height);
        edge(rx - sgn * step, 0, gridFar - step, rx - sgn * arm, 0, gridFar - step, aF, RAIL_LW, width, height);
        edge(rx, 0, gridFar, rx, BRACKET_RISE, gridFar, aF * 0.85, RAIL_LW, width, height);
      }
      // The far edge itself, joining the two rails
      edge(-railX, 0, gridFar, railX, 0, gridFar, railA(gridFar) * 1.2, RAIL_LW, width, height);

      // ── Lit sector cells ────────────────────────────────────────────────
      // Whichever cells the clock happens to land on, rising and falling on
      // their own so no two are at the same brightness.
      if (!lowPower) {
        const secW = STREET_N * CELL;
        for (let k = 0; k < CELL_N; k++) {
          const u    = frameT / CELL_PERIOD + k * 0.61;
          const tick = Math.floor(u);
          const a    = CELL_A * Math.sin((u - tick) * Math.PI);
          if (a < 0.004) continue;
          const sx = Math.floor(hash3(tick, k + 1, 3) * nSecX);
          const sz = Math.floor(hash3(tick, k + 1, 7) * nSecZ);
          let z0 = sz * secW - scrollMod;
          if (z0 < -secW) z0 += maxView;
          const z1 = z0 + secW;
          if (z0 + CAM_Z <= 8 || z0 > gridFar) continue;
          const x0 = sx * secW - halfSpan;
          const x1 = Math.min(x0 + secW, xEnd);
          fillQuad(x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1,
            fillOf(CELL_RGB, a), width, height);
        }
      }

      // Street lamps
      for (let row = 0; row < activeRows; row += STREET_N) {
        for (let col = 0; col < activeCols; col += STREET_N) {
          let wz = row * CELL - scrollMod;
          if (wz < -CELL) wz += maxView;
          if (wz + CAM_Z <= 8 || wz > maxView * 0.75) continue;
          const depthT = depthAt(wz);
          edge(col*CELL - halfSpan, 0, wz, col*CELL - halfSpan, 10, wz,
            LAMP_A_FAR + depthT * LAMP_A_NEAR, LAMP_LW, width, height);
        }
      }

      flushInk();


      // Filled and sorted in place. Rebuilding this with map/filter/sort was
      // allocating a wrapper object per visible building — several hundred a
      // frame, every frame, all of it garbage by the next one.
      visN = 0;
      for (let i = 0; i < city.length; i++) {
        const b = city[i];
        let wz = b.wz1 - scrollMod;
        if (wz < -CELL * 2) wz += maxView;
        if (wz + CAM_Z <= 8 || wz >= maxView * CULL_Z) continue;
        visB[visN] = b;
        visZ[visN] = wz;
        visN++;
      }
      // Insertion sort, far to near: the array is nearly sorted every frame
      // because it is built in city order and the city scrolls slowly, so this
      // runs close to linear where a comparator sort pays full price.
      for (let i = 1; i < visN; i++) {
        const bz = visZ[i], bb = visB[i];
        let j = i - 1;
        while (j >= 0 && visZ[j] < bz) { visZ[j + 1] = visZ[j]; visB[j + 1] = visB[j]; j--; }
        visZ[j + 1] = bz; visB[j + 1] = bb;
      }

      let bandCount = 0;
      for (let vi = 0; vi < visN; vi++) {
        const b = visB[vi], wz = visZ[vi];
        // Band size trades stroke calls against occlusion fidelity. These are
        // consecutive in depth, so an edge drawing over a neighbour's facade
        // within a band is a sub-pixel concern.
        if (++bandCount % 24 === 0) flushInk();
        const wz1 = wz;
        const wz2 = wz + (b.wz2 - b.wz1);
        setDepth(wz, b);
        let base = (EDGE_A_FAR + Math.pow(dep.t, EDGE_A_CURVE) * EDGE_A_NEAR)
                 * dep.pulse * dep.lat;
        // A slice of the city that did not finish rendering this pass
        if (dropping && dep.t >= glitchDropLo && dep.t <= glitchDropHi) base *= GLITCH_DROP;
        const lw   = EDGE_W_FAR + dep.t * EDGE_W_NEAR;

        // Phantom box: the projection's own guess at the volume, standing a
        // little proud of it. Far half only, and only on the buildings that
        // drew the flag at generation time.
        if (!lowPower && b.wire && dep.tb < WIRE_BOX_MAX) {
          const wa = WIRE_BOX_A * (1 - dep.tb / WIRE_BOX_MAX);
          const x1 = b.wx1 - WIRE_BOX_PAD, x2 = b.wx2 + WIRE_BOX_PAD;
          const z1 = wz1 - WIRE_BOX_PAD,   z2 = wz2 + WIRE_BOX_PAD;
          const yT = b.h + 9;
          edge(x1, 0, z1, x1, yT, z1, wa,       0.4, width, height);
          edge(x2, 0, z1, x2, yT, z1, wa,       0.4, width, height);
          edge(x1, 0, z2, x1, yT, z2, wa * 0.6, 0.4, width, height);
          edge(x2, 0, z2, x2, yT, z2, wa * 0.6, 0.4, width, height);
          edge(x1, yT, z1, x2, yT, z1, wa,       0.4, width, height);
          edge(x1, yT, z2, x2, yT, z2, wa * 0.6, 0.4, width, height);
          edge(x1, yT, z1, x1, yT, z2, wa * 0.6, 0.4, width, height);
          edge(x2, yT, z1, x2, yT, z2, wa * 0.6, 0.4, width, height);
        }

        if (b.type === "tower" && b.tier2H !== null) {
          const t2 = b.tier2H, t3 = b.tier3H, i2 = b.ins2, i3 = b.ins3;
          drawTier(b.wx1,    b.wx2,    wz1,          wz2,          0,  t2,      base,       false,    width, height, lw, b.h, 0);
          drawTier(b.wx1+i2, b.wx2-i2, wz1+i2*0.45, wz2-i2*0.45, t2, t3??b.h, base*0.92, t3===null, width, height, lw*0.9, b.h, 1);
          if (t3 !== null)
            drawTier(b.wx1+i3, b.wx2-i3, wz1+i3*0.45, wz2-i3*0.45, t3, b.h,   base*0.82, true,      width, height, lw*0.8, b.h, 2);
        } else {
          drawTier(b.wx1, b.wx2, wz1, wz2, 0, b.h, base, true, width, height, lw, b.h, 0);
        }

        if (dep.foot) {
          edge(b.wx1, 0, wz1, b.wx2, 0, wz1, base * EDGE_MUL.footFront, EDGE_LW.foot, width, height);
          edge(b.wx1, 0, wz1, b.wx1, 0, wz2, base * EDGE_MUL.footSide, EDGE_LW.foot, width, height);
          edge(b.wx2, 0, wz1, b.wx2, 0, wz2, base * EDGE_MUL.footSide, EDGE_LW.foot, width, height);
        }

        if (!lowPower && b.data) drawData(b, wz1, width, height);

        if (b.hasTower) {
          const cx  = (b.wx1 + b.wx2) / 2;
          const ant = Math.min(base * 2.5, 0.32);
          edge(cx, b.h,    wz1, cx, b.h+24, wz1, ant,     0.55, width, height);
          edge(cx, b.h+18, wz1, cx, b.h+27, wz1, ant*0.4, 0.45, width, height);

          // Aircraft warning beacon. The only red in an all-green scene, so it
          // stays small and sparse rather than becoming the subject.
          if (!lowPower && dep.tb > 0.3) {
            const on = ((frameT / 1500 + b.phase) % 1) < 0.42;
            if (on) {
              const pt = project(cx, b.h + 28, wz1, width, height);
              if (pt) {
                beacons.push(pt.x, pt.y, Math.min(0.75, 0.25 + dep.tb * 0.7));
              }
            }
          }
        }

        if (!lowPower && dep.tb > 0.34) {
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
            fillQuad(rsx,b.h,rz1, rsx,b.h,rz2, rsx,b.h+r.h,rz2, rsx,b.h+r.h,rz1, fillOf(dep.side, dep.solid), width, height);
            fillQuad(rx1,b.h,rz1, rx2,b.h,rz1, rx2,b.h+r.h,rz1, rx1,b.h+r.h,rz1, fillOf(dep.face, dep.solid), width, height);
            fillQuad(rx1,b.h+r.h,rz1, rx2,b.h+r.h,rz1, rx2,b.h+r.h,rz2, rx1,b.h+r.h,rz2, fillOf(dep.roof, dep.solid), width, height);
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

      flushInk();

      // ── Motes ───────────────────────────────────────────────────────────
      // Drifting up through the city and wrapping in depth along with it.
      for (const p of motes) {
        p.y += p.vy;
        if (p.y > PART_TOP) p.y = 6;
        let pz = p.z - scrollMod;
        if (pz < -CELL) pz += maxView;
        if (pz + CAM_Z <= 8 || pz > maxView * 0.7) continue;
        const dT = depthAt(pz);
        const tw = Math.sin(frameT * 0.0009 + p.ph * TAU);
        if (tw < -0.3) continue;
        const pt = project(p.x, p.y, pz, width, height);
        if (!pt) continue;
        dot(pt.x, pt.y, 0.5 + dT * 0.7,
          (PART_A_FAR + dT * (PART_A_NEAR - PART_A_FAR)) * (0.35 + 0.65 * tw), 3);
      }

      flushInk();

      // ── Aircraft beacons ────────────────────────────────────────────────
      if (beacons.length) {
        for (let i = 0; i < beacons.length; i += 3) {
          ctx.fillStyle = fillOf(BEACON_RGB, beacons[i + 2]);
          ctx.beginPath();
          ctx.arc(beacons[i], beacons[i + 1], 1.5, 0, TAU);
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

          const dT = depthAt(cz);
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
          ctx.arc(head.x, head.y, 0.6 + dT * 1.1, 0, TAU);
          ctx.fill();
        }
      }

      // The projection stops juddering here: what follows is either atmosphere
      // or instrumentation, and neither rides on the emitter.
      if (judder !== 0) ctx.restore();

      if (!lowPower) {
        drawReticle(width, height);
        flushInk();
      }

      // ── Scan sweeps ─────────────────────────────────────────────────────
      // A plane at constant depth walking in from the horizon. All of it
      // projects to one horizontal line, so that is all it costs: the line,
      // brightest at the vanishing point, and a wake fading off above it.
      if (!lowPower) {
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < SCAN_N; i++) {
          const p  = (frameT / SCAN_PERIOD + i / SCAN_N) % 1;
          const wz = maxView * 0.82 * (1 - p);
          const y  = horizonY + (CAM_Y * FOV) / (wz + CAM_Z);
          if (y > height + SCAN_WAKE) continue;
          const a = SCAN_A * Math.sin(p * Math.PI);
          if (a < 0.004) continue;

          // Falls off toward both edges, so the sweep crosses the city rather
          // than the viewport, and pools on the vanishing point like the haze.
          // The wake needs that same falloff, and a rect can only carry one
          // gradient, so it is built from strips that each carry the horizontal
          // one and step their own alpha toward the line.
          const across = (alpha: number) => {
            const g = ctx.createLinearGradient(0, 0, width, 0);
            g.addColorStop(0,    fillOf(SCAN_RGB, 0));
            g.addColorStop(0.24, fillOf(SCAN_RGB, alpha * 0.22));
            g.addColorStop(0.5,  fillOf(SCAN_RGB, alpha));
            g.addColorStop(0.76, fillOf(SCAN_RGB, alpha * 0.22));
            g.addColorStop(1,    fillOf(SCAN_RGB, 0));
            return g;
          };

          const sh = SCAN_WAKE / SCAN_STRIPS;
          for (let k = 0; k < SCAN_STRIPS; k++) {
            const u = (k + 0.5) / SCAN_STRIPS;          // 0 at the top of the wake
            ctx.fillStyle = across(a * 0.4 * u * u);
            ctx.fillRect(0, y - SCAN_WAKE + k * sh, width, sh + 1);
          }

          ctx.fillStyle = across(a);
          ctx.fillRect(0, y, width, 1);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // ── Horizon haze ────────────────────────────────────────────────────
      // Last of the scene passes, so distant buildings dissolve into it. Near
      // ones extend far below the horizon and are barely touched.
      const hazeG = ctx.createLinearGradient(0, horizonY - height * 0.06, 0, horizonY + height * 0.30);
      hazeG.addColorStop(0,   fillOf(HAZE_RGB, HAZE_A_TOP));
      hazeG.addColorStop(0.4, fillOf(HAZE_RGB, HAZE_A_MID));
      hazeG.addColorStop(1,   fillOf(HAZE_RGB, 0));
      ctx.fillStyle = hazeG;
      ctx.fillRect(0, horizonY - height * 0.06, width, height * 0.36);

      // Light put back where the dark haze just took it: an ellipse of it on
      // the vanishing point, and a thin band along the rest of the horizon.
      // Added rather than painted, so it only ever lifts what is already there.
      ctx.globalCompositeOperation = "lighter";
      ctx.save();
      ctx.translate(width / 2, horizonY);
      ctx.scale(1, HOLO_SQUASH);
      const R  = width * 0.30;
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      rg.addColorStop(0,    fillOf(HOLO_RGB, HOLO_CORE_A));
      rg.addColorStop(0.35, fillOf(HOLO_RGB, HOLO_CORE_A * 0.42));
      rg.addColorStop(1,    fillOf(HOLO_RGB, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(-R, -R, R * 2, R * 2);
      ctx.restore();

      const bandG = ctx.createLinearGradient(0, horizonY - height * 0.05, 0, horizonY + height * 0.17);
      bandG.addColorStop(0,    fillOf(HOLO_RGB, 0));
      bandG.addColorStop(0.28, fillOf(HOLO_RGB, HOLO_BAND_A));
      bandG.addColorStop(1,    fillOf(HOLO_RGB, 0));
      ctx.fillStyle = bandG;
      ctx.fillRect(0, horizonY - height * 0.05, width, height * 0.22);
      ctx.globalCompositeOperation = "source-over";

      // ── Torn strip ──────────────────────────────────────────────────────
      // A slice of the finished frame re-composited a few pixels across. The
      // original stays underneath, so it reads as a signal doubling on itself
      // rather than as a band that went missing.
      if (glitching && glitchKind === 1) {
        const th = 4 + glitchTearH * (GLITCH_TEAR_H - 4);
        const ty = glitchTearY * (height - th);
        tearCtx.clearRect(0, 0, width, th);
        tearCtx.drawImage(canvas, 0, ty, width, th, 0, 0, width, th);
        ctx.clearRect(0, ty, width, th);
        ctx.drawImage(tearBuf, 0, 0, width, th, glitchTearX, ty, width, th);
      }

      // ── Depth of field ──────────────────────────────────────────────────
      // The finished frame, downscaled and blurred, composited back over the
      // top and bottom bands. Blurring the far horizon and the ground underfoot
      // is what makes this read as a projection rather than a place.
      //
      // The bands are strips of rising alpha rather than a gradient mask.
      // Masking would need a second full-size canvas and a destination-in pass;
      // what lands here is already blurred, so the stepping between strips does
      // not survive to be seen.
      if (!lowPower) {
        smallCtx.clearRect(0, 0, small.width, small.height);
        smallCtx.drawImage(canvas, 0, 0, small.width, small.height);

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

        band(0, DOF_SHARP_TOP, DOF_A_TOP, 0);   // far: hardest at the horizon
        band(DOF_SHARP_BOT, 1, 0, 1);           // near: hardest underfoot
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
