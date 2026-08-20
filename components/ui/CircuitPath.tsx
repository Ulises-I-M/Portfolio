"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface CircuitPathProps {
  className?: string;
  width?: number;
  height?: number;
  /** Variant layout */
  variant?: "hero" | "about" | "corner";
}

/**
 * Decorative SVG circuit-board path traces.
 * Lines route at 90° angles (PCB-style), with node dots at junctions.
 * Inspired by RX-09 mecha FUI reference.
 * Paths animate with stroke-dashoffset on scroll-in.
 */
export default function CircuitPath({
  className = "",
  width = 300,
  height = 200,
  variant = "hero",
}: CircuitPathProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  const color = "rgba(168,255,0,0.12)";
  const nodeColor = "rgba(168,255,0,0.2)";

  // Different path sets per variant
  const configs: Record<string, { paths: string[]; nodes: [number, number][] }> = {
    hero: {
      paths: [
        "M 20 20 L 80 20 L 80 60 L 200 60 L 200 20 L 280 20",
        "M 0 100 L 50 100 L 50 140 L 120 140 L 120 100 L 180 100",
        "M 250 80 L 250 160 L 300 160",
        "M 40 180 L 40 140 L 100 140",
      ],
      nodes: [
        [80, 20], [80, 60], [200, 60], [200, 20],
        [50, 100], [50, 140], [120, 140], [120, 100],
        [250, 80], [250, 160],
        [40, 140], [100, 140],
      ],
    },
    about: {
      paths: [
        "M 0 40 L 60 40 L 60 80 L 160 80",
        "M 100 0 L 100 40 L 220 40 L 220 120 L 300 120",
        "M 0 140 L 80 140 L 80 100 L 150 100",
      ],
      nodes: [
        [60, 40], [60, 80], [160, 80],
        [100, 40], [220, 40], [220, 120],
        [80, 140], [80, 100], [150, 100],
      ],
    },
    corner: {
      paths: [
        "M 0 0 L 60 0 L 60 40 L 100 40",
        "M 0 80 L 40 80 L 40 40 L 100 40",
      ],
      nodes: [[60, 0], [60, 40], [100, 40], [40, 80], [40, 40]],
    },
  };

  const { paths, nodes } = configs[variant] ?? configs.hero;

  // Total stroke length for animation (rough estimate per path)
  const pathLengths = paths.map(() => 800);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="visible"
    >
      {/* Paths */}
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeLinecap="square"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.5, delay: i * 0.3, ease: "easeOut" }
          }
        />
      ))}

      {/* Junction nodes */}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={2}
          fill={nodeColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.8 + i * 0.05, duration: 0.2 }}
        />
      ))}
    </svg>
  );
}
