"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay() {
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !turbRef.current) return;

    const tick = () => {
      turbRef.current?.setAttribute("seed", String(Math.floor(Math.random() * 200)));
    };

    const id = setInterval(tick, 80); // ~12fps grain flicker
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Animated SVG grain noise */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="0"
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
