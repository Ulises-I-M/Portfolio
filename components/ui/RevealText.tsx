"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface RevealTextProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "none";
}

export default function RevealText({
  children,
  className = "",
  delay = 0,
  direction = "up",
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

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
