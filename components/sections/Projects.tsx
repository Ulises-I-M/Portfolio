"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import { projects, type Project } from "@/lib/data";

const filters = [
  { label: "ALL", value: "all" },
  { label: "WEB", value: "web" },
  { label: "PERSONAL", value: "personal" },
] as const;

type Filter = "all" | "web" | "personal";

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

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
          className="object-cover transition-all duration-500"
          style={{
            filter: hovered
              ? "grayscale(0) contrast(1.05)"
              : "grayscale(0.8) contrast(1)",
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
            VISIT →
          </a>
        </div>
        <p className="font-mono text-xs text-[#555555] leading-relaxed mb-4">
          {project.description}
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

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section
      id="projects"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Projects"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="04" label="Projects" className="mb-12" />
        </RevealText>

        <RevealText delay={0.1}>
          <div className="flex items-center gap-1 mb-10" role="tablist" aria-label="Filter projects">
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className="px-5 py-2 font-mono text-[10px] tracking-[0.2em] transition-all duration-200 cursor-pointer border"
                style={{
                  borderColor: filter === f.value ? "#a8ff00" : "#1e1e1e",
                  color: filter === f.value ? "#a8ff00" : "#555555",
                  background: filter === f.value ? "rgba(168,255,0,0.05)" : "transparent",
                }}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] text-[#555555] tracking-[0.1em]">
              {filtered.length} PROJECT{filtered.length !== 1 ? "S" : ""}
            </span>
          </div>
        </RevealText>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {filtered.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
