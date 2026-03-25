"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-[150] w-10 h-10 flex items-center justify-center font-mono text-xs text-[#555555] bg-[#0a0a0a] border border-[#1e1e1e] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-all duration-200 cursor-pointer"
          style={{ letterSpacing: "0" }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
