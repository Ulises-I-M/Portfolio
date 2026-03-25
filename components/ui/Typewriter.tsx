"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface Props {
  phrases: string[];
  speed?: number;       // ms per character typed
  deleteSpeed?: number; // ms per character deleted
  pauseMs?: number;     // ms to pause on complete phrase
  className?: string;
}

/**
 * Types through a list of phrases one character at a time,
 * then deletes and moves to the next. Shows a blinking cursor.
 */
export default function Typewriter({
  phrases,
  speed = 75,
  deleteSpeed = 35,
  pauseMs = 2200,
  className,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(
    prefersReducedMotion ? phrases[0] : ""
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const current = phrases[phraseIdx];
    let t: ReturnType<typeof setTimeout>;

    if (typing) {
      if (displayed.length < current.length) {
        t = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          speed
        );
      } else {
        t = setTimeout(() => setTyping(false), pauseMs);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          deleteSpeed
        );
      } else {
        setPhraseIdx((i) => (i + 1) % phrases.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, typing, phraseIdx, phrases, speed, deleteSpeed, pauseMs, prefersReducedMotion]);

  return (
    <span className={className}>
      {displayed}
      <span
        className="blink inline-block w-[2px] bg-[#a8ff00] ml-0.5 align-middle"
        style={{ height: "1em" }}
        aria-hidden="true"
      />
    </span>
  );
}
