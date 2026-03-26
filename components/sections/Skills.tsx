"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";

// ─── Module data ──────────────────────────────────────────────────────────────

type Level = "EXPERT" | "ADV" | "PRO" | "JNR";

interface Module {
  id: string;
  name: string;
  pct: number;
  category: "FRONTEND" | "FRAMEWORKS" | "TOOLS";
}

const MODULES: Module[] = [
  // FRONTEND
  { id: "M.001", name: "HTML5",       pct: 92, category: "FRONTEND"   },
  { id: "M.002", name: "CSS3",        pct: 90, category: "FRONTEND"   },
  { id: "M.003", name: "JavaScript",  pct: 85, category: "FRONTEND"   },
  { id: "M.004", name: "TypeScript",  pct: 82, category: "FRONTEND"   },
  // FRAMEWORKS
  { id: "M.005", name: "React",       pct: 90, category: "FRAMEWORKS" },
  { id: "M.006", name: "Next.js",     pct: 80, category: "FRAMEWORKS" },
  { id: "M.007", name: "Vite",        pct: 72, category: "FRAMEWORKS" },
  // TOOLS
  { id: "M.008", name: "Figma",       pct: 78, category: "TOOLS"      },
  { id: "M.009", name: "Git",         pct: 83, category: "TOOLS"      },
  { id: "M.010", name: "Jira",        pct: 68, category: "TOOLS"      },
  { id: "M.011", name: "Confluence",  pct: 65, category: "TOOLS"      },
  { id: "M.012", name: "ThingsBoard", pct: 78, category: "TOOLS"      },
];

const CATEGORIES: Array<{ key: Module["category"]; label: string }> = [
  { key: "FRONTEND",   label: "PKG: FRONTEND" },
  { key: "FRAMEWORKS", label: "PKG: FRAMEWORKS" },
  { key: "TOOLS",      label: "PKG: TOOLS" },
];

function getLevel(pct: number): Level {
  if (pct >= 88) return "EXPERT";
  if (pct >= 78) return "ADV";
  if (pct >= 68) return "PRO";
  return "JNR";
}

// All levels use the portfolio neon-green / mono palette — no per-tech colors
const LEVEL_STYLE: Record<Level, { color: string; border: string }> = {
  EXPERT: { color: "#a8ff00",              border: "rgba(168,255,0,0.45)" },
  ADV:    { color: "rgba(168,255,0,0.65)", border: "rgba(168,255,0,0.2)"  },
  PRO:    { color: "#555555",              border: "#2a2a2a"               },
  JNR:    { color: "#333333",              border: "#1e1e1e"               },
};

// ─── Animated bar ─────────────────────────────────────────────────────────────

function ModuleRow({ mod, index }: { mod: Module; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const level = getLevel(mod.pct);
  const ls = LEVEL_STYLE[level];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="grid items-center gap-3 sm:gap-4"
      style={{ gridTemplateColumns: "3.5rem 7.5rem 1fr 2.8rem 4.5rem" }}
    >
      {/* Module ID */}
      <span className="font-mono text-[9px] tracking-[0.1em] text-[#333333] select-none">
        {mod.id}
      </span>

      {/* Name */}
      <span className="font-mono text-[11px] tracking-[0.15em] font-bold text-[#efefef] truncate">
        {mod.name.toUpperCase()}
      </span>

      {/* Bar track */}
      <div
        className="relative h-[6px] overflow-hidden"
        style={{ background: "rgba(168,255,0,0.06)" }}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 h-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${mod.pct}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.06 + 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ background: "#a8ff00", opacity: 0.8 }}
        />
        {/* CRT scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)",
          }}
        />
        {/* Glow tip */}
        <motion.div
          className="absolute top-0 h-full w-3"
          initial={{ left: 0, opacity: 0 }}
          animate={inView ? { left: `${mod.pct - 3}%`, opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1, delay: index * 0.06 + 0.15 }}
          style={{
            background: "linear-gradient(to right, transparent, rgba(168,255,0,0.9))",
            filter: "blur(2px)",
          }}
        />
      </div>

      {/* Percentage */}
      <span className="font-mono text-[10px] text-right tabular-nums text-[#555555]">
        {inView ? `${mod.pct}%` : "---"}
      </span>

      {/* Level badge */}
      <span
        className="font-mono text-[9px] tracking-[0.1em] text-center px-1.5 py-0.5 border"
        style={{ color: ls.color, borderColor: ls.border }}
      >
        {level}
      </span>
    </motion.div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix = "+", label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="font-mono text-4xl font-bold text-[#a8ff00]"
        style={{ textShadow: "0 0 20px rgba(168,255,0,0.4)" }}
      >
        {count}{suffix}
      </span>
      <span className="font-mono text-[10px] tracking-[0.2em] text-[#555555] uppercase text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const allInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="skills"
      className="relative py-28 px-6 bg-cyber-grid"
      aria-label="Skills and statistics"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText scan>
          <SectionLabel index="05" label="Skills" className="mb-10" />
        </RevealText>

        {/* Terminal header */}
        <RevealText delay={0.05}>
          <div className="mb-10 font-mono text-[10px] tracking-[0.15em] text-[#333333] space-y-1">
            <p>
              <span className="text-[#a8ff00]">&gt;</span> SCANNING TECH STACK...
            </p>
            <p>
              <span className="text-[#a8ff00]">&gt;</span> MODULES DETECTED:{" "}
              <span className="text-[#a8ff00]">{MODULES.length}</span> / LOADING...
            </p>
          </div>
        </RevealText>

        {/* Module groups */}
        <div ref={sectionRef} className="max-w-2xl space-y-10">
          {CATEGORIES.map((cat) => {
            const mods = MODULES.filter((m) => m.category === cat.key);
            return (
              <div key={cat.key}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#a8ff00]">
                    ──
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#555555]">
                    {cat.label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "#1e1e1e" }} />
                </div>

                {/* Module rows */}
                <div className="space-y-3">
                  {mods.map((mod, i) => (
                    <ModuleRow key={mod.id} mod={mod} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scan complete indicator */}
        <motion.div
          className="mt-8 font-mono text-[10px] tracking-[0.15em] max-w-2xl"
          initial={{ opacity: 0 }}
          animate={allInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: MODULES.length * 0.06 + 0.6 }}
        >
          <span className="text-[#a8ff00]">&gt;</span>{" "}
          <span className="text-[#333333]">ALL MODULES LOADED. STATUS:</span>{" "}
          <span className="text-[#a8ff00]">OK</span>
        </motion.div>

        {/* Stats strip */}
        <RevealText delay={0.2}>
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-10 border-t border-[#1e1e1e] pt-14">
            <StatItem value={2}  label="Years experience" />
            <StatItem value={4}  label="Projects shipped" />
            <StatItem value={3}  label="Enterprise clients" />
            <StatItem value={12} label="Technologies" />
          </div>
        </RevealText>
      </div>
    </section>
  );
}
