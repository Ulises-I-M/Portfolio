"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface ArcGaugeProps {
  /** 0–100 */
  value: number;
  /** Label above center value */
  label?: string;
  /** Center display text (default: `${value}%`) */
  centerText?: string;
  /** Sub-text below center */
  subText?: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * SVG circular arc progress gauge.
 * Inspired by FUI / CYBER-DECK HUD ring indicators.
 * Animates stroke-dashoffset on scroll-in.
 */
export default function ArcGauge({
  value,
  label,
  centerText,
  subText,
  size = 100,
  color = "#a8ff00",
  className = "",
}: ArcGaugeProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const prefersReducedMotion = useReducedMotion();

  const strokeWidth = 2;
  const gap = 10; // degrees cut from bottom
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc spans (360 - gap) degrees
  const arcDeg = 360 - gap;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (arcDeg / 360) * circumference;
  const fillLength = (value / 100) * arcLength;

  // Rotation: start at (-90 + gap/2)° so the gap sits at the bottom
  const rotation = -90 + gap / 2;

  const trackColor = `rgba(168,255,0,0.08)`;
  const glowColor = `rgba(168,255,0,0.25)`;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {label && (
        <span className="font-mono text-[8px] tracking-[0.25em] text-[#555555] uppercase mb-1">
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
          {/* Glow filter */}
          <defs>
            <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track (background arc) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />

          {/* Tick marks along track */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = rotation + (i / 7) * arcDeg;
            const rad = (angle * Math.PI) / 180;
            const outerR = radius + 4;
            const innerR = radius + 2;
            return (
              <line
                key={i}
                x1={cx + Math.cos(rad) * innerR}
                y1={cy + Math.sin(rad) * innerR}
                x2={cx + Math.cos(rad) * outerR}
                y2={cy + Math.sin(rad) * outerR}
                stroke={`rgba(168,255,0,0.2)`}
                strokeWidth={1}
              />
            );
          })}

          {/* Fill arc — animated */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            filter="url(#arc-glow)"
            initial={{ strokeDashoffset: arcLength }}
            animate={
              inView
                ? {
                    strokeDashoffset: prefersReducedMotion
                      ? arcLength - fillLength
                      : arcLength - fillLength,
                  }
                : { strokeDashoffset: arcLength }
            }
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
          />

          {/* Tip dot */}
          {inView && (
            <motion.circle
              cx={cx + Math.cos(((rotation + (value / 100) * arcDeg - 90) * Math.PI) / 180 + Math.PI / 2) * radius}
              cy={cy + Math.sin(((rotation + (value / 100) * arcDeg - 90) * Math.PI) / 180 + Math.PI / 2) * radius}
              r={2}
              fill={color}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold leading-none"
            style={{
              fontSize: size * 0.2,
              color,
              textShadow: `0 0 10px rgba(168,255,0,0.4)`,
            }}
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
