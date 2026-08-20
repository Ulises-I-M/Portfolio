"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionLabelProps {
  index: string;
  label: string;
  className?: string;
}

export default function SectionLabel({
  index,
  label,
  className = "",
}: SectionLabelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] ${className}`}
    >
      {/* Scanning dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: inView ? "#a8ff00" : "#333333",
          boxShadow: inView ? "0 0 8px rgba(168,255,0,0.6)" : "none",
          transition: "all 0.4s",
        }}
      />

      {/* Index with brackets */}
      <span className="text-[#333333] flex-shrink-0">[</span>
      <span className="text-[#a8ff00] -mx-1.5">{index}</span>
      <span className="text-[#333333] flex-shrink-0">]</span>

      {/* Animated line */}
      <motion.span
        className="h-px bg-[#a8ff00] flex-shrink-0"
        initial={{ width: 0, opacity: 0 }}
        animate={inView ? { width: 32, opacity: 0.4 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="text-[#555555] uppercase">{label}</span>

      {/* Extended circuit line */}
      <motion.span
        className="hidden sm:block h-px flex-1 max-w-[120px]"
        initial={{ width: 0, opacity: 0 }}
        animate={inView ? { width: "100%", opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          background: "linear-gradient(to right, rgba(168,255,0,0.15), transparent)",
        }}
        aria-hidden="true"
      />

      {/* System coordinate */}
      <motion.span
        className="hidden sm:block font-mono text-[7px] tracking-[0.15em] text-[#222222] flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        SYS.{index}
      </motion.span>
    </div>
  );
}
