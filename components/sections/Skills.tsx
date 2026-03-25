"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import { skills } from "@/lib/data";

// ─── Animated counter ────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * target));
      if (t < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
}

function StatItem({
  value,
  suffix = "+",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const { count, ref } = useCounter(value);
  return (
    <div className="text-center">
      <motion.span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="font-mono text-4xl font-bold text-[#a8ff00]"
        style={{ textShadow: "0 0 20px rgba(168,255,0,0.4)" }}
      >
        {count}
        {suffix}
      </motion.span>
      <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mt-2 uppercase">
        {label}
      </p>
    </div>
  );
}

// ─── Skill color map ──────────────────────────────────────────────────────────

const SKILL_COLORS: Record<string, string> = {
  React:        "#61dafb",
  TypeScript:   "#3178c6",
  "Next.js":    "#efefef",
  JavaScript:   "#f7df1e",
  HTML5:        "#e34f26",
  CSS3:         "#264de4",
  Vite:         "#646cff",
  Figma:        "#f24e1e",
  Git:          "#f05032",
  Jira:         "#0052cc",
  Confluence:   "#172b4d",
  ThingsBoard:  "#a8ff00",
};

// ─── Section ─────────────────────────────────────────────────────────────────

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Skills and statistics"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText scan>
          <SectionLabel index="05" label="Skills" className="mb-12" />
        </RevealText>

        {/* Tech badge grid */}
        <div className="flex flex-wrap gap-3 max-w-3xl">
          {skills.map((skill, i) => {
            const color = SKILL_COLORS[skill.name] ?? "#a8ff00";
            return (
              <motion.span
                key={skill.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ scale: 1.06 }}
                className="border px-4 py-2 font-mono text-[11px] tracking-[0.18em] cursor-default select-none"
                style={{
                  borderColor: "#1e1e1e",
                  color,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = color;
                  el.style.boxShadow = `0 0 14px ${color}33`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#1e1e1e";
                  el.style.boxShadow = "none";
                }}
              >
                {skill.name.toUpperCase()}
              </motion.span>
            );
          })}
        </div>

        {/* Stats strip */}
        <RevealText delay={0.2}>
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-10 border-t border-[#1e1e1e] pt-14">
            <StatItem value={1}  label="Years experience" />
            <StatItem value={4}  label="Projects shipped" />
            <StatItem value={3}  label="Enterprise clients" />
            <StatItem value={12} label="Technologies" />
          </div>
        </RevealText>
      </div>
    </section>
  );
}
