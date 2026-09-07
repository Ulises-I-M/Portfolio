"use client";

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    // Scroll fires far more often than the screen refreshes, and the previous
    // version put a React state update behind every one of those events — a
    // full render pass per scroll tick to move one bar. Writing the width
    // straight to the node, coalesced into one write per frame, keeps React out
    // of the scroll path entirely.
    const write = () => {
      rafId = 0;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      const pct = total > 0 ? (scrollTop / total) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };

    const onScroll = () => {
      if (rafId === 0) rafId = requestAnimationFrame(write);
    };

    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none"
      style={{ background: "#111111" }}
    >
      <div
        ref={barRef}
        className="h-full"
        style={{
          width: "0%",
          background: "#a8ff00",
          boxShadow: "0 0 8px rgba(168,255,0,0.6)",
        }}
      />
    </div>
  );
}
