"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Query within our own SVG element — avoids dynamic ID issues
    const turb = svgRef.current?.querySelector("feTurbulence");
    if (!turb) return;

    let rafId: number;
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastTime >= 80) {
        turb.setAttribute("seed", String(Math.floor(Math.random() * 200)));
        lastTime = timestamp;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      {/* Animated SVG grain noise — seed is managed only via JS, not JSX props,
          so React reconciliation never resets it back to a fixed value */}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
        style={{ opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          {/* No seed prop — owned entirely by the rAF loop below */}
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
