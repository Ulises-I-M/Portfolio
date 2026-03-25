"use client";

/**
 * CRT Scanline overlay — drop inside any `relative overflow-hidden` container.
 *
 * Two CSS layers:
 *  1. Dense 4 px scanlines (2 px green + 2 px dark) that scroll continuously.
 *  2. A wide slow-moving interference band — the classic CRT "bright bar".
 */
export default function GrainEffect({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{ opacity }}
    >
      {/* ── Dense horizontal scanlines (fast scroll) ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(0, 210, 70, 0.13) 0px,
            rgba(0, 210, 70, 0.13) 2px,
            rgba(0,   0,  0, 0.10) 2px,
            rgba(0,   0,  0, 0.10) 4px
          )`,
          animation: "scanline-scroll 0.12s linear infinite",
          mixBlendMode: "screen",
        }}
      />

      {/* ── Wide interference band (slow scroll) ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent           0px,
            transparent           80px,
            rgba(0, 200, 60, 0.07) 80px,
            rgba(0, 200, 60, 0.07) 110px,
            transparent           110px,
            transparent           200px
          )`,
          animation: "scanline-interference 4s linear infinite",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
