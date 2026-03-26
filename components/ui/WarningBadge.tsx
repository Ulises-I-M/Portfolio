"use client";

import { motion, useReducedMotion } from "framer-motion";

interface WarningBadgeProps {
  label: string;
  /** "ok" = neon green (default) | "warn" = amber | "alert" = red */
  level?: "ok" | "warn" | "alert";
  className?: string;
  /** Pulse the triangle */
  pulse?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  ok: "#a8ff00",
  warn: "rgba(255,180,0,0.8)",
  alert: "rgba(255,50,50,0.8)",
};

/**
 * FUI warning / status badge with SVG equilateral triangle outline.
 * Inspired by the angular alert markers in RX-09 and Cyberpunk VISET references.
 */
export default function WarningBadge({
  label,
  level = "ok",
  className = "",
  pulse = false,
}: WarningBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const color = LEVEL_COLORS[level];

  // Equilateral triangle points for a 14×12 viewBox
  const triangle = "M 7 1 L 13.5 12 L 0.5 12 Z";

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={label}
    >
      {/* Triangle icon */}
      <motion.svg
        aria-hidden="true"
        width={14}
        height={12}
        viewBox="0 0 14 12"
        animate={
          pulse && !prefersReducedMotion
            ? { opacity: [1, 0.3, 1] }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d={triangle}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeLinejoin="miter"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
        {/* Inner nested triangle — slightly smaller */}
        <path
          d="M 7 4 L 10.5 10 L 3.5 10 Z"
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.4}
        />
      </motion.svg>

      {/* Label */}
      <span
        className="font-mono text-[9px] tracking-[0.2em] uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
