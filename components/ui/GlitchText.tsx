"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLowPower } from "@/hooks/useLowPower";

const CHARS = "!<>-_\\/[]{}=+*^?#@%$&";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const letterVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animates each letter in with a stagger on mount (SplitText effect),
 * then periodically scrambles and resolves the characters (glitch effect).
 * Also glitches on hover.
 */
export default function GlitchText({ text, className, style }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  // chars tracks the displayed characters — may differ from text during glitch
  const [chars, setChars] = useState<string[]>(text.split(""));
  const [mounted, setMounted] = useState(false);
  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const glitch = useCallback(() => {
    if (activeRef.current || prefersReducedMotion || lowPower || !mounted) return;
    activeRef.current = true;
    let iter = 0;
    const total = text.length * 3;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setChars(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (i < iter / 3) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
      );
      iter++;
      if (iter > total) {
        clearInterval(intervalRef.current!);
        setChars(text.split(""));
        activeRef.current = false;
      }
    }, 35);
  }, [text, prefersReducedMotion, mounted]);

  // Auto-glitch every 5-9s (only after entry animation completes; skipped on low-power)
  useEffect(() => {
    if (prefersReducedMotion || lowPower || !mounted) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(
        () => { glitch(); schedule(); },
        5000 + Math.random() * 4000
      );
    };
    schedule();
    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current!);
    };
  }, [glitch, prefersReducedMotion, lowPower, mounted]);

  if (prefersReducedMotion) {
    return (
      <span className={className} style={style} aria-label={text}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className ?? ""}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      aria-label={text}
      onMouseEnter={glitch}
      // Mark as mounted once all letters have finished their entry animation
      onAnimationComplete={() => setMounted(true)}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          aria-hidden="true"
          className={char === " " ? "w-[0.4em]" : ""}
          style={style}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
