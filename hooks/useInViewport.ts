"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True while the referenced element intersects the viewport.
 *
 * Canvas animations run on requestAnimationFrame, which the browser only
 * throttles for backgrounded *tabs* — a canvas scrolled out of sight in a
 * foreground tab keeps drawing every frame at full cost. Gating the rAF loop
 * on this hook is what stops the Hero city from rendering while the visitor is
 * reading Projects.
 *
 * `margin` grows the observed box so the loop restarts slightly before the
 * element scrolls back in and the first visible frame is already current.
 */
export function useInViewport(
  ref: RefObject<Element | null>,
  margin = "200px",
): boolean {
  // Starts true so the first paint is never gated behind an observer callback
  // that has not fired yet — an element in view would otherwise flash empty.
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without IntersectionObserver the effect never gates: always-on is the
    // correct fallback, since a permanently-false gate would show nothing.
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return inView;
}
