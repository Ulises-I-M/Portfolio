"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BootScreen from "@/components/ui/BootScreen";

function isAlreadyBooted() {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.booted === "1";
}

/**
 * Gates the rendering of the entire page behind the boot sequence.
 * - New visitors: boot screen runs, content mounts only after it finishes.
 * - Returning visitors: content mounts immediately (detected via inline <head> script).
 * - prefers-reduced-motion: content mounts immediately, no boot screen.
 */
export default function BootWrapper({ children }: { children: React.ReactNode }) {
  // Initialize as true for returning visitors so they see the page immediately.
  const [booted, setBooted] = useState(isAlreadyBooted);

  return (
    <>
      {/* Boot screen — manages its own visibility */}
      <BootScreen onDone={() => setBooted(true)} />

      {/* Page content — only mounts after boot sequence completes */}
      <AnimatePresence>
        {booted && (
          <motion.div
            key="page-content"
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
