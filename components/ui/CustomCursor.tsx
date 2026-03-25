"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");
    document.documentElement.style.cursor = "none";

    const INTERACTIVE =
      'a, button, [role="button"], label, select, textarea, input, [tabindex]:not([tabindex="-1"])';

    const move = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
      }
      if (hoverBoxRef.current) {
        hoverBoxRef.current.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const isInteractive = (e.target as HTMLElement).closest(INTERACTIVE) !== null;
      if (hoverBoxRef.current) {
        hoverBoxRef.current.style.opacity = isInteractive ? "1" : "0";
      }
      // Crosshair dims when a hover-box takes over
      if (ringRef.current) {
        ringRef.current.style.opacity = isInteractive ? "0.25" : "1";
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.classList.remove("custom-cursor-active");
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* Crosshair — fades when hovering interactive elements */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[998] w-6 h-6"
        style={{ willChange: "transform", transition: "opacity 0.15s" }}
      >
        <div
          className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
          style={{ background: "rgba(168,255,0,0.55)" }}
        />
        <div
          className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2"
          style={{ background: "rgba(168,255,0,0.55)" }}
        />
        {/* Center gap */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a]" />
      </div>

      {/* Center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[999] w-1 h-1 rounded-full"
        style={{ background: "#a8ff00", willChange: "transform" }}
      />

      {/* Hover box — 32×32 neon border, appears over interactive elements */}
      <div
        ref={hoverBoxRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[997] w-8 h-8"
        style={{
          willChange: "transform",
          border: "1px solid rgba(168,255,0,0.7)",
          boxShadow: "0 0 6px rgba(168,255,0,0.2)",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />
    </>
  );
}
