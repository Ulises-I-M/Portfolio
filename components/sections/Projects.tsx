"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useTime,
  useReducedMotion,
} from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import GrainEffect from "@/components/ui/GrainEffect";
import HUDCardFrame from "@/components/ui/HUDCardFrame";
import GateTransition from "@/components/ui/GateTransition";
import { frameClipPath } from "@/components/ui/hudFrameGeometry";
import { useLowPower } from "@/hooks/useLowPower";
import ProjectGlyph from "@/components/ui/ProjectGlyph";
import { projects, type Project } from "@/lib/data";
import { useLang } from "@/context/LangContext";
import { pick, type Lang } from "@/lib/i18n";

// Stable key tying a grid card to its detail panel for the shared-element morph
const projectSlug = (p: Project) =>
  p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Client deployments behind an NDA have no screenshot to show. Borrowing an
 * unrelated capture would misrepresent them, so those cards get a schematic
 * drawn from the project's own domain instead.
 */
function ProjectVisual({
  project,
  sizes,
  glyphScale = 1,
  imageProps,
}: {
  project: Project;
  sizes: string;
  glyphScale?: number;
  imageProps?: { className?: string; style?: React.CSSProperties };
}) {
  if (!project.image) {
    return (
      <ProjectGlyph
        code={project.code}
        kind={project.glyph}
        seed={project.title}
        scale={glyphScale}
      />
    );
  }
  return (
    <Image
      src={project.image}
      alt={project.title}
      fill
      sizes={sizes}
      className={imageProps?.className}
      style={imageProps?.style}
    />
  );
}

// ─── Project Detail Modal ────────────────────────────────────────────────────

function ProjectModal({
  project,
  onClose,
  lang,
  morph,
}: {
  project: Project;
  onClose: () => void;
  lang: Lang;
  /** When true the panel morphs out of its grid card instead of fading in. */
  morph: boolean;
}) {
  const { tr } = useLang();

  const chipRef = useRef<HTMLDivElement>(null);

  // Orientation, -1..1 per axis with 0 facing you. Starts off-centre so the
  // settle to centre reads as the chip turning upright as it is lifted; the
  // same springs then serve the pointer tilt, so lift and hold are one thing.
  const hx = useMotionValue(morph ? -0.75 : 0);
  const hy = useMotionValue(morph ? -0.3 : 0);
  // Mass gives drag and follow-through — without it the chip tracks the
  // pointer rigidly and reads weightless.
  const sx = useSpring(hx, { stiffness: 70, damping: 16, mass: 1.2 });
  const sy = useSpring(hy, { stiffness: 70, damping: 16, mass: 1.2 });

  // A held object is never perfectly still. Combining the drift into the same
  // transform avoids a second wrapper competing for the same rotation.
  const t = useTime();
  const rotateY = useTransform(
    [sx, t] as const,
    ([v, ms]: number[]) => v * 15 + Math.sin(ms / 1900) * 1.1
  );
  const rotateX = useTransform(
    [sy, t] as const,
    ([v, ms]: number[]) => -v * 15 + Math.cos(ms / 2300) * 0.8
  );

  // Highlight tracks both axes, and sharpens as the chip turns edge-on
  const shineX = useTransform(sx, [-1, 1], ["-32%", "32%"]);
  const shineY = useTransform(sy, [-1, 1], ["-14%", "14%"]);
  const shineOpacity = useTransform(
    [sx, sy] as const,
    ([a, b]: number[]) => 0.35 + Math.min(1, Math.hypot(a, b)) * 0.65
  );

  useEffect(() => {
    if (!morph) return;
    // Next frame, so the spring starts from the turned pose rather than
    // snapping through it
    const id = requestAnimationFrame(() => { hx.set(0); hy.set(0); });
    return () => cancelAnimationFrame(id);
  }, [morph, hx, hy]);

  // Measured against the chip's own centre, not the viewport. Mapping over the
  // whole window made a pointer in a far corner swing the chip as hard as one
  // right beside it, which is why it felt detached from the cursor.
  const onOverlayMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!morph) return;
    const el = chipRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const reach = Math.max(r.width, r.height) * 1.6;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    hx.set(clamp((e.clientX - (r.left + r.width / 2)) / reach));
    hy.set(clamp((e.clientY - (r.top + r.height / 2)) / reach));
  };

  // Outer layer owns the journey only — position and size. Orientation lives on
  // the inner layer, because a mouse-driven tilt needs style={{ rotateX }} and
  // that collides with an animate={{ rotateX }} on the same element.
  const panelOuter = morph
    ? {
        layoutId: `project-${projectSlug(project)}`,
        transition: { type: "spring" as const, stiffness: 95, damping: 22, mass: 0.9 },
      }
    : {
        initial: { opacity: 0, y: 16, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.97 },
        transition: { duration: 0.25 },
      };

  return (
    <motion.div
      key="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8"
      style={{
        background: morph ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.85)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onMouseMove={onOverlayMove}
    >
      <motion.div {...panelOuter} className="relative w-full max-w-lg">
      {/* The chip itself. Clip and overflow live here, not on the outer layer:
          on the outer, a tilted chip would have its corners eaten by the clip
          and the stepped silhouette would deform. */}
      <motion.div
        ref={chipRef}
        className="relative w-full overflow-hidden bg-[#0a0a0a] flex flex-col"
        style={{
          // Bounded so a long dossier scrolls inside the chip rather than
          // stretching it past the viewport
          maxHeight: "calc(100vh - 5rem)",
          clipPath: frameClipPath(),
          filter:
            "drop-shadow(0 22px 30px rgba(0,0,0,0.75)) drop-shadow(0 0 18px rgba(168,255,0,0.13))",
          ...(morph
            ? { rotateX, rotateY, transformPerspective: 700 }
            : {}),
        }}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-[#111111] flex-shrink-0">
          <ProjectVisual
            project={project}
            sizes="(max-width: 768px) 100vw, 512px"
            imageProps={{
              className: "object-cover",
              style: { filter: "grayscale(0.2) contrast(1.05)" },
            }}
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

        {/* Info — scrolls on its own so a long dossier never grows the chip */}
        <div className="px-6 pt-6 pb-10 overflow-y-auto overscroll-contain modal-scroll">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="font-mono font-bold text-lg text-[#efefef] tracking-tight uppercase">
              {project.title}
            </h3>
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 border border-[#a8ff00] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-[#a8ff00] hover:bg-[#a8ff00] hover:text-[#0a0a0a] transition-all duration-200 cursor-pointer"
              >
                {tr.projects.visit}
              </a>
            ) : (
              <span
                className="flex-shrink-0 border border-[#1e1e1e] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-[#555555]"
                title={tr.projects.privateNote}
              >
                {tr.projects.private}
              </span>
            )}
          </div>

          {project.client && (
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#a8ff00] opacity-70 mb-4">
              {project.client.toUpperCase()}
            </p>
          )}

          <p className="font-mono text-sm text-[#888888] leading-loose mb-5">
            {lang === "es" && project.descriptionEs ? project.descriptionEs : project.description}
          </p>

          {/* Metrics — the numbers carry more than any adjective would */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-px mb-6 bg-[#1e1e1e] border border-[#1e1e1e]">
              {project.metrics.map((m, i) => (
                <div
                  key={m.value + m.label.en}
                  // An odd count would otherwise leave a bordered empty cell
                  className={`bg-[#0a0a0a] px-3 py-3 ${
                    i === project.metrics!.length - 1 && project.metrics!.length % 2 === 1
                      ? "col-span-2"
                      : ""
                  }`}
                >
                  <div className="font-mono font-bold text-base text-[#a8ff00] leading-none mb-1.5">
                    {m.value}
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.16em] text-[#555555] leading-snug">
                    {pick(m.label, lang)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(project.longDescription || project.longDescriptionEs) && (
            <>
              <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-3">
                {tr.projects.overview}
              </p>
              <p className="font-mono text-xs text-[#888888] leading-loose mb-6">
                {lang === "es" && project.longDescriptionEs
                  ? project.longDescriptionEs
                  : project.longDescription}
              </p>
            </>
          )}

          {project.highlights && project.highlights.length > 0 && (
            <>
              <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-3">
                {tr.projects.keyWork}
              </p>
              <ul className="space-y-3 mb-6">
                {project.highlights.map((h) => (
                  <li key={h.en} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] w-1.5 h-1.5 flex-shrink-0 bg-[#a8ff00] opacity-60"
                    />
                    <span className="font-mono text-xs text-[#888888] leading-loose">
                      {pick(h, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-3">
            {tr.projects.stack}
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

          {!project.url && (
            <p className="font-mono text-[9px] tracking-[0.15em] text-[#333333] mt-5">
              {tr.projects.privateNote}
            </p>
          )}
        </div>

        {/* Same frame it wears in the tray — without it, picking the chip up
            turns it into a different object. */}
        <HUDCardFrame hovered />

        {/* Specular sweep — what separates a real object from a rotated div */}
        {morph && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 -inset-x-1/4 pointer-events-none"
            style={{
              x: shineX,
              y: shineY,
              opacity: shineOpacity,
              background:
                "linear-gradient(105deg, transparent 38%, rgba(168,255,0,0.07) 47%, rgba(255,255,255,0.10) 50%, rgba(168,255,0,0.07) 53%, transparent 62%)",
              zIndex: 30,
            }}
          />
        )}
      </motion.div>
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
  const morph = !prefersReducedMotion && !lowPower;

  // ── 3D tilt ────────────────────────────────────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX    = useMotionValue(0);
  const rotY    = useMotionValue(0);
  // Mass so the chip lags the pointer slightly instead of tracking it rigidly
  const springRotX = useSpring(rotX, { stiffness: 120, damping: 18, mass: 1.1 });
  const springRotY = useSpring(rotY, { stiffness: 120, damping: 18, mass: 1.1 });

  // Internal parallax: the artwork drifts against the tilt, which is what gives
  // the chip thickness. Without it the face and frame move as one flat sheet.
  const artX = useTransform(springRotY, [-7, 7], [6, -6]);
  const artY = useTransform(springRotX, [-7, 7], [-6, 6]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || lowPower) return;
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const dx = ((e.clientX - left) / width  - 0.5) * 2; // –1 → 1
    const dy = ((e.clientY - top)  / height - 0.5) * 2;
    rotX.set(-dy * 7); // max ±7 °
    rotY.set( dx * 7);
  };

  const onMouseLeaveCard = () => {
    rotX.set(0);
    rotY.set(0);
  };

  // Snap the tilt flat before opening. A non-identity transform on the wrapper
  // would compose with the layout animation and land the panel askew; jump()
  // clears the spring instantly instead of easing it over ~200ms.
  const openDetail = () => {
    rotX.set(0);
    rotY.set(0);
    springRotX.jump(0);
    springRotY.jump(0);
    onSelect(project);
  };

  // ── Derived dossier metadata ──────────────────────────────────────────────
  const idx = String(index + 1).padStart(3, "0");
  const typeTag = project.category === "iot" ? "IOT.IND" : project.category.toUpperCase();
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
      layoutId={morph ? `project-${projectSlug(project)}` : undefined}
      initial={{ opacity: 0, y: 20 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 1 }}
      className="relative h-full"
      // One animate drives both the entry and the hover lift: a chip you touch
      // should rise off the tray, not merely tilt in place.
      animate={
        prefersReducedMotion || lowPower
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: hovered ? -7 : 0, scale: hovered ? 1.025 : 1 }
      }
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
      // Full height so every card in a row ends at the same footer line
      // regardless of how far its description or tag list runs
    >
      {/* ── SVG HUD frame (drawn outside the clipped article) ─────────────── */}
      <HUDCardFrame hovered={hovered} />

      {/* ── Card body — clipped to the shared frame silhouette ───────────── */}
      <article
        className="relative overflow-hidden cursor-pointer h-full flex flex-col"
        onClick={openDetail}
        style={{
          clipPath: frameClipPath(),
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
          {/* Scaled up so the parallax drift never exposes an edge */}
          <motion.div
            className="absolute inset-0"
            style={
              prefersReducedMotion || lowPower
                ? {}
                : { x: artX, y: artY, scale: 1.06 }
            }
          >
          <ProjectVisual
            project={project}
            sizes="(max-width: 768px) 100vw, 50vw"
            imageProps={{
              className: "object-cover transition-all duration-700",
              style: {
                filter: hovered
                  ? "grayscale(0) contrast(1.05)"
                  : "grayscale(0.75) contrast(1)",
                animation: hovered ? "ken-burns 8s ease-in-out infinite" : "none",
                transformOrigin: "center center",
              },
            }}
          />
          </motion.div>
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
        <div style={{ padding: "16px 20px 12px 20px", flex: 1 }}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-mono font-bold text-sm text-[#efefef] tracking-tight uppercase">
              {project.title}
            </h3>
            {project.url ? (
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
            ) : (
              <span className="font-mono text-[10px] tracking-[0.15em] text-[#3a3a3a] flex-shrink-0">
                {tr.projects.private}
              </span>
            )}
          </div>
          {project.client && (
            <p className="font-mono text-[9px] tracking-[0.18em] text-[#a8ff00] opacity-60 mb-3">
              {project.client.toUpperCase()}
            </p>
          )}
          <p className="font-mono text-xs text-[#888888] leading-relaxed mb-4">
            {lang === "es" && project.descriptionEs
              ? project.descriptionEs
              : project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="border border-[#1e1e1e] px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[#555555]"
              >
                {tag.toUpperCase()}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="px-1 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[#3a3a3a]">
                +{project.tags.length - 4}
              </span>
            )}
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

// ─── Compact index row ───────────────────────────────────────────────────────

/**
 * Thirteen cards of equal weight give a reader no entry point and run to eight
 * screens on a phone. The strongest six keep the full card; the rest list here
 * at a fraction of the height and open the same detail panel, so the breadth of
 * the work stays visible without being scrolled through.
 */
function ProjectIndexRow({
  project,
  onSelect,
  lang,
}: {
  project: Project;
  onSelect: (p: Project, morph: boolean) => void;
  lang: Lang;
}) {
  const [hovered, setHovered] = useState(false);
  const { tr } = useLang();

  return (
    <button
      type="button"
      onClick={() => onSelect(project, false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative w-full text-left flex items-center gap-3 sm:gap-5 pl-4 pr-3 py-3 border transition-colors duration-200 cursor-pointer chamfered-sm"
      style={{
        borderColor: hovered ? "rgba(168,255,0,0.35)" : "#1e1e1e",
        background: hovered ? "rgba(168,255,0,0.03)" : "transparent",
      }}
      aria-label={`${project.title} — ${lang === "es" ? "ver detalle" : "view detail"}`}
    >
      {/* Left accent, the same tell the cards use */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-200"
        style={{ background: hovered ? "#a8ff00" : "rgba(168,255,0,0.15)" }}
      />

      <span
        className="font-mono text-[10px] tracking-[0.15em] w-9 flex-shrink-0 transition-colors duration-200"
        style={{ color: hovered ? "#a8ff00" : "rgba(168,255,0,0.4)" }}
      >
        {project.code}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-mono font-bold text-xs text-[#efefef] tracking-tight uppercase truncate">
          {project.title}
        </span>
        {project.client && (
          <span className="block sm:hidden font-mono text-[9px] tracking-[0.12em] text-[#555555] truncate mt-0.5">
            {project.client.toUpperCase()}
          </span>
        )}
      </span>

      {project.client && (
        <span className="hidden sm:block font-mono text-[9px] tracking-[0.12em] text-[#555555] w-52 flex-shrink-0 truncate">
          {project.client.toUpperCase()}
        </span>
      )}

      <span className="hidden lg:flex gap-2 flex-shrink-0">
        {project.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="border border-[#1e1e1e] px-2 py-0.5 font-mono text-[8px] tracking-[0.1em] text-[#555555]"
          >
            {tag.toUpperCase()}
          </span>
        ))}
      </span>

      <span
        className="font-mono text-[9px] tracking-[0.15em] flex-shrink-0 transition-colors duration-200"
        style={{ color: project.url ? (hovered ? "#a8ff00" : "#555555") : "#3a3a3a" }}
      >
        {project.url ? tr.projects.visit : tr.projects.private}
      </span>
    </button>
  );
}

// ─── Projects Section ────────────────────────────────────────────────────────

// Filtering by tech tag would put ~30 buttons in the bar once the industrial
// stacks are counted, so the bar filters by domain instead; the full stack of
// each project stays visible on its card and in its detail panel.
const CATEGORIES = ["all", "iot", "web", "personal"] as const;
type CategoryKey = (typeof CATEGORIES)[number];

export default function Projects() {
  const [activeTag, setActiveTag] = useState<CategoryKey>("all");
  // An index row is a 70px strip: morphing it into a full panel reads as a
  // glitch rather than a lift, so rows fade the panel in and cards morph it.
  const [selected, setSelected] = useState<{ project: Project; morph: boolean } | null>(null);
  const { tr, lang } = useLang();
  const prefersReducedMotion = useReducedMotion();
  const lowPower = useLowPower();
  // blur() is expensive on weak GPUs, so the depth cue is skipped there too
  const morph = !prefersReducedMotion && !lowPower;

  // ── Filter gate ────────────────────────────────────────────────────────────
  // Clicking a filter shuts the gate over the grid, swaps the tag while it is
  // covered, then reopens to reveal the new set.
  const [gateOpen, setGateOpen] = useState(true);
  const pendingTag = useRef<CategoryKey | null>(null);

  const selectTag = (tag: CategoryKey) => {
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
    activeTag === "all" ? projects : projects.filter((p) => p.category === activeTag);

  // A short list has nothing to gain from being split in two, so it stays cards.
  const splitList = filtered.length > 3;
  const cards = splitList ? filtered.filter((p) => p.featured) : filtered;
  const indexed = splitList ? filtered.filter((p) => !p.featured) : [];

  const categoryLabel: Record<CategoryKey, string> = {
    all: tr.projects.filterAll,
    iot: tr.projects.filterIot,
    web: tr.projects.filterWeb,
    personal: tr.projects.filterPersonal,
  };

  return (
    <>
      <section
        id="projects"
        className="relative py-28 px-6"
        aria-label="Projects"
      >
        <div className="mx-auto max-w-7xl">
          <RevealText scan>
            <SectionLabel index="05" label={tr.sections.projects} className="mb-12" />
          </RevealText>

          <RevealText delay={0.1}>
            <div className="flex flex-wrap items-center gap-2 mb-10" role="tablist" aria-label="Filter projects by technology">
              {CATEGORIES.map((tag) => (
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
                  {categoryLabel[tag]}
                </button>
              ))}
              <span className="ml-auto font-mono text-[10px] text-[#555555] tracking-[0.1em]">
                {filtered.length} {filtered.length !== 1 ? tr.projects.projects : tr.projects.project}
              </span>
            </div>
          </RevealText>

          {/* Grid + filter gate. `relative` anchors the contained gate overlay. */}
          <div className="relative">
            {/* Recede while a detail panel is open — the strongest depth cue,
                and the reason the card reads as coming toward the viewer. Sits
                outside AnimatePresence so the filter's key swap does not fight
                it, and beside the gate so the gate is not blurred with it. */}
            <motion.div
              animate={
                morph && selected
                  ? { scale: 0.93, opacity: 0.85, filter: "blur(2px)" }
                  : { scale: 1, opacity: 1, filter: "blur(0px)" }
              }
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTag}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {cards.map((project) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    index={projects.indexOf(project)}
                    onSelect={(p) => setSelected({ project: p, morph: true })}
                    lang={lang}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {indexed.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-4">
                  {tr.projects.moreWork}
                </p>
                <div className="space-y-2">
                  {indexed.map((project) => (
                    <ProjectIndexRow
                      key={project.title}
                      project={project}
                      onSelect={(p, morph) => setSelected({ project: p, morph })}
                      lang={lang}
                    />
                  ))}
                </div>
              </div>
            )}
            </motion.div>

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
          <ProjectModal
            project={selected.project}
            onClose={() => setSelected(null)}
            lang={lang}
            morph={morph && selected.morph}
          />
        )}
      </AnimatePresence>
    </>
  );
}
