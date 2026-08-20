"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BootScreen from "@/components/ui/BootScreen";

// useLayoutEffect warns during SSR; fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function isAlreadyBooted() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.booted === "1";
}

/**
 * Gates the rendering of the entire page behind the boot sequence.
 * - New visitors: boot screen runs, content mounts only after it finishes.
 * - Returning visitors: content mounts immediately (detected via the inline
 *   <head> script that stamps data-booted on <html>).
 * - prefers-reduced-motion: content mounts immediately, no boot screen.
 */
export default function BootWrapper({ children }: { children: React.ReactNode }) {
  // Starts false so the client's first render matches the server's. Returning
  // visitors are switched on in a layout effect, which runs before paint — so
  // they still see no boot screen, without a hydration mismatch.
  const [booted, setBooted] = useState(false);

  useIsoLayoutEffect(() => {
    if (isAlreadyBooted()) setBooted(true);
  }, []);

  return (
    <>
      {/* Boot screen — manages its own visibility */}
      <BootScreen onDone={() => setBooted(true)} />

      {/* Page content — only mounts after boot sequence completes */}
      <AnimatePresence>
        {booted && (
          <motion.div
            key="page-content"
            // Positioned, not static: Hero's useScroll walks the offsetParent
            // chain and warns if this wrapper breaks it.
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
