"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const CHARS = "!<>-_\\/[]{}=+*^?#@%$&";

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders text that randomly scrambles (glitches) then resolves back.
 * Auto-triggers every 5-9s and also on hover.
 */
export default function GlitchText({ text, className, style }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const glitch = useCallback(() => {
    if (activeRef.current || prefersReducedMotion) return;
    activeRef.current = true;
    let iter = 0;
    const total = text.length * 3;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < iter / 3) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iter++;
      if (iter > total) {
        clearInterval(intervalRef.current!);
        setDisplay(text);
        activeRef.current = false;
      }
    }, 35);
  }, [text, prefersReducedMotion]);

  // Auto-glitch every 5-9s
  useEffect(() => {
    if (prefersReducedMotion) return;
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
  }, [glitch, prefersReducedMotion]);

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={glitch}
      aria-label={text}
    >
      {display}
    </span>
  );
}
