"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CyberImageFrameProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * FUI targeting frame for images.
 * Adds extended corner brackets, edge tick marks, a data label,
 * and a one-shot horizontal scan line when the frame enters view.
 */
export default function CyberImageFrame({
  children,
  label = "IMG.DATA",
  className = "",
}: CyberImageFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const ARM = 16; // corner bracket arm length (px)
  const T   = 1;  // border thickness (px)

  const cornerStyle = (
    top: boolean,
    left: boolean
  ): React.CSSProperties => ({
    position: "absolute",
    width:  ARM,
    height: ARM,
    [top    ? "top"    : "bottom"]: -1,
    [left   ? "left"   : "right"]:  -1,
    borderColor: "#a8ff00",
    borderStyle: "solid",
    borderWidth: top && left  ? `${T+0.5}px 0 0 ${T+0.5}px`
               : top && !left ? `${T+0.5}px ${T+0.5}px 0 0`
               : !top && left ? `0 0 ${T+0.5}px ${T+0.5}px`
               :                `0 ${T+0.5}px ${T+0.5}px 0`,
    opacity: 0.85,
    pointerEvents: "none",
  });

  // 3 tick marks per horizontal edge (top & bottom)
  const ticks = [25, 50, 75];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}

      {/* ── Overlay frame ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        {/* Corners */}
        <span style={cornerStyle(true,  true)}  />
        <span style={cornerStyle(true,  false)} />
        <span style={cornerStyle(false, true)}  />
        <span style={cornerStyle(false, false)} />

        {/* Top edge ticks */}
        {ticks.map((pct) => (
          <span
            key={`t${pct}`}
            style={{
              position: "absolute",
              top: -1,
              left: `${pct}%`,
              width: 1,
              height: 5,
              background: "rgba(168,255,0,0.4)",
              transform: "translateX(-50%)",
            }}
          />
        ))}

        {/* Bottom edge ticks */}
        {ticks.map((pct) => (
          <span
            key={`b${pct}`}
            style={{
              position: "absolute",
              bottom: -1,
              left: `${pct}%`,
              width: 1,
              height: 5,
              background: "rgba(168,255,0,0.4)",
              transform: "translateX(-50%)",
            }}
          />
        ))}

        {/* Left edge ticks */}
        {[33, 66].map((pct) => (
          <span
            key={`l${pct}`}
            style={{
              position: "absolute",
              left: -1,
              top: `${pct}%`,
              width: 5,
              height: 1,
              background: "rgba(168,255,0,0.4)",
              transform: "translateY(-50%)",
            }}
          />
        ))}

        {/* Right edge ticks */}
        {[33, 66].map((pct) => (
          <span
            key={`r${pct}`}
            style={{
              position: "absolute",
              right: -1,
              top: `${pct}%`,
              width: 5,
              height: 1,
              background: "rgba(168,255,0,0.4)",
              transform: "translateY(-50%)",
            }}
          />
        ))}

        {/* Bottom-left data label */}
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            fontFamily: "monospace",
            fontSize: 8,
            letterSpacing: "0.18em",
            color: "rgba(168,255,0,0.45)",
            lineHeight: 1,
          }}
        >
          {label}
        </span>

        {/* Top-right status dot */}
        <span
          style={{
            position: "absolute",
            top: 9,
            right: 10,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#a8ff00",
            opacity: 0.55,
            boxShadow: "0 0 6px rgba(168,255,0,0.8)",
          }}
        />

        {/* One-shot scan line */}
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={inView ? { y: "110%", opacity: [0, 0.6, 0.6, 0] } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 3,
            background:
              "linear-gradient(to bottom, transparent, rgba(168,255,0,0.35) 50%, transparent)",
            filter: "blur(1px)",
          }}
        />
      </div>
    </div>
  );
}
