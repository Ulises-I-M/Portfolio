"use client";

import { motion } from "framer-motion";

const DURATION = 0.72;
const EASE = [0.76, 0, 0.24, 1] as const;

// Panels are wider than half the container so the interlocking teeth have room
// to bite into the opposite side. They overlap in the middle; clip-path removes
// the overlap, so each door ends up with an irregular silhouette.
const PANEL_W = 58;

// ── The seam ──────────────────────────────────────────────────────────────────
// Single source of truth: the line where the two doors meet. x is a percentage
// of the container width (50 = centre line), y a percentage of its height. Both
// panels derive their silhouette from this same list, so the teeth interlock
// exactly — no gap, no overlap.
const SEAM: Array<[number, number]> = [
  [50, 0],   [50, 4],   [56, 4],   [56, 9],   [53, 9],   [53, 12],
  [56, 12],  [56, 20],  [44, 20],  [44, 30],  [47, 30],  [47, 33],
  [44, 33],  [44, 41],  [56, 41],  [56, 52],  [53, 52],  [53, 55],
  [56, 55],  [56, 63],  [44, 63],  [44, 74],  [47, 74],  [47, 77],
  [44, 77],  [44, 86],  [50, 86],  [50, 100],
];

// Circles riding the secondary trace, at the notch corners
const NODE_POINTS: Array<[number, number]> = [
  [53, 9],  [53, 12], [47, 30], [47, 33],
  [53, 52], [53, 55], [47, 74], [47, 77],
];

// Inward offset of the thin parallel trace, in panel-local percent
const TRACE_INSET = 3.5;

// Container-x → panel-local percentage
const toLeft  = (x: number) => (x / PANEL_W) * 100;
const toRight = (x: number) => ((x - (100 - PANEL_W)) / PANEL_W) * 100;
const localX  = (x: number, r: boolean) => (r ? toRight(x) : toLeft(x));

/** Silhouette of one door: everything on its own side of the seam. */
function clipFor(r: boolean) {
  const pts = SEAM.map(([x, y]) => `${localX(x, r).toFixed(3)}% ${y}%`).join(", ");
  return r
    ? `polygon(100% 0%, ${pts}, 100% 100%)`
    : `polygon(0% 0%, ${pts}, 0% 100%)`;
}

/** The seam as an SVG path in 0–100 panel-local space. */
function seamPath(r: boolean, inset = 0) {
  const dir = r ? 1 : -1; // "inward" is +x for the right door, -x for the left
  return SEAM
    .map(([x, y], i) =>
      `${i ? "L" : "M"} ${(localX(x, r) + dir * inset).toFixed(3)},${y}`)
    .join(" ");
}

// ── Door face art ─────────────────────────────────────────────────────────────
// Decoration only — the seam itself is drawn separately, unclipped.
//
// The grid tiles as a CSS background and the detail block is a fixed-size SVG
// anchored to the panel's outer edge. Earlier this was one SVG stretched to the
// panel with preserveAspectRatio="slice", which blew the type up to ~2x on tall
// narrow viewports and made the two mirrored panels collide in the middle.

const GRID_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 17v6M17 20h6' stroke='rgba(168,255,0,0.16)' stroke-width='0.5'/%3E%3C/svg%3E\")";

const DATA_ROWS = [200, 212, 224, 240, 252, 264, 280, 292, 304, 320, 332];

function CircuitPanel({ side }: { side: "left" | "right" }) {
  const id = side;
  const r = side === "right";

  // Everything in the detail block is laid out against the outer edge
  const ax = r ? 278 : 2;
  const anchor = r ? ("end" as const) : ("start" as const);
  const boxX = (w: number) => (r ? 278 - w : 2);

  const slashes = r
    ? [{ x1: 240, y1: 250, x2: 218, y2: 228 }, { x1: 180, y1: 330, x2: 158, y2: 308 }, { x1: 248, y1: 390, x2: 226, y2: 368 }]
    : [{ x1: 40,  y1: 250, x2: 62,  y2: 228 }, { x1: 100, y1: 330, x2: 122, y2: 308 }, { x1: 32,  y1: 390, x2: 54,  y2: 368 }];

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: "#020a02", backgroundImage: GRID_BG, backgroundSize: "40px 40px" }}
    >
      {/* Dark wedges in the outer corners — two separate triangles; one combined
          polygon self-intersects and floods the whole outer band instead. */}
      {([
        r ? "polygon(100% 0, 62% 0, 100% 26%)"       : "polygon(0 0, 38% 0, 0 26%)",
        r ? "polygon(100% 100%, 62% 100%, 100% 74%)" : "polygon(0 100%, 38% 100%, 0 74%)",
      ]).map((clip, i) => (
        <div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "rgba(0,20,0,0.7)", clipPath: clip }}
        />
      ))}

      {/* Corner brackets, hugging the panel's outer corners */}
      {([["top", 0], ["bottom", 1]] as const).map(([edge]) => (
        <div
          key={edge}
          className="absolute w-8 h-8 pointer-events-none"
          style={{
            [edge]: 10,
            [r ? "right" : "left"]: 10,
            borderColor: "rgba(168,255,0,0.65)",
            borderStyle: "solid",
            borderWidth: edge === "top"
              ? (r ? "1.5px 1.5px 0 0" : "1.5px 0 0 1.5px")
              : (r ? "0 1.5px 1.5px 0" : "0 0 1.5px 1.5px"),
          }}
        />
      ))}

      {/* Detail block — fixed size, so the type reads the same at every viewport.
          Hidden on small screens, where there is no room for it beside the seam. */}
      <div
        className="hidden md:flex absolute inset-y-0 items-center pointer-events-none"
        style={{ [r ? "right" : "left"]: 20 }}
      >
      <svg
        className="lg:scale-[1.22]"
        style={{ transformOrigin: r ? "right center" : "left center" }}
        width="280"
        height="430"
        viewBox="0 0 280 430"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`hp-${id}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="#a8ff00" strokeWidth="6" strokeLinecap="square" />
          </pattern>
          <filter id={`gl-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Diagonal hatch strip */}
        <rect x={boxX(110)} y="18" width="110" height="50" fill={`url(#hp-${id})`} opacity="0.72" />
        <rect x={boxX(110)} y="18" width="110" height="50"
          fill="none" stroke="rgba(168,255,0,0.4)" strokeWidth="1" />

        {/* "00" counter */}
        <text x={ax} y="150" textAnchor={anchor} fontFamily="'Space Mono', monospace"
          fontSize="80" fill="#a8ff00" filter={`url(#gl-${id})`}>
          00
        </text>
        <text x={ax} y="169" textAnchor={anchor} fontFamily="monospace" fontSize="9"
          fill="rgba(168,255,0,0.45)" letterSpacing="2">
          GATE_STATUS
        </text>
        <text x={ax} y="181" textAnchor={anchor} fontFamily="monospace" fontSize="9"
          fill="rgba(168,255,0,0.3)" letterSpacing="2">
          LOCKED
        </text>

        {/* Simulated data rows */}
        {DATA_ROWS.map((y, i) => {
          const w = 34 + (i % 4) * 20;
          return <rect key={i} x={boxX(w)} y={y} width={w} height="6" rx="1" fill="rgba(168,255,0,0.06)" />;
        })}

        {/* Accent slash marks */}
        {slashes.map(({ x1, y1, x2, y2 }, i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#a8ff00" strokeWidth="5" opacity="0.78" strokeLinecap="square" />
        ))}

        {/* Status line */}
        <line x1={boxX(220)} y1="408" x2={boxX(220) + 220} y2="408"
          stroke="rgba(168,255,0,0.12)" strokeWidth="0.5" />
        <text x={ax} y="421" textAnchor={anchor} fontFamily="monospace" fontSize="8"
          fill="rgba(168,255,0,0.3)" letterSpacing="1.5">
          {r ? "PORT_R // SECURE" : "PORT_L // SECURE"}
        </text>
      </svg>
      </div>
    </div>
  );
}

// ── One door ──────────────────────────────────────────────────────────────────

function Door({ side }: { side: "left" | "right" }) {
  const r = side === "right";

  return (
    <>
      {/* Door face, cut to the interlocking silhouette */}
      <div className="absolute inset-0" style={{ clipPath: clipFor(r) }}>
        <CircuitPanel side={side} />
      </div>

      {/* Seam trace + glow. Outside the clip so the bloom spills past the edge.
          preserveAspectRatio="none" makes the path land exactly on the clip
          boundary; non-scaling-stroke keeps the line an even width despite the
          stretch, and the glow is a CSS drop-shadow because SVG filters would
          be distorted by that same stretch. */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          filter:
            "drop-shadow(0 0 5px rgba(168,255,0,0.85)) drop-shadow(0 0 14px rgba(168,255,0,0.4))",
        }}
        aria-hidden="true"
      >
        {/* Thin parallel trace, set in from the edge. Only the right door draws
            it: with both doors drawing, the closed seam read as a doubled line
            instead of the single composition the reference shows. */}
        {r && (
          <path
            d={seamPath(r, TRACE_INSET)}
            fill="none"
            stroke="rgba(168,255,0,0.32)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* The seam itself */}
        <path
          d={seamPath(r)}
          fill="none"
          stroke="#a8ff00"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* Nodes ride the secondary trace, so they belong to the right door too.
          Real divs, so they stay circular under the stretched viewBox. */}
      {r && NODE_POINTS.map(([x, y], i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: `${localX(x, r) + (r ? 1 : -1) * TRACE_INSET}%`,
            top: `${y}%`,
            width: 11,
            height: 11,
            marginLeft: -5.5,
            marginTop: -5.5,
            borderRadius: "50%",
            border: "1.3px solid #a8ff00",
            boxShadow: "0 0 6px rgba(168,255,0,0.7)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{ inset: 3, background: "#a8ff00" }}
          />
        </div>
      ))}
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export interface GateTransitionProps {
  /** true = panels are off-screen (open); false = panels cover the screen (closed) */
  isOpen: boolean;
  /** "fullscreen" covers the viewport; "contained" fills its nearest positioned parent */
  variant?: "fullscreen" | "contained";
  /** Seconds per slide. Defaults to 0.72 (fullscreen) / 0.45 (contained). */
  duration?: number;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
}

export default function GateTransition({
  isOpen,
  variant = "fullscreen",
  duration,
  onOpenComplete,
  onCloseComplete,
}: GateTransitionProps) {
  // Each panel is PANEL_W wide, so shifting it a full 100% of its own width
  // carries it clear of the container.
  const openL = { x: "-100%" } as const;
  const openR = { x: "100%" } as const;
  const shut  = { x: "0%"   } as const;

  const contained = variant === "contained";
  const dur = duration ?? (contained ? 0.45 : DURATION);

  return (
    <div
      className={`${contained ? "absolute" : "fixed"} inset-0 overflow-hidden`}
      style={{ zIndex: contained ? 40 : 300, pointerEvents: isOpen ? "none" : "all" }}
    >
      {/* Left door */}
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{ width: `${PANEL_W}%` }}
        initial={isOpen ? openL : shut}
        animate={isOpen ? openL : shut}
        transition={{ duration: dur, ease: EASE }}
        onAnimationComplete={() => { if (isOpen) onOpenComplete?.(); }}
      >
        <Door side="left" />
      </motion.div>

      {/* Right door */}
      <motion.div
        className="absolute inset-y-0 right-0"
        style={{ width: `${PANEL_W}%` }}
        initial={isOpen ? openR : shut}
        animate={isOpen ? openR : shut}
        transition={{ duration: dur, ease: EASE }}
        onAnimationComplete={() => { if (!isOpen) onCloseComplete?.(); }}
      >
        <Door side="right" />
      </motion.div>
    </div>
  );
}
