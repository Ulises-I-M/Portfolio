"use client";

export default function GrainOverlay() {
  return (
    <>
      {/* Retro green CRT noise — tiled feTurbulence tinted to #a8ff00,
          CSS steps() animation pans the pattern to simulate film grain flicker */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed z-[9999]"
        style={{
          top: "-30%",
          left: "-30%",
          width: "160%",
          height: "160%",
          opacity: 0.18,
          mixBlendMode: "screen",
          animation: "grain 0.8s steps(10, end) infinite",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain" colorInterpolationFilters="sRGB">
          {/* Fine fractal noise — higher baseFrequency = finer grain pixels */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75 0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          {/*
            feColorMatrix matrix:
              - RGB fixed to #a8ff00 → (0.659, 1.0, 0.0)
              - Alpha = 5 * A_in - 1.5  → high contrast: noise < 0.3 → transparent,
                noise > 0.5 → fully visible green pixel
            Result: sparse green grain dots on transparent background
          */}
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.659
                    0 0 0 0 1
                    0 0 0 0 0
                    0 0 0 5 -1.5"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9997]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />
    </>
  );
}
