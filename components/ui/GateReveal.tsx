"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useInView, useAnimate, useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";

interface GateRevealProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Futuristic blast-door gate — 4-phase cinematic reveal on inView,
 * then toggles open/close on click.
 *
 * Open sequence (4 phases):
 *   0 (0–0.5s)    Progress bars fill
 *   1 (0.5s)      Seam flashes, status → "ACCESS GRANTED"
 *   2 (0.57–1.3s) Panels translate outward ±100%
 *   3 (1.3s+)     Scan line sweeps top→bottom
 *
 * Close sequence (on click when open):
 *   Panels slide back to x=0 with easeOut feel
 *   Seam + progress bars reset
 *   Status → "AUTHENTICATING"
 */
export default function GateReveal({
  children,
  className = "",
  label = "PROFILE.IMG",
}: GateRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-5%" });
  const prefersReduced = useReducedMotion();
  const [overlayScope, animate] = useAnimate();

  const [status, setStatus] = useState<"AUTHENTICATING" | "ACCESS GRANTED">(
    "AUTHENTICATING"
  );
  const [scanActive, setScanActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Guard against clicks during animation
  const animating = useRef(false);
  const didAutoOpen = useRef(false);

  // ── Shared open sequence ─────────────────────────────────────────────────
  const runOpen = useCallback(async () => {
    if (animating.current) return;
    animating.current = true;
    setScanActive(false);
    setStatus("AUTHENTICATING");

    // Reset panels to closed position instantly before animating
    animate(".gate-panel-l", { x: "0%" }, { duration: 0 });
    animate(".gate-panel-r", { x: "0%" }, { duration: 0 });
    animate(".gate-seam", { opacity: 0.5, width: 2 }, { duration: 0 });
    animate(".gate-progress", { scaleX: 0 }, { duration: 0 });

    // Small pause so the reset renders before animating
    await new Promise<void>((r) => setTimeout(r, 30));

    // Phase 0: progress bars fill
    await animate(
      ".gate-progress",
      { scaleX: 1 },
      { duration: 0.5, ease: "linear" }
    );

    // Phase 1: seam flash + status change
    animate(
      ".gate-seam",
      {
        width: 8,
        opacity: 1,
        boxShadow: "0 0 20px rgba(168,255,0,1), 0 0 50px rgba(168,255,0,0.6)",
      },
      { duration: 0.07 }
    );
    await new Promise<void>((r) => setTimeout(r, 80));
    setStatus("ACCESS GRANTED");

    // Phase 2: panels slide out + seam fades
    animate(".gate-seam", { opacity: 0, width: 2 }, { duration: 0.25 });
    animate(
      ".gate-panel-l",
      { x: "-100%" },
      { duration: 0.75, ease: [0.32, 0, 0.67, 0] }
    );
    await animate(
      ".gate-panel-r",
      { x: "100%" },
      { duration: 0.75, ease: [0.32, 0, 0.67, 0] }
    );

    // Phase 3: scan line
    setScanActive(true);
    setIsOpen(true);
    animating.current = false;
  }, [animate]);

  // ── Close sequence ───────────────────────────────────────────────────────
  const runClose = useCallback(async () => {
    if (animating.current) return;
    animating.current = true;
    setScanActive(false);
    setStatus("AUTHENTICATING");

    // Restore seam instantly
    animate(".gate-seam", { opacity: 0.5, width: 2 }, { duration: 0 });

    // Panels slide back in — easeOut so they decelerate like hitting the frame
    animate(
      ".gate-panel-l",
      { x: "0%" },
      { duration: 0.55, ease: [0.33, 1, 0.68, 1] }
    );
    await animate(
      ".gate-panel-r",
      { x: "0%" },
      { duration: 0.55, ease: [0.33, 1, 0.68, 1] }
    );

    // Reset progress bars after panels are closed
    animate(".gate-progress", { scaleX: 0 }, { duration: 0 });

    setIsOpen(false);
    animating.current = false;
  }, [animate]);

  // ── Auto-open on inView ───────────────────────────────────────────────────
  useEffect(() => {
    if (!inView || prefersReduced || didAutoOpen.current) return;
    didAutoOpen.current = true;
    runOpen();
  }, [inView, prefersReduced, runOpen]);

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleClick = () => {
    if (prefersReduced || !didAutoOpen.current) return;
    if (isOpen) {
      runClose();
    } else {
      runOpen();
    }
  };

  // Skip all animation for reduced motion
  if (prefersReduced) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  // ── Shared decoration styles ──────────────────────────────────────────────
  const hazardBand: React.CSSProperties = {
    height: 20,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(168,255,0,0.13) 0, rgba(168,255,0,0.13) 4px, transparent 4px, transparent 10px)",
  };

  const dotGrid: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle, rgba(168,255,0,0.07) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
  };

  const seamTicks = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  const statusColor =
    status === "ACCESS GRANTED"
      ? "rgba(168,255,0,0.75)"
      : "rgba(168,255,0,0.4)";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ cursor: didAutoOpen.current ? "pointer" : "default" }}
      role="button"
      aria-label={isOpen ? "Lock gate" : "Unlock gate"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* ── Revealed content ── */}
      {children}

      {/* ── Phase 3: post-reveal scan line ── */}
      {scanActive && (
        <motion.div
          key={String(scanActive)}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 3,
            background:
              "linear-gradient(to bottom, rgba(168,255,0,0.6), rgba(168,255,0,0.1))",
            filter: "blur(1px)",
            zIndex: 5,
            pointerEvents: "none",
          }}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      )}

      {/* ── Hint when open: small lock indicator ── */}
      {isOpen && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "monospace",
            fontSize: 7,
            letterSpacing: "0.2em",
            color: "rgba(168,255,0,0.35)",
            pointerEvents: "none",
            zIndex: 3,
            whiteSpace: "nowrap",
          }}
        >
          [ CLICK TO LOCK ]
        </motion.div>
      )}

      {/* ── Gate overlay ── */}
      <div
        ref={overlayScope}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 4 }}
      >
        {/* ── LEFT PANEL ── */}
        <div
          className="gate-panel-l"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "50%",
            background: "#080808",
            overflow: "hidden",
            borderRight: "1px solid rgba(168,255,0,0.2)",
          }}
        >
          <div style={dotGrid} />
          <div style={{ ...hazardBand, position: "absolute", top: 0, left: 0, right: 0 }} />
          <div style={{ ...hazardBand, position: "absolute", bottom: 0, left: 0, right: 0 }} />

          {/* Corner brackets */}
          <span style={{ position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: "1.5px solid rgba(168,255,0,0.55)", borderLeft: "1.5px solid rgba(168,255,0,0.55)" }} />
          <span style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: "1.5px solid rgba(168,255,0,0.55)", borderLeft: "1.5px solid rgba(168,255,0,0.55)" }} />

          {/* Seam ticks */}
          {seamTicks.map((pct) => (
            <span key={`lt${pct}`} style={{ position: "absolute", right: 0, top: `${pct}%`, width: 8, height: 1, background: "rgba(168,255,0,0.5)", transform: "translateY(-50%)" }} />
          ))}

          <span style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(168,255,0,0.35)", whiteSpace: "nowrap" }}>GATE-L</span>
          <span style={{ position: "absolute", top: 10, left: 28, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.1em", color: "rgba(168,255,0,0.25)", whiteSpace: "nowrap" }}>0x4A2F</span>

          {/* Progress bar */}
          <div style={{ position: "absolute", top: "42%", left: 16, right: 16, height: 2, background: "rgba(168,255,0,0.1)", transform: "translateY(-50%)" }}>
            <div className="gate-progress" style={{ position: "absolute", inset: 0, background: "rgba(168,255,0,0.65)", boxShadow: "0 0 5px rgba(168,255,0,0.5)", transformOrigin: "left center", transform: "scaleX(0)" }} />
          </div>

          <span style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 7, letterSpacing: "0.15em", color: statusColor, whiteSpace: "nowrap", transition: "color 0.15s" }}>
            {status === "AUTHENTICATING" ? "AUTHENTICATING..." : "ACCESS GRANTED"}
          </span>
          <span style={{ position: "absolute", bottom: 10, left: 12, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.18em", color: "rgba(168,255,0,0.28)", whiteSpace: "nowrap" }}>{label}</span>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="gate-panel-r"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "50%",
            background: "#080808",
            overflow: "hidden",
            borderLeft: "1px solid rgba(168,255,0,0.2)",
          }}
        >
          <div style={dotGrid} />
          <div style={{ ...hazardBand, position: "absolute", top: 0, left: 0, right: 0 }} />
          <div style={{ ...hazardBand, position: "absolute", bottom: 0, left: 0, right: 0 }} />

          {/* Corner brackets */}
          <span style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: "1.5px solid rgba(168,255,0,0.55)", borderRight: "1.5px solid rgba(168,255,0,0.55)" }} />
          <span style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: "1.5px solid rgba(168,255,0,0.55)", borderRight: "1.5px solid rgba(168,255,0,0.55)" }} />

          {/* Seam ticks */}
          {seamTicks.map((pct) => (
            <span key={`rt${pct}`} style={{ position: "absolute", left: 0, top: `${pct}%`, width: 8, height: 1, background: "rgba(168,255,0,0.5)", transform: "translateY(-50%)" }} />
          ))}

          <span style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(168,255,0,0.35)", whiteSpace: "nowrap" }}>GATE-R</span>
          <span style={{ position: "absolute", top: 10, right: 28, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.1em", color: "rgba(168,255,0,0.25)", whiteSpace: "nowrap" }}>0xB7E1</span>

          {/* Progress bar */}
          <div style={{ position: "absolute", top: "42%", left: 16, right: 16, height: 2, background: "rgba(168,255,0,0.1)", transform: "translateY(-50%)" }}>
            <div className="gate-progress" style={{ position: "absolute", inset: 0, background: "rgba(168,255,0,0.65)", boxShadow: "0 0 5px rgba(168,255,0,0.5)", transformOrigin: "left center", transform: "scaleX(0)" }} />
          </div>

          <span style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", fontFamily: "monospace", fontSize: 7, letterSpacing: "0.15em", color: statusColor, whiteSpace: "nowrap", transition: "color 0.15s" }}>
            {status === "AUTHENTICATING" ? "AUTHENTICATING..." : "ACCESS GRANTED"}
          </span>
          <span style={{ position: "absolute", bottom: 10, right: 12, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.18em", color: "rgba(168,255,0,0.28)", whiteSpace: "nowrap" }}>SYS.AUTH</span>
        </div>

        {/* ── CENTER SEAM GLOW ── */}
        <div
          className="gate-seam"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "calc(50% - 1px)",
            width: 2,
            background: "#a8ff00",
            opacity: 0.5,
            boxShadow: "0 0 8px rgba(168,255,0,0.7), 0 0 20px rgba(168,255,0,0.3)",
          }}
        />
      </div>
    </div>
  );
}
