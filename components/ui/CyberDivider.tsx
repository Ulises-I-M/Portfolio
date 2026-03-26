"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface CyberDividerProps {
  /** Optional label shown at the left end */
  label?: string;
  className?: string;
}

/**
 * A cybernetic section divider with circuit-line aesthetics:
 * - Animated sweep line on scroll-in
 * - Edge nodes (dots) at start and end
 * - Optional data label
 * - Tick marks along the line
 */
export default function CyberDivider({ label, className = "" }: CyberDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div ref={ref} className={`relative flex items-center gap-3 py-1 ${className}`} aria-hidden="true">
      {/* Left node */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: "#a8ff00",
          boxShadow: "0 0 6px rgba(168,255,0,0.6)",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.4s",
        }}
      />

      {/* Optional label */}
      {label && (
        <span className="font-mono text-[8px] tracking-[0.25em] text-[#333333] flex-shrink-0 uppercase">
          {label}
        </span>
      )}

      {/* Main line with sweep */}
      <div className="relative flex-1 h-px overflow-hidden">
        {/* Static base line */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(168,255,0,0.2), rgba(168,255,0,0.05) 70%, transparent)",
          }}
        />

        {/* Animated sweep */}
        {inView && (
          <motion.div
            className="absolute top-0 h-full w-16"
            initial={{ left: "-4rem" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background: "linear-gradient(to right, transparent, rgba(168,255,0,0.6), transparent)",
            }}
          />
        )}

        {/* Tick marks */}
        {[20, 40, 60, 80].map((pos) => (
          <span
            key={pos}
            className="cyber-tick cyber-tick-v absolute top-[-2px]"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      {/* Right node */}
      <div
        className="w-1 h-1 rounded-full flex-shrink-0"
        style={{
          background: "#555555",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.6s 0.3s",
        }}
      />

      {/* Data coordinate */}
      <span className="font-mono text-[7px] tracking-[0.15em] text-[#222222] flex-shrink-0">
        {`0x${Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, "0").toUpperCase()}`}
      </span>
    </div>
  );
}
