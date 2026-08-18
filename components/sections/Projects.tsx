"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import GrainEffect from "@/components/ui/GrainEffect";
import HUDCardFrame from "@/components/ui/HUDCardFrame";
import GateTransition from "@/components/ui/GateTransition";
import { useLowPower } from "@/hooks/useLowPower";
import { projects, type Project } from "@/lib/data";
import { useLang } from "@/context/LangContext";
import type { Lang } from "@/lib/i18n";

// ─── Project Detail Modal ────────────────────────────────────────────────────

function ProjectModal({ project, onClose, lang }: { project: Project; onClose: () => void; lang: Lang }) {
  const { tr } = useLang();

  return (
    <motion.div
      key="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1e1e1e] overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(168,255,0,0.08)" }}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-[#111111]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            style={{ filter: "grayscale(0.2) contrast(1.05)" }}
            sizes="(max-width: 768px) 100vw, 672px"
          />
          {/* Neon tint */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(168,255,0,0.06) 0%, transparent 60%)" }}
          />
          <GrainEffect />
          {/* HUD corners */}
          {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              className={`absolute ${pos} w-4 h-4`}
              style={{
                borderColor: "#a8ff00",
                borderStyle: "solid",
                borderWidth:
                  idx === 0 ? "1px 0 0 1px"
                  : idx === 1 ? "1px 1px 0 0"
                  : idx === 2 ? "0 0 1px 1px"
                  : "0 1px 1px 0",
                opacity: 0.7,
              }}
            />
          ))}
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#0a0a0a]/80 border border-[#1e1e1e] font-mono text-xs text-[#555555] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-all duration-200 cursor-pointer z-10"
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="font-mono font-bold text-lg text-[#efefef] tracking-tight uppercase">
              {project.title}
            </h3>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 border border-[#a8ff00] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-[#a8ff00] hover:bg-[#a8ff00] hover:text-[#0a0a0a] transition-all duration-200 cursor-pointer"
            >
              {tr.projects.visit}
            </a>
          </div>

          <p className="font-mono text-sm text-[#555555] leading-loose mb-5">
            {lang === "es" && project.descriptionEs ? project.descriptionEs : project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#a8ff00] px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[#a8ff00]"
                style={{ opacity: 0.7 }}
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onSelect,
  lang,
}: {
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
  lang: Lang;
}) {
  const [hovered, setHovered] = useState(false);
  const { tr } = useLang();
  const prefersReducedMotion = useReducedMotion();
  const lowPower = useLowPower();

  // ── 3D tilt ────────────────────────────────────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX    = useMotionValue(0);
  const rotY    = useMotionValue(0);
  const springRotX = useSpring(rotX, { stiffness: 160, damping: 20 });
  const springRotY = useSpring(rotY, { stiffness: 160, damping: 20 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || lowPower) return;
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = ((e.clientX - left) / width  - 0.5) * 2; // –1 → 1
    const dy = ((e.clientY - top)  / height - 0.5) * 2;
    rotX.set(-dy * 5); // max ±5 °
    rotY.set( dx * 5);
  };

  const onMouseLeaveCard = () => {
    rotX.set(0);
    rotY.set(0);
  };

  // ── Derived dossier metadata ──────────────────────────────────────────────
  const idx = String(index + 1).padStart(3, "0");
  const typeTag = (project.tags[0] ?? "WEB")
    .toUpperCase()
    .replace(/\s+/g, ".")
    .slice(0, 10);
  const hexId = `0x${project.title
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0")}`;

  return (
    // ── Outer wrapper — NOT clipped, holds chamfer accents ─────────────────
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="relative"
      style={
        prefersReducedMotion || lowPower
          ? {}
          : { rotateX: springRotX, rotateY: springRotY, transformPerspective: 900 }
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); onMouseLeaveCard(); }}
      onMouseMove={onMouseMove}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {/* ── SVG HUD frame (drawn outside the clipped article) ─────────────── */}
      <HUDCardFrame hovered={hovered} />

      {/* ── Card body — clipped to chamfered-all shape ────────────────────── */}
      <article
        className="relative overflow-hidden cursor-pointer chamfered-all"
        onClick={() => onSelect(project)}
        style={{
          filter: hovered
            ? "drop-shadow(0 0 14px rgba(168,255,0,0.12))"
            : "none",
        }}
      >
        {/* ── Left accent line ─────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            zIndex: 10,
            background: hovered ? "#a8ff00" : "rgba(168,255,0,0.18)",
            boxShadow: hovered
              ? "0 0 8px rgba(168,255,0,0.6), 0 0 20px rgba(168,255,0,0.2)"
              : "none",
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        />

        {/* ── Right edge tick marks ─────────────────────────────────────── */}
        {[25, 50, 75].map((pct) => (
          <span
            key={pct}
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: `${pct}%`,
              width: pct === 50 ? 8 : 5,
              height: 1,
              background: hovered ? "rgba(168,255,0,0.4)" : "rgba(168,255,0,0.15)",
              transform: "translateY(-50%)",
              transition: "background 0.3s, width 0.3s",
              zIndex: 10,
            }}
          />
        ))}

        {/* ── Hover scan line (full-card sweep) ────────────────────────── */}
        {hovered && (
          <motion.div
            key="card-scan"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 3,
              background:
                "linear-gradient(to bottom, transparent, rgba(168,255,0,0.22) 50%, transparent)",
              filter: "blur(1px)",
              zIndex: 15,
              pointerEvents: "none",
            }}
            initial={{ top: -4, opacity: 0 }}
            animate={{ top: "105%", opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: 1.8,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          />
        )}

        {/* ── Header strip ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            background: "#0d0d0d",
            borderBottom: `1px solid ${hovered ? "rgba(168,255,0,0.15)" : "rgba(168,255,0,0.06)"}`,
            height: 28,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 12,
            gap: 8,
            transition: "border-color 0.3s",
          }}
        >
          {/* Index */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.22em",
              color: hovered ? "rgba(168,255,0,0.7)" : "rgba(168,255,0,0.4)",
              flexShrink: 0,
              transition: "color 0.3s",
            }}
          >
            PRJ-{idx}
          </span>

          {/* Separator rule */}
          <span
            style={{
              flex: 1,
              height: 1,
              background: hovered
                ? "rgba(168,255,0,0.12)"
                : "rgba(168,255,0,0.05)",
              transition: "background 0.3s",
            }}
          />

          {/* Type badge */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.14em",
              color: hovered ? "rgba(168,255,0,0.6)" : "rgba(168,255,0,0.28)",
              flexShrink: 0,
              border: `1px solid ${hovered ? "rgba(168,255,0,0.3)" : "rgba(168,255,0,0.1)"}`,
              padding: "1px 6px",
              transition: "color 0.3s, border-color 0.3s",
            }}
          >
            {typeTag}
          </span>

          {/* Status dot */}
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              flexShrink: 0,
              background: hovered ? "#a8ff00" : "rgba(168,255,0,0.35)",
              boxShadow: hovered
                ? "0 0 6px rgba(168,255,0,0.9)"
                : "0 0 3px rgba(168,255,0,0.25)",
              animation: "hud-pulse 2s ease-in-out infinite",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
        </div>

        {/* ── Image ────────────────────────────────────────────────────── */}
        <div className="relative aspect-video overflow-hidden bg-[#111111]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-all duration-700"
            style={{
              filter: hovered
                ? "grayscale(0) contrast(1.05)"
                : "grayscale(0.75) contrast(1)",
              animation: hovered ? "ken-burns 8s ease-in-out infinite" : "none",
              transformOrigin: "center center",
            }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Neon tint */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(168,255,0,0.07) 0%, transparent 55%)",
              opacity: hovered ? 1 : 0,
            }}
          />
          {/* Hatch overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 hatch-dense"
            style={{ opacity: hovered ? 0.5 : 0.12 }}
          />
          <GrainEffect />

          {/* Corner brackets — always faintly visible, bright on hover */}
          {([
            { t: 8, l: 8, bw: "1.5px 0 0 1.5px" },
            { t: 8, r: 8, bw: "1.5px 1.5px 0 0" },
            { b: 8, l: 8, bw: "0 0 1.5px 1.5px" },
            { b: 8, r: 8, bw: "0 1.5px 1.5px 0" },
          ] as const).map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                ...(("t" in c) ? { top: c.t } : { bottom: c.b }),
                ...(("l" in c) ? { left: c.l } : { right: c.r }),
                borderColor: "#a8ff00",
                borderStyle: "solid",
                borderWidth: c.bw,
                opacity: hovered ? 0.75 : 0.2,
                transition: "opacity 0.3s",
              }}
            />
          ))}
        </div>

        {/* ── Neon separator ───────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: hovered
              ? "rgba(168,255,0,0.12)"
              : "rgba(168,255,0,0.04)",
            transition: "background 0.3s",
          }}
        />

        {/* ── Info ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "16px 20px 12px 20px" }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-mono font-bold text-sm text-[#efefef] tracking-tight uppercase">
              {project.title}
            </h3>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.15em] text-[#a8ff00] hover:underline cursor-pointer flex-shrink-0"
              aria-label={`Open ${project.title}`}
              onClick={(e) => e.stopPropagation()}
            >
              {tr.projects.visit}
            </a>
          </div>
          <p className="font-mono text-xs text-[#888888] leading-relaxed mb-4">
            {lang === "es" && project.descriptionEs
              ? project.descriptionEs
              : project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[#1e1e1e] px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[#555555]"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* ── Footer strip ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            background: "#0d0d0d",
            borderTop: `1px solid ${hovered ? "rgba(168,255,0,0.12)" : "rgba(168,255,0,0.05)"}`,
            height: 26,
            display: "flex",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 12,
            justifyContent: "space-between",
            transition: "border-color 0.3s",
          }}
        >
          {/* Hex ID */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.12em",
              color: "rgba(168,255,0,0.25)",
            }}
          >
            {hexId}
          </span>

          {/* Signal bars */}
          <span
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 2,
            }}
          >
            {[3, 5, 7, 9, 11].map((h, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 2,
                  height: h,
                  background: hovered
                    ? `rgba(168,255,0,${0.4 + i * 0.12})`
                    : "rgba(168,255,0,0.15)",
                  transition: `background 0.15s ${i * 0.04}s`,
                }}
              />
            ))}
          </span>

          {/* Status text */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: "0.16em",
              color: hovered ? "rgba(168,255,0,0.6)" : "rgba(168,255,0,0.2)",
              transition: "color 0.3s",
            }}
          >
            STATUS: ONLINE
          </span>
        </div>
      </article>
    </motion.div>
  );
}

// ─── Projects Section ────────────────────────────────────────────────────────

// Collect unique tech tags from all projects
const ALL_TAGS = ["ALL", ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

export default function Projects() {
  const [activeTag, setActiveTag] = useState("ALL");
  const [selected, setSelected] = useState<Project | null>(null);
  const { tr, lang } = useLang();
  const prefersReducedMotion = useReducedMotion();

  // ── Filter gate ────────────────────────────────────────────────────────────
  // Clicking a filter shuts the gate over the grid, swaps the tag while it is
  // covered, then reopens to reveal the new set.
  const [gateOpen, setGateOpen] = useState(true);
  const pendingTag = useRef<string | null>(null);

  const selectTag = (tag: string) => {
    if (tag === activeTag) return;
    if (prefersReducedMotion) {
      setActiveTag(tag);
      return;
    }
    pendingTag.current = tag;
    setGateOpen(false);
  };

  const onGateShut = () => {
    if (pendingTag.current !== null) {
      setActiveTag(pendingTag.current);
      pendingTag.current = null;
    }
    setGateOpen(true);
  };

  const filtered =
    activeTag === "ALL" ? projects : projects.filter((p) => p.tags.includes(activeTag));

  return (
    <>
      <section
        id="projects"
        className="relative py-28 px-6"
        aria-label="Projects"
      >
        <div className="mx-auto max-w-7xl">
          <RevealText scan>
            <SectionLabel index="06" label={tr.sections.projects} className="mb-12" />
          </RevealText>

          <RevealText delay={0.1}>
            <div className="flex flex-wrap items-center gap-2 mb-10" role="tablist" aria-label="Filter projects by technology">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  role="tab"
                  aria-selected={activeTag === tag}
                  onClick={() => selectTag(tag)}
                  className="px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] transition-all duration-200 cursor-pointer border"
                  style={{
                    borderColor: activeTag === tag ? "#a8ff00" : "#1e1e1e",
                    color: activeTag === tag ? "#a8ff00" : "#555555",
                    background: activeTag === tag ? "rgba(168,255,0,0.05)" : "transparent",
                  }}
                >
                  {tag}
                </button>
              ))}
              <span className="ml-auto font-mono text-[10px] text-[#555555] tracking-[0.1em]">
                {filtered.length} {filtered.length !== 1 ? tr.projects.projects : tr.projects.project}
              </span>
            </div>
          </RevealText>

          {/* Grid + filter gate. `relative` anchors the contained gate overlay. */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTag}
                className="grid grid-cols-1 sm:grid-cols-2 gap-10"
              >
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    index={projects.indexOf(project)}
                    onSelect={setSelected}
                    lang={lang}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {!prefersReducedMotion && (
              <GateTransition
                isOpen={gateOpen}
                variant="contained"
                onCloseComplete={onGateShut}
              />
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} lang={lang} />
        )}
      </AnimatePresence>
    </>
  );
}
