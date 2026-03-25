"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.style.cursor = "none";

    const move = (e: MouseEvent) => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
      }
    };

    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Crosshair ring — 24×24 centered on cursor */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[998] w-6 h-6"
        style={{ willChange: "transform" }}
      >
        <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: "rgba(168,255,0,0.55)" }} />
        <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2" style={{ background: "rgba(168,255,0,0.55)" }} />
        {/* Blank center so lines look like a crosshair gap */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a]" />
      </div>
      {/* Neon center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[999] w-1 h-1 rounded-full"
        style={{ background: "#a8ff00", willChange: "transform" }}
      />
    </>
  );
}
