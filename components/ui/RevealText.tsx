"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
  scan?: boolean; // show green scan line before content appears
}

export default function RevealText({
  children,
  className = "",
  delay = 0,
  direction = "up",
  scan = false,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  const initial =
    prefersReducedMotion || direction === "none"
      ? { opacity: 0 }
      : direction === "left"
        ? { opacity: 0, x: -30 }
        : { opacity: 0, y: 28 };

  const animate = isInView
    ? prefersReducedMotion || direction === "none"
      ? { opacity: 1 }
      : direction === "left"
        ? { opacity: 1, x: 0 }
        : { opacity: 1, y: 0 }
    : initial;

  const contentDelay = scan ? delay + 0.35 : delay;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Optional scan line that sweeps across before content appears */}
      {scan && isInView && !prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left pointer-events-none z-10"
          style={{ background: "linear-gradient(to right, transparent, #a8ff00, transparent)" }}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
        />
      )}
      <motion.div
        initial={initial}
        animate={animate}
        transition={{
          duration: 0.6,
          delay: contentDelay,
          ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
