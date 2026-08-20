"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface NestedSquaresProps {
  /** Outer square size in px */
  size?: number;
  /** Number of concentric squares */
  layers?: number;
  color?: string;
  className?: string;
  /** Rotate each square slightly for angular feel */
  rotate?: boolean;
}

/**
 * Concentric nested squares with corner dots.
 * Inspired by the RX-09 mecha FUI "nested square with dot" markers.
 * Each layer animates in with a slight delay.
 */
export default function NestedSquares({
  size = 64,
  layers = 3,
  color = "#a8ff00",
  className = "",
  rotate = false,
}: NestedSquaresProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  const gap = size / (layers * 2 + 1);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-none select-none ${className}`}
    >
      {Array.from({ length: layers }, (_, i) => {
        const inset = gap * (i + 0.5);
        const s = size - inset * 2;
        const x = inset;
        const y = inset;
        const opacity = 0.15 + (i / (layers - 1 || 1)) * 0.45;
        const rotDeg = rotate ? i * 8 : 0;
        const cx = size / 2;
        const cy = size / 2;

        return (
          <motion.g
            key={i}
            transform={`rotate(${rotDeg} ${cx} ${cy})`}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={inView ? { opacity, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {/* Square */}
            <rect
              x={x}
              y={y}
              width={s}
              height={s}
              fill="none"
              stroke={color}
              strokeWidth={1}
            />
            {/* Corner dots */}
            {[
              [x, y],
              [x + s, y],
              [x, y + s],
              [x + s, y + s],
            ].map(([dx, dy], di) => (
              <circle
                key={di}
                cx={dx}
                cy={dy}
                r={1.5}
                fill={color}
                opacity={opacity + 0.1}
              />
            ))}
          </motion.g>
        );
      })}

      {/* Center crosshair dot */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={2}
        fill={color}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.5 } : {}}
        transition={{ delay: layers * 0.12 + 0.1 }}
      />
    </svg>
  );
}
