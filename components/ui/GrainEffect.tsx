"use client";

import { useId } from "react";

/**
 * Drop this inside any `relative overflow-hidden` image container.
 * Renders an animated retro CRT / cyberpunk TV-noise overlay:
 *   - Horizontal-band turbulence (feTurbulence type=turbulence, low X / high Y freq)
 *   - Phosphor-green tint (#39ff14)
 *   - Subtle horizontal scanlines
 *
 * The SVG is 200 % × 200 % with a -50 % offset so that translations of up
 * to 25 % of the element never expose an edge (buffer = 50 % of parent).
 */
export default function GrainEffect({ opacity = 0.28 }: { opacity?: number }) {
  const uid = useId().replace(/:/g, "");
  const filterId = `crt-${uid}`;

  return (
    <>
      {/* ── Phosphor-green CRT noise ── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute z-[3]"
        style={{
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          opacity,
          mixBlendMode: "screen",
          animation: "crt-noise 0.8s steps(10, end) infinite",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={filterId} colorInterpolationFilters="sRGB">
          {/*
            baseFrequency="0.0 0.55":
              X = 0 → uniform across the width  → creates horizontal bands
              Y = 0.55 → medium vertical detail → breaks bands into segments
            type="turbulence" → sharper / more chaotic than fractalNoise
          */}
          <feTurbulence
            type="turbulence"
            baseFrequency="0.0 0.55"
            numOctaves="2"
            stitchTiles="stitch"
          />
          {/*
            Phosphor green: #39ff14 ≈ (0.224, 1.0, 0.078)
            Alpha row: 0 0 0 7 -2.8 → high-contrast sparse dots
          */}
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.224
                    0 0 0 0 1
                    0 0 0 0 0.078
                    0 0 0 7 -2.8"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>

      {/* ── Horizontal CRT scanlines ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
        }}
      />
    </>
  );
}
