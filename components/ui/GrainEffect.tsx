"use client";

import { useId } from "react";

/**
 * Drop this inside any `relative overflow-hidden` image container.
 * Renders an animated green (#a8ff00) CRT noise overlay that
 * shifts position every ~80ms via the global `grain` CSS animation.
 */
export default function GrainEffect({ opacity = 0.22 }: { opacity?: number }) {
  // Each instance needs a unique filter id — useId prevents collisions
  const uid = useId().replace(/:/g, "");
  const filterId = `gfx-${uid}`;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute z-[3]"
      style={{
        top: "-30%",
        left: "-30%",
        width: "160%",
        height: "160%",
        opacity,
        mixBlendMode: "screen",
        animation: "grain 0.8s steps(10, end) infinite",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={filterId} colorInterpolationFilters="sRGB">
        {/* No seed prop — value is static; position shift from CSS creates the flicker */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75 0.75"
          numOctaves="4"
          stitchTiles="stitch"
        />
        {/*
          Matrix: RGB fixed to #a8ff00 (0.659, 1.0, 0.0)
                  Alpha = 5*A - 1.5 → high contrast, sparse green dots
        */}
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.659
                  0 0 0 0 1
                  0 0 0 0 0
                  0 0 0 5 -1.5"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}
