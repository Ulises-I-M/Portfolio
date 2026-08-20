"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import NoiseTerrainCanvas from "@/components/ui/NoiseTerrainCanvas";
import GlitchText from "@/components/ui/GlitchText";
import Crosshair from "@/components/ui/Crosshair";
import WarningBadge from "@/components/ui/WarningBadge";
import BarcodeIndicator from "@/components/ui/BarcodeIndicator";
import ChevronCluster from "@/components/ui/ChevronCluster";
import { useLang } from "@/context/LangContext";

const LINE_INTERVAL_MS = 260;

export default function NotFound() {
  const { tr } = useLang();
  const prefersReducedMotion = useReducedMotion();
  const log = tr.notFound.log;

  // Trace log types itself out. BootScreen is deliberately not reused here:
  // its line reveal is entangled with the boot gate — sessionStorage, the exit
  // fade, the onDone callback, returning-visitor detection. Generalising it for
  // a screen that only needs "reveal lines on an interval" would saddle it with
  // two jobs; the loop below is cheaper than that coupling.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShown(log.length);
      return;
    }
    setShown(0);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= log.length) clearInterval(id);
    }, LINE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion, log.length]);

  const fadeIn = (delay: number) => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.55,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  });

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden bg-grid"
      aria-label={`${tr.notFound.code} — ${tr.notFound.title}`}
    >
      {/* Wireframe terrain rather than the Hero's city: this is meant to read as
          somewhere off the map, not as home. */}
      <NoiseTerrainCanvas />

      {/* HUD furniture */}
      {(["top-8 left-8", "top-8 right-8", "bottom-8 left-8", "bottom-8 right-8"] as const).map(
        (pos, i) => (
          <motion.div
            key={pos}
            aria-hidden="true"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.5, delay: 0.08 + i * 0.04 }}
            className={`absolute ${pos}`}
          >
            <Crosshair size={20} />
          </motion.div>
        )
      )}

      <motion.div
        aria-hidden="true"
        initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute bottom-28 right-8 hidden md:flex flex-col items-end gap-2 font-mono text-[10px] text-[#555555] tracking-[0.15em]"
      >
        <BarcodeIndicator bars={24} maxHeight={32} />
        <span className="text-[#222222]">ROUTE: UNRESOLVED</span>
        <span className="text-[#222222]">0xERR.404</span>
      </motion.div>

      <div className="relative mx-auto w-full max-w-7xl px-6 py-28" style={{ zIndex: 1 }}>
        {/* Counter */}
        <motion.p
          {...fadeIn(0.1)}
          className="mb-6 font-mono text-xs tracking-[0.25em] text-[#555555] flex items-center gap-2"
        >
          <span
            className="w-1.5 h-1.5 rounded-full hud-pulse"
            style={{ background: "rgba(255,50,50,0.8)" }}
            aria-hidden="true"
          />
          <span className="text-[#333333]">[</span>
          <span style={{ color: "rgba(255,50,50,0.85)" }}>ERR</span>
          <span className="text-[#333333]">]</span>
          <span className="text-[#222222]">——</span> {tr.notFound.status}
        </motion.p>

        {/* Error code — real text in a heading, so it is announced, not decoration */}
        <motion.div {...fadeIn(0.2)}>
          <h1
            className="font-mono font-bold leading-none tracking-tight mb-2"
            style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", lineHeight: 1 }}
          >
            <span className="block text-[#efefef]">
              <GlitchText text={tr.notFound.code} />
            </span>
          </h1>
        </motion.div>

        <motion.div {...fadeIn(0.35)} className="mt-4 flex items-center gap-4 flex-wrap">
          <h2 className="font-mono text-sm md:text-base tracking-[0.2em] text-[#555555] uppercase">
            {tr.notFound.title}
          </h2>
          <WarningBadge label={tr.notFound.status} level="alert" pulse />
        </motion.div>

        <motion.hr {...fadeIn(0.45)} className="neon-rule my-8 max-w-xs" />

        {/* Trace log */}
        <div
          className="font-mono text-xs leading-7 min-h-[7rem]"
          role="status"
          aria-live="polite"
        >
          {log.slice(0, shown).map((line, i) => (
            <div
              key={i}
              style={{
                color: line.includes("FAIL") || line.includes("NULL") || line.includes("FALLO") || line.includes("NULO")
                  ? "rgba(255,50,50,0.75)"
                  : "rgba(168,255,0,0.32)",
                letterSpacing: "0.07em",
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <motion.p
          {...fadeIn(0.6)}
          className="font-mono text-sm leading-relaxed text-[#aaaaaa] max-w-md mt-6"
        >
          {tr.notFound.body}
        </motion.p>

        {/* Way out */}
        <motion.div {...fadeIn(0.75)} className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-[#a8ff00] px-6 py-3 font-mono text-xs tracking-[0.2em] text-[#a8ff00] transition-all duration-200 hover:bg-[#a8ff00] hover:text-[#0a0a0a] cursor-pointer focus-visible:outline focus-visible:outline-[#a8ff00] chamfered-sm"
          >
            {tr.notFound.cta}
            <ChevronCluster count={3} size={8} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
