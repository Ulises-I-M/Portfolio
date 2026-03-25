"use client";

export default function GrainOverlay() {
  return (
    <>
      {/* Animated grain noise — CSS steps() animation shifts the tiled
          feTurbulence pattern to a new position each frame (~12fps).
          stitchTiles="stitch" ensures seamless tiling at any offset. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed z-[9999]"
        style={{
          /* Oversized so translations don't reveal edges */
          top: "-30%",
          left: "-30%",
          width: "160%",
          height: "160%",
          opacity: 0.12,
          animation: "grain 0.8s steps(10, end) infinite",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
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
