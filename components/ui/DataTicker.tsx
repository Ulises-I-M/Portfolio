"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/** Fixed side rail with scrolling hex data — pure cybernetic decoration */
export default function DataTicker() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (prefersReducedMotion || !mounted) return null;

  // Generate deterministic hex data stream
  const DATA_LINES = Array.from({ length: 24 }, (_, i) => {
    const addr = (i * 0x0A3F + 0x1000).toString(16).toUpperCase().padStart(4, "0");
    const vals = Array.from({ length: 3 }, (_, j) =>
      ((i * 17 + j * 43 + 0xAB) % 256).toString(16).toUpperCase().padStart(2, "0")
    ).join(" ");
    return `${addr}: ${vals}`;
  });

  return (
    <div
      className="fixed right-3 top-1/2 -translate-y-1/2 z-[5] hidden xl:flex flex-col items-center gap-4 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Top node */}
      <div className="w-px h-8 bg-gradient-to-b from-transparent to-[rgba(168,255,0,0.15)]" />
      <div className="w-1 h-1 rounded-full bg-[#a8ff00] hud-pulse" />

      {/* Data stream */}
      <div className="relative h-48 overflow-hidden" style={{ width: "10px" }}>
        <div
          className="data-ticker-rail whitespace-nowrap"
          style={{
            animation: "data-stream 20s linear infinite",
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...DATA_LINES, ...DATA_LINES].map((line, i) => (
            <span key={i} className="block" style={{ marginBottom: "4px" }}>
              {line}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom node */}
      <div className="w-1 h-1 rounded-full bg-[#333333]" />
      <div className="w-px h-8 bg-gradient-to-b from-[rgba(168,255,0,0.15)] to-transparent" />
    </div>
  );
}
