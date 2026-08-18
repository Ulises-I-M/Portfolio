"use client";

import { motion } from "framer-motion";

const DURATION = 0.72;
const EASE = [0.76, 0, 0.24, 1] as const;

// ── Circuit panel art ─────────────────────────────────────────────────────────
// Each panel is an independent SVG. Right panel mirrors the left panel's
// geometry (path near seam, decorative elements on the outer edge).

function CircuitPanel({ side }: { side: "left" | "right" }) {
  const id = side;
  const r = side === "right";

  // Serpentine path — left panel hugs right edge (seam), right panel hugs left edge
  const mainPath = r
    ? "M 0,40 L 100,40 L 100,95 L 162,95 L 162,215 L 100,215 L 100,268 L 162,268 L 162,392 L 100,392 L 100,448 L 0,448"
    : "M 400,40 L 300,40 L 300,95 L 238,95 L 238,215 L 300,215 L 300,268 L 238,268 L 238,392 L 300,392 L 300,448 L 400,448";

  const secPath = r
    ? "M 0,22 L 115,22 L 115,80 L 178,80 L 178,230 L 115,230 L 115,283 L 178,283 L 178,407 L 115,407 L 115,466 L 0,466"
    : "M 400,22 L 285,22 L 285,80 L 222,80 L 222,230 L 285,230 L 285,283 L 222,283 L 222,407 L 285,407 L 285,466 L 400,466";

  const nodes = r
    ? [{ cx: 100, cy: 40 }, { cx: 100, cy: 95 }, { cx: 162, cy: 95 }, { cx: 162, cy: 215 },
       { cx: 100, cy: 215 }, { cx: 100, cy: 268 }, { cx: 162, cy: 268 }, { cx: 162, cy: 392 },
       { cx: 100, cy: 392 }, { cx: 100, cy: 448 }]
    : [{ cx: 300, cy: 40 }, { cx: 300, cy: 95 }, { cx: 238, cy: 95 }, { cx: 238, cy: 215 },
       { cx: 300, cy: 215 }, { cx: 300, cy: 268 }, { cx: 238, cy: 268 }, { cx: 238, cy: 392 },
       { cx: 300, cy: 392 }, { cx: 300, cy: 448 }];

  const slashes = r
    ? [{ x1: 340, y1: 300, x2: 318, y2: 278 }, { x1: 280, y1: 400, x2: 258, y2: 378 }, { x1: 348, y1: 470, x2: 326, y2: 448 }]
    : [{ x1: 60,  y1: 300, x2: 82,  y2: 278 }, { x1: 120, y1: 400, x2: 142, y2: 378 }, { x1: 52,  y1: 470, x2: 74,  y2: 448 }];

  // Positions for outer-side decorative elements
  const ox = r ? 274 : 16;   // hatch / text / labels start x
  const tx = r ? 276 : 18;   // "00" text x
  const seamX = r ? 1 : 399; // seam edge line x

  // Corner bracket paths
  const bktTL = r
    ? "M 392,8 L 392,44 M 392,8 L 356,8"
    : "M 8,8 L 8,44 M 8,8 L 44,8";
  const bktBL = r
    ? "M 392,512 L 392,476 M 392,512 L 356,512"
    : "M 8,512 L 8,476 M 8,512 L 44,512";

  // Dark corner triangles (outer corners)
  const triTop = r ? "400,0 250,0 400,150" : "0,0 150,0 0,150";
  const triBot = r ? "400,520 400,370 250,520" : "0,520 0,370 150,520";

  return (
    <div className="w-full h-full" style={{ background: "#020a02" }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 520"
        // Anchor to the seam edge so narrow panels keep the circuit visible
        preserveAspectRatio={r ? "xMinYMid slice" : "xMaxYMid slice"}
        style={{ display: "block" }}
      >
        <defs>
          {/* Grid crosses */}
          <pattern id={`gp-${id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="20" y1="17" x2="20" y2="23" stroke="rgba(168,255,0,0.14)" strokeWidth="0.5" />
            <line x1="17" y1="20" x2="23" y2="20" stroke="rgba(168,255,0,0.14)" strokeWidth="0.5" />
          </pattern>
          {/* Hatch stripes */}
          <pattern id={`hp-${id}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="14" x2="14" y2="0" stroke="#a8ff00" strokeWidth="6" strokeLinecap="square" />
          </pattern>
          <clipPath id={`hc-${id}`}>
            <rect x={ox} y="20" width="110" height="54" />
          </clipPath>
          {/* Subtle glow */}
          <filter id={`gl-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Strong glow for main path */}
          <filter id={`gl2-${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="400" height="520" fill="#020a02" />
        {/* Grid */}
        <rect width="400" height="520" fill={`url(#gp-${id})`} />

        {/* Dark geometric corner fills */}
        <polygon points={triTop} fill="rgba(0,18,0,0.75)" />
        <polygon points={triBot} fill="rgba(0,18,0,0.75)" />

        {/* Diagonal hatch strip — outer corner */}
        <rect x={ox} y="20" width="110" height="54"
          fill={`url(#hp-${id})`} clipPath={`url(#hc-${id})`} opacity="0.72" />
        <rect x={ox} y="20" width="110" height="54"
          fill="none" stroke="rgba(168,255,0,0.4)" strokeWidth="1" />

        {/* "00" large counter */}
        <text
          x={tx} y="172"
          fontFamily="'Space Mono', monospace"
          fontSize="88"
          fill="#a8ff00"
          filter={`url(#gl-${id})`}
        >
          00
        </text>
        <text x={tx + 3} y="192" fontFamily="monospace" fontSize="9" fill="rgba(168,255,0,0.45)" letterSpacing="2">
          GATE_STATUS
        </text>
        <text x={tx + 3} y="205" fontFamily="monospace" fontSize="9" fill="rgba(168,255,0,0.3)" letterSpacing="2">
          LOCKED
        </text>

        {/* Data label blocks (simulated text rows) */}
        {[224, 237, 250, 268, 281, 294, 312, 325, 338, 356, 369].map((y, i) => (
          <rect key={i} x={tx + 3} y={y} width={34 + (i % 4) * 20} height="6"
            rx="1" fill="rgba(168,255,0,0.05)" />
        ))}

        {/* ── Main circuit path ── */}
        {/* Diffuse glow under path */}
        <path d={mainPath} stroke="rgba(168,255,0,0.13)" strokeWidth="15"
          fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* Bright path */}
        <path d={mainPath} stroke="#a8ff00" strokeWidth="4"
          fill="none" strokeLinejoin="round" strokeLinecap="round"
          filter={`url(#gl2-${id})`} />
        {/* Secondary parallel path */}
        <path d={secPath} stroke="rgba(168,255,0,0.3)" strokeWidth="1.2"
          fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {/* Nodes at bends */}
        {nodes.map(({ cx, cy }, i) => (
          <g key={i} filter={`url(#gl-${id})`}>
            <circle cx={cx} cy={cy} r="5.5" fill="none" stroke="#a8ff00" strokeWidth="1.3" />
            <circle cx={cx} cy={cy} r="2" fill="#a8ff00" />
          </g>
        ))}

        {/* Accent slash marks (outer side) */}
        {slashes.map(({ x1, y1, x2, y2 }, i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#a8ff00" strokeWidth="5" opacity="0.78" strokeLinecap="square" />
        ))}

        {/* Corner brackets */}
        <path d={bktTL} stroke="#a8ff00" strokeWidth="1.5" fill="none" opacity="0.65" />
        <path d={bktBL} stroke="#a8ff00" strokeWidth="1.5" fill="none" opacity="0.65" />

        {/* Bottom status line */}
        <line x1="0" y1="496" x2="400" y2="496" stroke="rgba(168,255,0,0.12)" strokeWidth="0.5" />
        <text x={tx + 3} y="509" fontFamily="monospace" fontSize="8"
          fill="rgba(168,255,0,0.3)" letterSpacing="1.5">
          {r ? "PORT_R // SECURE" : "PORT_L // SECURE"}
        </text>

        {/* Seam edge glow line (inner edge of each panel) */}
        <line x1={seamX} y1="0" x2={seamX} y2="520"
          stroke="rgba(168,255,0,0.45)" strokeWidth="2"
          filter={`url(#gl-${id})`} />
      </svg>
    </div>
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
      {/* Left panel — slides left to open */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        initial={isOpen ? openL : shut}
        animate={isOpen ? openL : shut}
        transition={{ duration: dur, ease: EASE }}
        onAnimationComplete={() => { if (isOpen) onOpenComplete?.(); }}
      >
        <CircuitPanel side="left" />
        {/* Seam glow strip */}
        <div
          className="absolute inset-y-0 right-0 w-0.5"
          style={{
            background: "linear-gradient(to bottom, transparent, #a8ff00 20%, #a8ff00 80%, transparent)",
            boxShadow: "0 0 10px rgba(168,255,0,0.9), 0 0 24px rgba(168,255,0,0.4)",
          }}
        />
      </motion.div>

      {/* Right panel — slides right to open */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        initial={isOpen ? openR : shut}
        animate={isOpen ? openR : shut}
        transition={{ duration: dur, ease: EASE }}
        onAnimationComplete={() => { if (!isOpen) onCloseComplete?.(); }}
      >
        <CircuitPanel side="right" />
        {/* Seam glow strip */}
        <div
          className="absolute inset-y-0 left-0 w-0.5"
          style={{
            background: "linear-gradient(to bottom, transparent, #a8ff00 20%, #a8ff00 80%, transparent)",
            boxShadow: "0 0 10px rgba(168,255,0,0.9), 0 0 24px rgba(168,255,0,0.4)",
          }}
        />
      </motion.div>
    </div>
  );
}
