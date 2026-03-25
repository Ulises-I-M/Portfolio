"use client";

import { useEffect, useId } from "react";

export default function GrainOverlay() {
  const filterId = useId().replace(/:/g, "");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const turb = document.querySelector<SVGFETurbulenceElement>(
      `#grain-${filterId} feTurbulence`
    );
    if (!turb) return;

    let rafId: number;
    let lastTime = 0;
    const INTERVAL = 80; // ~12fps

    const animate = (timestamp: number) => {
      if (timestamp - lastTime >= INTERVAL) {
        turb.setAttribute("seed", String(Math.floor(Math.random() * 200)));
        lastTime = timestamp;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [filterId]);

  return (
    <>
      {/* Animated SVG grain noise */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
        style={{ opacity: 0.055 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={`grain-${filterId}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="0"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${filterId})`} />
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
