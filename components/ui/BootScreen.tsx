"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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

const LINE_INTERVAL_MS = 210; // ms between each line appearing
const HOLD_MS          = 520; // pause after last line before exit
const EXIT_DURATION_MS = 650; // fade-out duration

// ─── Component ────────────────────────────────────────────────────────────────
export default function BootScreen() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible]         = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [exiting, setExiting]         = useState(false);

  useEffect(() => {
    // Skip on reduced motion or if already shown this session
    if (prefersReducedMotion) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("booted")) return;

    setVisible(true);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= LINES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem("booted", "1");
          }, EXIT_DURATION_MS);
        }, HOLD_MS);
      }
    }, LINE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: exiting ? EXIT_DURATION_MS / 1000 : 0, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-start justify-center px-8 sm:px-20"
          style={{ background: "#020402" }}
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
              zIndex: 1,
            }}
          />

          {/* Corner crosshairs */}
          {(["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"] as const).map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-5 h-5`}
              style={{
                borderColor: "rgba(168,255,0,0.25)",
                borderStyle: "solid",
                borderWidth: pos.includes("top") && pos.includes("left")   ? "1px 0 0 1px"
                           : pos.includes("top") && pos.includes("right")  ? "1px 1px 0 0"
                           : pos.includes("bottom") && pos.includes("left")? "0 0 1px 1px"
                           :                                                  "0 1px 1px 0",
              }}
            />
          ))}

          {/* System label */}
          <div
            className="relative z-10 mb-6 font-mono text-[10px] tracking-[0.3em] text-[#333333]"
          >
            SYS_INIT // SECURE_BOOT
          </div>

          {/* Terminal lines */}
          <div className="relative z-10 font-mono text-xs sm:text-sm leading-7 max-w-2xl">
            {LINES.slice(0, visibleCount).map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.accent ? "#a8ff00" : "rgba(168,255,0,0.35)",
                  textShadow: line.accent
                    ? "0 0 12px rgba(168,255,0,0.7), 0 0 30px rgba(168,255,0,0.25)"
                    : "none",
                  letterSpacing: "0.08em",
                }}
              >
                {line.text}
              </div>
            ))}

            {/* Blinking cursor on the active line */}
            {!exiting && visibleCount < LINES.length && (
              <span
                className="inline-block w-2 h-4 align-middle blink"
                style={{ background: "#a8ff00", marginLeft: 2 }}
              />
            )}
          </div>

          {/* Bottom status bar */}
          <div
            className="absolute bottom-6 left-8 sm:left-20 right-8 z-10 flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-[#222222]"
          >
            <span>LOC: -34.6037, -58.3816</span>
            <span>
              {visibleCount < LINES.length
                ? `LOADING... ${Math.round((visibleCount / LINES.length) * 100)}%`
                : "READY"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
