"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import GrainEffect from "@/components/ui/GrainEffect";
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
  onSelect,
  lang,
}: {
  project: Project;
  onSelect: (p: Project) => void;
  lang: Lang;
}) {
  const [hovered, setHovered] = useState(false);
  const { tr } = useLang();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden border border-[#1e1e1e] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onClick={() => onSelect(project)}
      style={{
        borderColor: hovered ? "#a8ff00" : "#1e1e1e",
        boxShadow: hovered ? "0 0 20px rgba(168,255,0,0.1)" : "none",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-[#111111]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-all duration-700"
          style={{
            filter: hovered
              ? "grayscale(0) contrast(1.05)"
              : "grayscale(0.8) contrast(1)",
            animation: hovered ? "ken-burns 8s ease-in-out infinite" : "none",
            transformOrigin: "center center",
          }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Neon tint on hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(135deg, rgba(168,255,0,0.08) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
          }}
        />
        <GrainEffect />
        {/* HUD corner brackets visible on hover */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(
          (pos, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              className={`absolute ${pos} w-3 h-3 transition-opacity duration-300`}
              style={{
                borderColor: "#a8ff00",
                borderStyle: "solid",
                borderWidth:
                  idx === 0
                    ? "1px 0 0 1px"
                    : idx === 1
                      ? "1px 1px 0 0"
                      : idx === 2
                        ? "0 0 1px 1px"
                        : "0 1px 1px 0",
                opacity: hovered ? 0.8 : 0,
              }}
            />
          )
        )}
      </div>

      {/* Info */}
      <div className="p-5">
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
        <p className="font-mono text-xs text-[#aaaaaa] leading-relaxed mb-4">
          {lang === "es" && project.descriptionEs ? project.descriptionEs : project.description}
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
    </motion.article>
  );
}

// ─── Projects Section ────────────────────────────────────────────────────────

// Collect unique tech tags from all projects
const ALL_TAGS = ["ALL", ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

export default function Projects() {
  const [activeTag, setActiveTag] = useState("ALL");
  const [selected, setSelected] = useState<Project | null>(null);
  const { tr, lang } = useLang();

  const filtered =
    activeTag === "ALL" ? projects : projects.filter((p) => p.tags.includes(activeTag));

  return (
    <>
      <section
        id="projects"
        className="relative py-28 px-6 border-t border-[#1e1e1e]"
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
                  onClick={() => setActiveTag(tag)}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {filtered.map((project) => (
                <ProjectCard key={project.title} project={project} onSelect={setSelected} lang={lang} />
              ))}
            </motion.div>
          </AnimatePresence>
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
