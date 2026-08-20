"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ─── Boot sequence lines ──────────────────────────────────────────────────────
const LINES = [
  { text: "ULISES_MIRANDA.PORTFOLIO  //  SYSTEM v2.4.1",  accent: true  },
  { text: "────────────────────────────────────────────────────────────", accent: false },
  { text: "> LOADING NEURAL INTERFACE...            [ OK ]", accent: false },
  { text: "> MOUNTING PORTFOLIO DATA...             [ OK ]", accent: false },
  { text: "> ESTABLISHING SECURE CONNECTION...      [ OK ]", accent: false },
  { text: "> DECRYPTING PROJECT MANIFESTS...        [ OK ]", accent: false },
  { text: "> CALIBRATING HUD MODULES...             [ OK ]", accent: false },
  { text: "────────────────────────────────────────────────────────────", accent: false },
  { text: "ACCESS GRANTED — WELCOME, OPERATOR",             accent: true  },
];

const LINE_INTERVAL_MS = 210;
const HOLD_MS          = 500;
const EXIT_DURATION_MS = 600;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// useLayoutEffect warns during SSR; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function isReturningVisitor() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.booted === "1";
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onDone: () => void;
}

export default function BootScreen({ onDone }: Props) {
  const prefersReducedMotion = useReducedMotion();

  // Always starts visible so the client's first render matches the server's,
  // which keeps hydration clean. Returning visitors are hidden in a layout
  // effect below — that runs before paint, so they never see a flash.
  const [visible, setVisible]           = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);
  const [exiting, setExiting]           = useState(false);

  useIsoLayoutEffect(() => {
    if (isReturningVisitor() || prefersReducedMotion) {
      setVisible(false);
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Returning visitor or reduced motion: the layout effect already revealed
    // the page, so skip the sequence entirely.
    if (isReturningVisitor() || prefersReducedMotion) return;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);

      if (count >= LINES.length) {
        clearInterval(interval);
        setTimeout(() => {
          // Signal the page to start mounting/fading in
          onDone();
          // Fade boot screen out simultaneously
          setExiting(true);
          setTimeout(() => {
            setVisible(false);
            try { sessionStorage.setItem("booted", "1"); } catch (_) {}
          }, EXIT_DURATION_MS);
        }, HOLD_MS);
      }
    }, LINE_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      key="boot"
      data-boot-screen=""
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? EXIT_DURATION_MS / 1000 : 0, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-start justify-center px-8 sm:px-20"
      style={{ background: "#020402", pointerEvents: exiting ? "none" : "all" }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
        }}
      />

      {/* Corner accents */}
      {(["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-5 h-5`}
          style={{
            borderColor: "rgba(168,255,0,0.2)",
            borderStyle: "solid",
            borderWidth:
              pos === "top-4 left-4"    ? "1px 0 0 1px"
              : pos === "top-4 right-4"   ? "1px 1px 0 0"
              : pos === "bottom-4 left-4" ? "0 0 1px 1px"
              :                             "0 1px 1px 0",
          }}
        />
      ))}

      {/* System label */}
      <p className="relative z-10 mb-6 font-mono text-[10px] tracking-[0.3em] text-[#2a2a2a]">
        SYS_INIT // SECURE_BOOT
      </p>

      {/* Terminal lines */}
      <div className="relative z-10 font-mono text-xs sm:text-sm leading-7 max-w-2xl">
        {LINES.slice(0, visibleCount).map((line, i) => (
          <div
            key={i}
            style={{
              color: line.accent ? "#a8ff00" : "rgba(168,255,0,0.32)",
              textShadow: line.accent
                ? "0 0 14px rgba(168,255,0,0.65), 0 0 32px rgba(168,255,0,0.2)"
                : "none",
              letterSpacing: "0.07em",
            }}
          >
            {line.text}
          </div>
        ))}

        {/* Blinking cursor on active line */}
        {!exiting && visibleCount < LINES.length && (
          <span
            className="blink inline-block w-2 h-[1em] align-middle"
            style={{ background: "#a8ff00", marginLeft: 3, verticalAlign: "text-bottom" }}
          />
        )}
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-6 left-8 sm:left-20 right-8 z-10 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-[#1e1e1e]">
        <span>LOC: -34.6037, -58.3816</span>
        <span>
          {visibleCount < LINES.length
            ? `LOADING ${Math.round((visibleCount / LINES.length) * 100)}%`
            : "READY"}
        </span>
      </div>
    </motion.div>
  );
}
