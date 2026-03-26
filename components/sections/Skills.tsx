"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import PanelFrame from "@/components/ui/PanelFrame";
import DialGauge from "@/components/ui/DialGauge";

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

const CATEGORIES: Array<{ key: Module["category"]; label: string; status: string }> = [
  { key: "FRONTEND",   label: "PKG: FRONTEND",   status: "4 MODULES" },
  { key: "FRAMEWORKS", label: "PKG: FRAMEWORKS",  status: "3 MODULES" },
  { key: "TOOLS",      label: "PKG: TOOLS",       status: "5 MODULES" },
];

function getLevel(pct: number): Level {
  if (pct >= 88) return "EXPERT";
  if (pct >= 78) return "ADV";
  if (pct >= 68) return "PRO";
  return "JNR";
}

const LEVEL_STYLE: Record<Level, { color: string; border: string }> = {
  EXPERT: { color: "#a8ff00",              border: "rgba(168,255,0,0.45)" },
  ADV:    { color: "rgba(168,255,0,0.65)", border: "rgba(168,255,0,0.2)"  },
  PRO:    { color: "#555555",              border: "#2a2a2a"               },
  JNR:    { color: "#333333",              border: "#1e1e1e"               },
};

// ─── Module bar row ────────────────────────────────────────────────────────────

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

      {/* Bar track — with diagonal hatch background */}
      <div
        className="relative overflow-hidden hatch"
        style={{ background: "rgba(168,255,0,0.04)", height: 8 }}
      >
        {/* Parallelogram fill — skewX creates angled leading/trailing edges */}
        <motion.div
          className="absolute inset-y-0 left-[-8px]"
          initial={{ width: 0 }}
          animate={inView ? { width: `calc(${mod.pct}% + 8px)` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.06 + 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: "#a8ff00",
            opacity: 0.85,
            transform: "skewX(-12deg)",
            transformOrigin: "left center",
          }}
        />
        {/* CRT scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(0,0,0,0.25) 1px, rgba(0,0,0,0.25) 2px)",
          }}
        />
        {/* Glow tip */}
        <motion.div
          className="absolute top-0 h-full w-4"
          initial={{ left: 0, opacity: 0 }}
          animate={inView ? { left: `${mod.pct - 4}%`, opacity: [0, 1, 0] } : {}}
          transition={{ duration: 1, delay: index * 0.06 + 0.15 }}
          style={{
            background: "linear-gradient(to right, transparent, rgba(168,255,0,0.9))",
            filter: "blur(2px)",
            transform: "skewX(-12deg)",
          }}
        />
      </div>

      {/* Percentage */}
      <span className="font-mono text-[10px] text-right tabular-nums text-[#555555]">
        {inView ? `${mod.pct}%` : "---"}
      </span>

      {/* Level badge — chamfered */}
      <span
        className="font-mono text-[9px] tracking-[0.1em] text-center px-1.5 py-0.5 border chamfered-sm"
        style={{ color: ls.color, borderColor: ls.border }}
      >
        {level}
      </span>
    </motion.div>
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

        {/* Module groups — each wrapped in PanelFrame */}
        <div ref={sectionRef} className="max-w-2xl space-y-8">
          {CATEGORIES.map((cat) => {
            const mods = MODULES.filter((m) => m.category === cat.key);
            return (
              <PanelFrame key={cat.key} label={cat.label} status={cat.status}>
                <div className="space-y-3 pt-2">
                  {mods.map((mod, i) => (
                    <ModuleRow key={mod.id} mod={mod} index={i} />
                  ))}
                </div>
              </PanelFrame>
            );
          })}
        </div>

        {/* Scan complete */}
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

        {/* Stats strip — dial gauges row */}
        <RevealText delay={0.2}>
          <div className="mt-20 border-t border-[#1e1e1e] pt-10">
            <p className="font-mono text-[9px] tracking-[0.25em] text-[#333333] mb-6">
              <span className="text-[#a8ff00]">&gt;</span> SYS.STATS // DIAL_READOUT
            </p>
            <div className="flex flex-wrap justify-between gap-6 max-w-2xl">
              <DialGauge value={75}  displayValue="2+"  label="Years Exp."       size={90} />
              <DialGauge value={85}  displayValue="4+"  label="Projects"          size={90} />
              <DialGauge value={65}  displayValue="3+"  label="Clients"           size={90} />
              <DialGauge value={92}  displayValue="12+" label="Technologies"      size={90} />
            </div>
          </div>
        </RevealText>
      </div>
    </section>
  );
}
