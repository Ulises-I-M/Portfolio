"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface GateRevealProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Futuristic blast-door gate that covers content on mount,
 * then slides the two panels outward when the element enters view,
 * revealing whatever is underneath.
 */
export default function GateReveal({
  children,
  className = "",
  label = "PROFILE.IMG",
}: GateRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  // Tick positions along the inner (seam) edge of each panel
  const seamTicks = [15, 30, 45, 55, 70, 85];

  const panelBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    background: "#080808",
    overflow: "hidden",
  };

  const warningStripes: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent 0px, transparent 10px, rgba(168,255,0,0.025) 10px, rgba(168,255,0,0.025) 11px)",
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}

      {/* ── Gate overlay ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 4 }}
      >
        {/* Left panel */}
        <motion.div
          style={{
            ...panelBase,
            left: 0,
            width: "50%",
            transformOrigin: "left center",
            borderRight: "1px solid rgba(168,255,0,0.12)",
          }}
          initial={{ scaleX: 1 }}
          animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
          transition={{ duration: 0.75, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Diagonal warning fill */}
          <div style={warningStripes} />

          {/* Top-left corner bracket */}
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 14,
              height: 14,
              borderTop: "1.5px solid rgba(168,255,0,0.5)",
              borderLeft: "1.5px solid rgba(168,255,0,0.5)",
            }}
          />

          {/* Bottom-left corner bracket */}
          <span
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              width: 14,
              height: 14,
              borderBottom: "1.5px solid rgba(168,255,0,0.5)",
              borderLeft: "1.5px solid rgba(168,255,0,0.5)",
            }}
          />

          {/* Seam-side tick marks */}
          {seamTicks.map((pct) => (
            <span
              key={`lt${pct}`}
              style={{
                position: "absolute",
                right: 0,
                top: `${pct}%`,
                width: 6,
                height: 1,
                background: "rgba(168,255,0,0.35)",
                transform: "translateY(-50%)",
              }}
            />
          ))}

          {/* Status label — centered horizontally */}
          <span
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.18em",
              color: "rgba(168,255,0,0.4)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>

          {/* Blinking status dot */}
          <motion.span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#a8ff00",
              boxShadow: "0 0 6px rgba(168,255,0,0.8)",
            }}
            animate={inView ? {} : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Horizontal scan decoration */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(168,255,0,0.08) 40%, rgba(168,255,0,0.12) 60%, transparent)",
              transform: "translateY(-50%)",
            }}
          />
        </motion.div>

        {/* Right panel */}
        <motion.div
          style={{
            ...panelBase,
            right: 0,
            width: "50%",
            transformOrigin: "right center",
            borderLeft: "1px solid rgba(168,255,0,0.12)",
          }}
          initial={{ scaleX: 1 }}
          animate={inView ? { scaleX: 0 } : { scaleX: 1 }}
          transition={{ duration: 0.75, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Diagonal warning fill */}
          <div style={warningStripes} />

          {/* Top-right corner bracket */}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 14,
              height: 14,
              borderTop: "1.5px solid rgba(168,255,0,0.5)",
              borderRight: "1.5px solid rgba(168,255,0,0.5)",
            }}
          />

          {/* Bottom-right corner bracket */}
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 14,
              height: 14,
              borderBottom: "1.5px solid rgba(168,255,0,0.5)",
              borderRight: "1.5px solid rgba(168,255,0,0.5)",
            }}
          />

          {/* Seam-side tick marks */}
          {seamTicks.map((pct) => (
            <span
              key={`rt${pct}`}
              style={{
                position: "absolute",
                left: 0,
                top: `${pct}%`,
                width: 6,
                height: 1,
                background: "rgba(168,255,0,0.35)",
                transform: "translateY(-50%)",
              }}
            />
          ))}

          {/* Auth text */}
          <span
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.18em",
              color: "rgba(168,255,0,0.4)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            AUTHENTICATING
          </span>

          {/* Horizontal scan decoration */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(to left, transparent, rgba(168,255,0,0.08) 40%, rgba(168,255,0,0.12) 60%, transparent)",
              transform: "translateY(-50%)",
            }}
          />
        </motion.div>

        {/* Center seam glow — flares then fades as the gate opens */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "calc(50% - 1px)",
            width: 2,
            background: "#a8ff00",
            boxShadow: "0 0 8px rgba(168,255,0,0.9), 0 0 20px rgba(168,255,0,0.4)",
          }}
          initial={{ opacity: 0.6 }}
          animate={inView ? { opacity: [0.6, 1, 0] } : { opacity: 0.6 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
