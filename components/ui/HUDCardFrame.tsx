"use client";

import { useRef, useEffect, useState } from "react";

interface HUDCardFrameProps {
  hovered?: boolean;
}

/**
 * SVG overlay frame inspired by cyberpunk FUI interfaces.
 * Renders outside the clipped article so L-brackets / ticks can
 * extend beyond the card boundary.
 *
 * Geometry (all corners chamfered at C=16px, matching .chamfered-all):
 *   - Main border polygon (8-point chamfered rect)
 *   - Inner parallel border inset by IN=5px
 *   - L-bracket ornaments at all 4 corners (extend EXT=8px outside)
 *   - Dot accents at L-bracket bends
 *   - Tick marks along all 4 edges
 *   - Top-right chip/rect decoration
 *   - Bottom corner circuit traces
 *   - Side secondary accent lines
 */
export default function HUDCardFrame({ hovered = false }: HUDCardFrameProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;
    const update = () =>
      setSize({ w: parent.offsetWidth, h: parent.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Don't render until we have real dimensions (avoids SSR mismatch)
  if (size.w === 0) {
    return (
      <div
        ref={anchorRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      />
    );
  }

  const { w: W, h: H } = size;

  // ── Geometry ──────────────────────────────────────────────────────────────
  const C   = 16;   // chamfer cut size (must match .chamfered-all)
  const IN  = 5;    // inset for inner parallel border
  const CI  = C - IN * 0.7; // inner chamfer (scaled down proportionally)
  const EXT = 8;    // L-bracket extension beyond outer border
  const ARM = 22;   // L-bracket arm length along the edge
  const TICK = 5;   // tick mark length (perpendicular to edge)
  const DOT = 1.5;  // dot accent radius

  // ── Colors ────────────────────────────────────────────────────────────────
  const cMain = hovered ? 0.7  : 0.42;  // main border + brackets
  const cDim  = hovered ? 0.38 : 0.18;  // secondary / decorative elements
  const col   = (a: number) => `rgba(168,255,0,${a})`;

  // ── Path builder ──────────────────────────────────────────────────────────
  const chamfPath = (
    x0: number, y0: number,
    x1: number, y1: number,
    c:  number
  ) =>
    `M ${x0+c},${y0} L ${x1-c},${y0} L ${x1},${y0+c} ` +
    `L ${x1},${y1-c} L ${x1-c},${y1} L ${x0+c},${y1} ` +
    `L ${x0},${y1-c} L ${x0},${y0+c} Z`;

  const mainPath  = chamfPath(0,  0,  W,    H,    C);
  const innerPath = chamfPath(IN, IN, W-IN, H-IN, CI);

  // ── Tick positions ────────────────────────────────────────────────────────
  const hTicks = [W * 0.25, W * 0.5, W * 0.75];
  const vTicks = [H * 0.25, H * 0.5, H * 0.75];

  return (
    <div
      ref={anchorRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      <svg
        width={W}
        height={H}
        style={{
          position:   "absolute",
          top:        0,
          left:       0,
          overflow:   "visible",
          transition: "filter 0.3s",
          filter:     hovered
            ? "drop-shadow(0 0 4px rgba(168,255,0,0.35))"
            : "none",
        }}
      >
        {/* ── Main chamfered border ── */}
        <path
          d={mainPath}
          fill="none"
          stroke={col(cMain)}
          strokeWidth={1.5}
        />

        {/* ── Inner parallel border ── */}
        <path
          d={innerPath}
          fill="none"
          stroke={col(cDim)}
          strokeWidth={1}
        />

        {/* ── Corner L-brackets ── */}

        {/* Top-left */}
        <polyline
          points={`${C+ARM},-${EXT} ${C},-${EXT} -${EXT},${C} -${EXT},${C+ARM}`}
          fill="none"
          stroke={col(cMain)}
          strokeWidth={1.5}
        />
        <circle cx={C}    cy={-EXT}  r={DOT} fill={col(cMain)} />
        <circle cx={-EXT} cy={C}     r={DOT} fill={col(cMain)} />

        {/* Top-right */}
        <polyline
          points={`${W-C-ARM},-${EXT} ${W-C},-${EXT} ${W+EXT},${C} ${W+EXT},${C+ARM}`}
          fill="none"
          stroke={col(cMain)}
          strokeWidth={1.5}
        />
        <circle cx={W-C}    cy={-EXT} r={DOT} fill={col(cMain)} />
        <circle cx={W+EXT}  cy={C}    r={DOT} fill={col(cMain)} />

        {/* Bottom-left */}
        <polyline
          points={`${C+ARM},${H+EXT} ${C},${H+EXT} -${EXT},${H-C} -${EXT},${H-C-ARM}`}
          fill="none"
          stroke={col(cMain)}
          strokeWidth={1.5}
        />
        <circle cx={C}    cy={H+EXT} r={DOT} fill={col(cMain)} />
        <circle cx={-EXT} cy={H-C}   r={DOT} fill={col(cMain)} />

        {/* Bottom-right */}
        <polyline
          points={`${W-C-ARM},${H+EXT} ${W-C},${H+EXT} ${W+EXT},${H-C} ${W+EXT},${H-C-ARM}`}
          fill="none"
          stroke={col(cMain)}
          strokeWidth={1.5}
        />
        <circle cx={W-C}   cy={H+EXT} r={DOT} fill={col(cMain)} />
        <circle cx={W+EXT} cy={H-C}   r={DOT} fill={col(cMain)} />

        {/* ── Edge tick marks ── */}

        {/* Top */}
        {hTicks.map((x) => (
          <line key={`tt${x}`} x1={x} y1={0} x2={x} y2={-TICK}
            stroke={col(cDim)} strokeWidth={1} />
        ))}

        {/* Bottom */}
        {hTicks.map((x) => (
          <line key={`bt${x}`} x1={x} y1={H} x2={x} y2={H+TICK}
            stroke={col(cDim)} strokeWidth={1} />
        ))}

        {/* Left */}
        {vTicks.map((y) => (
          <line key={`lt${y}`} x1={0} y1={y} x2={-TICK} y2={y}
            stroke={col(cDim)} strokeWidth={1} />
        ))}

        {/* Right */}
        {vTicks.map((y) => (
          <line key={`rt${y}`} x1={W} y1={y} x2={W+TICK} y2={y}
            stroke={col(cDim)} strokeWidth={1} />
        ))}

        {/* ── Top-right chip decoration ── */}
        <rect
          x={W * 0.54}
          y={-13}
          width={W * 0.13}
          height={5}
          rx={0}
          fill="none"
          stroke={col(cDim)}
          strokeWidth={1}
        />
        {/* Small notch on the chip */}
        <line
          x1={W * 0.54 + W * 0.13 * 0.3}
          y1={-13}
          x2={W * 0.54 + W * 0.13 * 0.3}
          y2={-8}
          stroke={col(cDim)}
          strokeWidth={1}
        />
        <circle
          cx={W * 0.54 + W * 0.13 + 5}
          cy={-10.5}
          r={DOT}
          fill={col(cDim)}
        />

        {/* ── Bottom-left circuit trace ── */}
        <polyline
          points={`${C},${H+EXT} ${C},${H+EXT+8} ${C-8},${H+EXT+8}`}
          fill="none"
          stroke={col(cDim)}
          strokeWidth={1}
        />
        <circle cx={C-8} cy={H+EXT+8} r={DOT} fill={col(cDim)} />

        {/* ── Bottom-right circuit trace ── */}
        <polyline
          points={`${W-C},${H+EXT} ${W-C},${H+EXT+8} ${W-C+8},${H+EXT+8}`}
          fill="none"
          stroke={col(cDim)}
          strokeWidth={1}
        />
        <circle cx={W-C+8} cy={H+EXT+8} r={DOT} fill={col(cDim)} />

        {/* ── Side secondary accent lines ── */}
        <line
          x1={-4} y1={H * 0.28} x2={-4} y2={H * 0.72}
          stroke={col(cDim)} strokeWidth={1}
        />
        <line
          x1={W+4} y1={H * 0.28} x2={W+4} y2={H * 0.72}
          stroke={col(cDim)} strokeWidth={1}
        />
      </svg>
    </div>
  );
}
