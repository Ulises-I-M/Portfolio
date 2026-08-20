"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BarcodeIndicatorProps {
  /** Number of bars */
  bars?: number;
  /** Max bar height in px */
  maxHeight?: number;
  color?: string;
  className?: string;
  /** If true, animate bars on scroll-in */
  animate?: boolean;
}

// Deterministic heights based on bar index (no Math.random for SSR safety)
function getBarHeight(i: number, bars: number, max: number): number {
  const heights = [0.4, 0.9, 0.6, 1.0, 0.3, 0.7, 0.5, 0.8, 0.4, 0.95,
                   0.6, 0.3, 0.8, 0.5, 1.0, 0.4, 0.7, 0.9, 0.5, 0.6,
                   0.8, 0.3, 0.7, 0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.4];
  return Math.round(heights[i % heights.length] * max);
}

/**
 * FUI barcode / spectrum indicator.
 * A group of vertical bars with varying heights — inspired by
 * CYBER-DECK HUD spectrum displays and RX-09 barcode markers.
 */
export default function BarcodeIndicator({
  bars = 20,
  maxHeight = 24,
  color = "#a8ff00",
  className = "",
  animate: shouldAnimate = true,
}: BarcodeIndicatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`flex items-end gap-[2px] ${className}`}
      style={{ height: maxHeight }}
    >
      {Array.from({ length: bars }, (_, i) => {
        const h = getBarHeight(i, bars, maxHeight);
        return (
          <motion.div
            key={i}
            className="flex-shrink-0"
            initial={shouldAnimate ? { scaleY: 0, opacity: 0 } : {}}
            animate={
              shouldAnimate && inView
                ? { scaleY: 1, opacity: i % 3 === 0 ? 0.6 : 0.25 }
                : shouldAnimate
                  ? { scaleY: 0, opacity: 0 }
                  : { opacity: i % 3 === 0 ? 0.6 : 0.25 }
            }
            transition={{ duration: 0.4, delay: i * 0.02, ease: "easeOut" }}
            style={{ width: 2, background: color, height: h, transformOrigin: "bottom" }}
          />
        );
      })}
    </div>
  );
}
