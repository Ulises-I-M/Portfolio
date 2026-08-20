"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface SerratedRingGaugeProps {
  /** 0–100 */
  value: number;
  label?: string;
  centerText?: string;
  subText?: string;
  size?: number;
  color?: string;
  className?: string;
  /** Number of serrations (gear teeth) */
  teeth?: number;
}

/**
 * Circular gauge with serrated / gear-tooth outer ring.
 * Inspired by CYBER-DECK HUD H17/H18 serrated ring references.
 * Inner arc shows progress; outer ring is the toothed border.
 */
export default function SerratedRingGauge({
  value,
  label,
  centerText,
  subText,
  size = 120,
  color = "#a8ff00",
  className = "",
  teeth = 36,
}: SerratedRingGaugeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const prefersReducedMotion = useReducedMotion();

  const cx = size / 2;
  const cy = size / 2;

  // Round to 4 dp to prevent SSR/client floating-point hydration mismatch
  const r4 = (n: number) => Math.round(n * 10000) / 10000;

  // Radii
  const outerR = size / 2 - 2;       // outer tip of teeth
  const innerTeethR = outerR - 5;    // base of teeth
  const progressR = innerTeethR - 6; // progress arc
  const trackR = progressR;

  // Build serrated outer ring path
  const teethPath = (() => {
    const points: string[] = [];
    for (let i = 0; i < teeth; i++) {
      const angA = ((i * 2) / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
      const angB = (((i * 2) + 1) / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
      const angC = (((i * 2) + 2) / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
      // Inner → outer → inner
      points.push(
        `${r4(cx + Math.cos(angA) * innerTeethR)},${r4(cy + Math.sin(angA) * innerTeethR)}`,
        `${r4(cx + Math.cos(angB) * outerR)},${r4(cy + Math.sin(angB) * outerR)}`,
        `${r4(cx + Math.cos(angC) * innerTeethR)},${r4(cy + Math.sin(angC) * innerTeethR)}`,
      );
    }
    return `M ${points.join(" L ")} Z`;
  })();

  // Progress arc
  const circumference = 2 * Math.PI * progressR;
  const arcDeg = 300; // 300° arc (gap at bottom)
  const arcLength = (arcDeg / 360) * circumference;
  const fillLength = (value / 100) * arcLength;
  const rotation = -90 + (360 - arcDeg) / 2;

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      {label && (
        <span className="font-mono text-[8px] tracking-[0.25em] text-[#555555] uppercase">
          {label}
        </span>
      )}

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <defs>
            <filter id="serr-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Serrated outer ring */}
          <motion.path
            d={teethPath}
            fill="none"
            stroke={color}
            strokeWidth={0.75}
            opacity={0.2}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 0.2 } : {}}
            transition={{ duration: 0.6 }}
          />

          {/* Track arc */}
          <circle
            cx={cx}
            cy={cy}
            r={trackR}
            fill="none"
            stroke={`rgba(168,255,0,0.07)`}
            strokeWidth={2.5}
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />

          {/* Progress fill arc */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={trackR}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="butt"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            initial={{ strokeDashoffset: arcLength }}
            animate={inView ? { strokeDashoffset: arcLength - fillLength } : { strokeDashoffset: arcLength }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 1.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }
            }
            style={{ filter: `drop-shadow(0 0 3px rgba(168,255,0,0.4))` }}
          />

          {/* Tick marks inside teeth */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = rotation + (i / 7) * arcDeg;
            const rad = (angle * Math.PI) / 180;
            const r1 = trackR - 5;
            const r2 = trackR - 8;
            return (
              <line
                key={i}
                x1={r4(cx + Math.cos(rad) * r1)}
                y1={r4(cy + Math.sin(rad) * r1)}
                x2={r4(cx + Math.cos(rad) * r2)}
                y2={r4(cy + Math.sin(rad) * r2)}
                stroke={`rgba(168,255,0,0.25)`}
                strokeWidth={1}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold leading-none"
            style={{ fontSize: size * 0.18, color, textShadow: `0 0 10px rgba(168,255,0,0.4)` }}
          >
            {centerText ?? `${value}`}
          </span>
          {subText && (
            <span
              className="font-mono tracking-[0.1em] text-[#555555]"
              style={{ fontSize: size * 0.08 }}
            >
              {subText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
