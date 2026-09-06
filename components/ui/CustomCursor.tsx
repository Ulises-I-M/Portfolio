"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ringRef    = useRef<HTMLDivElement>(null);
  const dotRef     = useRef<HTMLDivElement>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    const INTERACTIVE =
      'a, button, [role="button"], label, select, textarea, input, [tabindex]:not([tabindex="-1"])';

    // ── Move ───────────────────────────────────────────────────────────────────
    // A mouse can report well above display refresh rate, and each report used
    // to write three transforms straight away — several style invalidations per
    // frame for a cursor that can only be painted once. The position is stored
    // and flushed once per frame instead.
    let mx = 0, my = 0, down = false, moveRaf = 0;

    const flush = () => {
      moveRaf = 0;
      const scale = down ? " scale(2)" : "";
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${mx - 12}px, ${my - 12}px)`;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${mx - 2}px, ${my - 2}px)${scale}`;
      if (hoverBoxRef.current)
        hoverBoxRef.current.style.transform = `translate(${mx - 16}px, ${my - 16}px)`;
    };

    const schedule = () => {
      if (moveRaf === 0) moveRaf = requestAnimationFrame(flush);
    };

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      schedule();
    };

    // ── Hover state ────────────────────────────────────────────────────────────
    const onOver = (e: MouseEvent) => {
      const isInteractive = (e.target as HTMLElement).closest(INTERACTIVE) !== null;
      if (hoverBoxRef.current)
        hoverBoxRef.current.style.opacity = isInteractive ? "1" : "0";
      if (ringRef.current)
        ringRef.current.style.opacity = isInteractive ? "0.25" : "1";
    };

    // ── Click ripple ───────────────────────────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 997;
        width: 24px;
        height: 24px;
        border: 1px solid rgba(168,255,0,0.9);
        border-radius: 50%;
        top: ${e.clientY - 12}px;
        left: ${e.clientX - 12}px;
        animation: cursor-ripple 0.55s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 560);
    };

    // ── Mousedown flash — briefly contracts dot ────────────────────────────────
    // Held as state and re-applied by flush(). Appending " scale(2)" to the
    // existing transform, as this did before, left one more scale on the string
    // after every press.
    const onDown = () => { down = true;  schedule(); };
    const onUp   = () => { down = false; schedule(); };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("click", onClick);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      if (moveRaf) cancelAnimationFrame(moveRaf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      {/* Crosshair ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10098] w-6 h-6"
        style={{ willChange: "transform", transition: "opacity 0.15s" }}
      >
        {/* Horizontal arm */}
        <div
          className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
          style={{ background: "rgba(168,255,0,0.55)" }}
        />
        {/* Vertical arm */}
        <div
          className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2"
          style={{ background: "rgba(168,255,0,0.55)" }}
        />
        {/* Center gap (hides the cross intersection) */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a]" />
      </div>

      {/* Center dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10099] w-1 h-1 rounded-full"
        style={{
          background: "#a8ff00",
          willChange: "transform",
          boxShadow: "0 0 4px rgba(168,255,0,0.8)",
          transition: "transform 0.05s",
        }}
      />

      {/* Hover box — 32×32 neon border over interactive elements */}
      <div
        ref={hoverBoxRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10097] w-8 h-8"
        style={{
          willChange: "transform",
          border: "1px solid rgba(168,255,0,0.7)",
          boxShadow: "0 0 8px rgba(168,255,0,0.15), inset 0 0 8px rgba(168,255,0,0.05)",
          opacity: 0,
          transition: "opacity 0.15s",
        }}
      />
    </>
  );
}
