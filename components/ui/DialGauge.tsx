"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface DialGaugeProps {
  /** 0–100 fill level */
  value: number;
  label: string;
  displayValue?: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Semicircle dial gauge — like an RPM / speedometer.
 * Inspired by CYBER-DECK HUD H5 dial gauges row.
 * Animates the needle and arc fill on scroll-in.
 */
export default function DialGauge({
  value,
  label,
  displayValue,
  size = 80,
  color = "#a8ff00",
  className = "",
}: DialGaugeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const prefersReducedMotion = useReducedMotion();

  const cx = size / 2;
  const cy = size * 0.62; // shift center down so semicircle sits at bottom
  const r = size * 0.38;

  // Arc spans 180° (left to right across top)
  const startAngle = -180; // left
  const endAngle = 0;      // right
  const arcDeg = 180;
  const circumference = 2 * Math.PI * r;
  const arcLength = (arcDeg / 360) * circumference;
  const fillLength = (value / 100) * arcLength;

  // Convert degrees to radians for needle tip
  const needleAngle = startAngle + (value / 100) * arcDeg; // -180 to 0
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleTipX = cx + Math.cos(needleRad) * r;
  const needleTipY = cy + Math.sin(needleRad) * r;

  // Tick marks along the arc
  const ticks = Array.from({ length: 7 }, (_, i) => {
    const ang = startAngle + (i / 6) * arcDeg;
    const rad = (ang * Math.PI) / 180;
    const inner = r - 4;
    const outer = r + 2;
    return {
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
    };
  });

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        ref={ref}
        width={size}
        height={size * 0.7}
        viewBox={`0 0 ${size} ${size * 0.7}`}
        aria-hidden="true"
        overflow="visible"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(168,255,0,0.07)"
          strokeWidth={2}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-180 ${cx} ${cy})`}
          strokeLinecap="butt"
        />

        {/* Fill arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="butt"
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(-180 ${cx} ${cy})`}
          initial={{ strokeDashoffset: arcLength }}
          animate={inView ? { strokeDashoffset: arcLength - fillLength } : { strokeDashoffset: arcLength }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }
          }
          style={{ filter: `drop-shadow(0 0 2px rgba(168,255,0,0.4))` }}
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke="rgba(168,255,0,0.2)"
            strokeWidth={1}
          />
        ))}

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleTipX}
          y2={needleTipY}
          stroke={color}
          strokeWidth={1}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.9 } : { opacity: 0 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1.0 }}
        />

        {/* Center pivot */}
        <circle cx={cx} cy={cy} r={2.5} fill={color} opacity={0.6} />

        {/* Display value text */}
        <text
          x={cx}
          y={cy - r * 0.35}
          textAnchor="middle"
          fontFamily="'Space Mono', monospace"
          fontSize={size * 0.14}
          fill={color}
          fontWeight="bold"
        >
          {displayValue ?? `${value}`}
        </text>
      </svg>

      {/* Label below */}
      <span className="font-mono text-[8px] tracking-[0.2em] text-[#555555] uppercase text-center mt-1">
        {label}
      </span>
    </div>
  );
}
