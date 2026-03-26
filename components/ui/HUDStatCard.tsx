"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface HUDStatCardProps {
  /** Display value string (e.g. "2+") */
  value: string;
  /** Top label (e.g. "YEARS EXP") */
  label: string;
  /** 0–100 — drives vertical segment fill + bottom bar */
  pct: number;
  /** Optional small unit below value (e.g. "YRS") */
  unit?: string;
  /** Card width in px */
  size?: number;
}

const SEGS = 8;

/**
 * Compact HUD stat readout card.
 * Inspired by CYBER-DECK FUI panel readouts.
 * - Large value with neon glow
 * - Vertical segmented bar (right side)
 * - Animated fill bar at bottom
 * - Corner accents + chamfered border
 */
export default function HUDStatCard({
  value,
  label,
  pct,
  unit,
  size = 90,
}: HUDStatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const prefersReducedMotion = useReducedMotion();

  const filledSegs = Math.round((pct / 100) * SEGS);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay: 0.2 };

  return (
    <div ref={ref} style={{ width: size }} className="flex flex-col gap-1">
      {/* Card */}
      <div
        className="relative border border-[#1e1e1e] chamfered-sm overflow-hidden"
        style={{ background: "rgba(10,10,10,0.9)", padding: "10px 8px 8px" }}
      >
        {/* Corner accents */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#a8ff00] opacity-40"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#a8ff00] opacity-40"
        />

        {/* Scan line overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 2px)",
          }}
        />

        {/* Top label */}
        <p className="font-mono text-[7px] tracking-[0.18em] text-[#333333] mb-2 leading-none">
          {label}
        </p>

        {/* Value + vertical bar */}
        <div className="flex items-end justify-between gap-1">
          {/* Value block */}
          <div className="flex flex-col leading-none">
            <motion.span
              className="font-mono font-bold text-[#a8ff00] leading-none"
              style={{
                fontSize: size * 0.22,
                textShadow: "0 0 12px rgba(168,255,0,0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 }}
            >
              {value}
            </motion.span>
            {unit && (
              <span className="font-mono text-[7px] tracking-[0.15em] text-[#555555] mt-1">
                {unit}
              </span>
            )}
          </div>

          {/* Vertical segmented bar */}
          <div className="flex flex-col-reverse gap-[2px] pb-0.5">
            {Array.from({ length: SEGS }, (_, i) => {
              const isFilled = i < filledSegs;
              return (
                <motion.div
                  key={i}
                  style={{ width: 5, height: 4 }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={
                    inView
                      ? {
                          opacity: isFilled ? 0.9 : 0.12,
                          scaleX: 1,
                          background: isFilled ? "#a8ff00" : "rgba(168,255,0,0.3)",
                        }
                      : { opacity: 0, scaleX: 0 }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.25, delay: 0.4 + i * 0.06 }
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Bottom fill bar */}
        <div
          className="mt-3 h-[3px] relative overflow-hidden"
          style={{ background: "rgba(168,255,0,0.06)" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ background: "#a8ff00", opacity: 0.55 }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={transition}
          />
          {/* Glow tip */}
          <motion.div
            className="absolute top-0 h-full w-3"
            style={{
              background: "linear-gradient(to right, transparent, rgba(168,255,0,0.9))",
              filter: "blur(1px)",
            }}
            initial={{ left: 0, opacity: 0 }}
            animate={inView ? { left: `${pct - 4}%`, opacity: [0, 1, 0] } : {}}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.2, delay: 0.2 }}
          />
        </div>

        {/* Percentage readout */}
        <div className="mt-1 flex justify-end">
          <span className="font-mono text-[7px] text-[#333333] tabular-nums">
            {inView ? `${pct}%` : "---"}
          </span>
        </div>
      </div>
    </div>
  );
}
