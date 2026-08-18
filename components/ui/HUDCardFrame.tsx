"use client";

import { useRef, useEffect, useState, useId } from "react";
import { FRAME, framePath } from "@/components/ui/hudFrameGeometry";

interface HUDCardFrameProps {
  hovered?: boolean;
}

/**
 * SVG overlay frame for the project cards, in the FUI/HUD language of the
 * reference art: stepped corners, diagonal hatch bands on both flanks, and
 * accent slashes.
 *
 * Rendered outside the clipped article so L-brackets and ticks can extend past
 * the card boundary. The outline itself comes from hudFrameGeometry, the same
 * module the card body clips itself with — see the note there on why.
 */
export default function HUDCardFrame({ hovered = false }: HUDCardFrameProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    const parent = anchorRef.current?.parentElement;
    if (!parent) return;
    const update = () => setSize({ w: parent.offsetWidth, h: parent.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Nothing to stroke until measured. The body's clip-path is CSS-only, so it
  // is already the right shape — only the outline waits a frame.
  if (size.w === 0) {
    return <div ref={anchorRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" />;
  }

  const { w: W, h: H } = size;
  const { C, IN } = FRAME;

  const EXT  = 8;    // L-bracket extension beyond the outline
  const ARM  = 22;   // L-bracket arm length
  const TICK = 5;    // edge tick length
  const DOT  = 1.5;  // dot accent radius
  const BAND = 7;    // hatch band width

  const cMain = hovered ? 0.7  : 0.42;
  const cDim  = hovered ? 0.38 : 0.18;
  const col   = (a: number) => `rgba(168,255,0,${a})`;

  const hTicks = [W * 0.3, W * 0.7];
  const vTicks = [H * 0.22, H * 0.78];

  // Hatch bands sit just inside the flanks, clear of the side notches
  const bandY = H * 0.30;
  const bandH = H * 0.16;

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
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "visible",
          transition: "filter 0.3s",
          filter: hovered ? "drop-shadow(0 0 4px rgba(168,255,0,0.35))" : "none",
        }}
      >
        <defs>
          <pattern
            id={`hatch-${uid}`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="5" stroke={col(cMain)} strokeWidth="2" />
          </pattern>
        </defs>

        {/* ── Outline, shared with the body's clip-path ── */}
        <path d={framePath(W, H)} fill="none" stroke={col(cMain)} strokeWidth={1.5} />

        {/* ── Inner parallel outline — same corner sizes, smaller box ── */}
        <path
          d={framePath(W - IN * 2, H - IN * 2)}
          transform={`translate(${IN},${IN})`}
          fill="none"
          stroke={col(cDim)}
          strokeWidth={1}
        />

        {/* ── Diagonal hatch bands on both flanks ── */}
        <rect x={10} y={bandY} width={BAND} height={bandH} fill={`url(#hatch-${uid})`} />
        <rect x={W - 10 - BAND} y={bandY} width={BAND} height={bandH} fill={`url(#hatch-${uid})`} />
        {/* second, shorter band below each */}
        <rect x={10} y={bandY + bandH + 10} width={BAND} height={bandH * 0.45} fill={`url(#hatch-${uid})`} />
        <rect x={W - 10 - BAND} y={bandY + bandH + 10} width={BAND} height={bandH * 0.45} fill={`url(#hatch-${uid})`} />

        {/* ── Heavy diagonal bars, top right ── */}
        {[0, 1].map((i) => (
          <line
            key={`bar${i}`}
            x1={W - 74 + i * 16}
            y1={-12}
            x2={W - 62 + i * 16}
            y2={-24}
            stroke={col(cMain)}
            strokeWidth={4}
            strokeLinecap="square"
          />
        ))}

        {/* ── Accent slashes, bottom right ── */}
        {[0, 1, 2].map((i) => (
          <line
            key={`sl${i}`}
            x1={W - 46 + i * 9}
            y1={H + 16}
            x2={W - 38 + i * 9}
            y2={H + 8}
            stroke={col(cMain)}
            strokeWidth={2.5}
            strokeLinecap="square"
          />
        ))}

        {/* ── Corner L-brackets ── */}
        <polyline points={`${C + ARM},-${EXT} ${C},-${EXT} -${EXT},${C} -${EXT},${C + ARM}`}
          fill="none" stroke={col(cMain)} strokeWidth={1.5} />
        <circle cx={C} cy={-EXT} r={DOT} fill={col(cMain)} />
        <circle cx={-EXT} cy={C} r={DOT} fill={col(cMain)} />

        <polyline points={`${W - C - ARM},-${EXT} ${W - C},-${EXT} ${W + EXT},${C} ${W + EXT},${C + ARM}`}
          fill="none" stroke={col(cMain)} strokeWidth={1.5} />
        <circle cx={W - C} cy={-EXT} r={DOT} fill={col(cMain)} />
        <circle cx={W + EXT} cy={C} r={DOT} fill={col(cMain)} />

        <polyline points={`${C + ARM},${H + EXT} ${C},${H + EXT} -${EXT},${H - C} -${EXT},${H - C - ARM}`}
          fill="none" stroke={col(cMain)} strokeWidth={1.5} />
        <circle cx={C} cy={H + EXT} r={DOT} fill={col(cMain)} />
        <circle cx={-EXT} cy={H - C} r={DOT} fill={col(cMain)} />

        <polyline points={`${W - C - ARM},${H + EXT} ${W - C},${H + EXT} ${W + EXT},${H - C} ${W + EXT},${H - C - ARM}`}
          fill="none" stroke={col(cMain)} strokeWidth={1.5} />
        <circle cx={W - C} cy={H + EXT} r={DOT} fill={col(cMain)} />
        <circle cx={W + EXT} cy={H - C} r={DOT} fill={col(cMain)} />

        {/* ── Edge ticks ── */}
        {hTicks.map((x) => (
          <line key={`tt${x}`} x1={x} y1={0} x2={x} y2={-TICK} stroke={col(cDim)} strokeWidth={1} />
        ))}
        {hTicks.map((x) => (
          <line key={`bt${x}`} x1={x} y1={H} x2={x} y2={H + TICK} stroke={col(cDim)} strokeWidth={1} />
        ))}
        {vTicks.map((y) => (
          <line key={`lt${y}`} x1={0} y1={y} x2={-TICK} y2={y} stroke={col(cDim)} strokeWidth={1} />
        ))}
        {vTicks.map((y) => (
          <line key={`rt${y}`} x1={W} y1={y} x2={W + TICK} y2={y} stroke={col(cDim)} strokeWidth={1} />
        ))}

        {/* ── Chip decoration, top ── */}
        <rect x={W * 0.5} y={-13} width={W * 0.13} height={5} fill="none" stroke={col(cDim)} strokeWidth={1} />
        <line x1={W * 0.5 + W * 0.13 * 0.3} y1={-13} x2={W * 0.5 + W * 0.13 * 0.3} y2={-8}
          stroke={col(cDim)} strokeWidth={1} />

        {/* ── Bottom circuit traces ── */}
        <polyline points={`${C},${H + EXT} ${C},${H + EXT + 8} ${C - 8},${H + EXT + 8}`}
          fill="none" stroke={col(cDim)} strokeWidth={1} />
        <circle cx={C - 8} cy={H + EXT + 8} r={DOT} fill={col(cDim)} />
      </svg>
    </div>
  );
}
