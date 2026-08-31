"use client";

import { useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Screenshot gallery for the project detail panel.
 *
 * A project usually needs several shots to make sense — a fleet view, a detail
 * state, the mobile layout — so the panel pages through them by swipe, arrow
 * button or keyboard, rather than picking one and hoping it carries the whole
 * story. With a single image it renders as a plain still with no chrome.
 *
 * Paging state is owned above (useGalleryPaging) so this and the full-screen
 * viewer stay on the same frame.
 */

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;
/** Past this, a pointer-up is the end of a drag and not a click to expand. */
const DRAG_SLOP = 6;

export default function ProjectGallery({
  images,
  alt,
  index,
  direction,
  paginate,
  goTo,
  onExpand,
  expandLabel,
}: {
  images: string[];
  alt: string;
  index: number;
  direction: number;
  paginate: (step: number) => void;
  goTo: (i: number) => void;
  onExpand: () => void;
  expandLabel: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const count = images.length;
  const dragged = useRef(false);

  const slide = prefersReducedMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0.4 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0.4 }),
      };

  return (
    <>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 260, damping: 32 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 cursor-zoom-in"
          drag={count > 1 && !prefersReducedMotion ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
              paginate(1);
            } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
              paginate(-1);
            }
            // Cleared on the next tick so the click that follows a drag is the
            // one this swallows, not the one after it
            setTimeout(() => {
              dragged.current = false;
            }, 0);
          }}
          onClick={() => {
            if (!dragged.current) onExpand();
          }}
          onPointerDown={(e) => {
            if (Math.abs(e.movementX) > DRAG_SLOP) dragged.current = true;
          }}
        >
          <Image
            src={images[index]}
            alt={count > 1 ? `${alt} — ${index + 1}/${count}` : alt}
            fill
            priority={index === 0}
            draggable={false}
            className="object-cover select-none"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </motion.div>
      </AnimatePresence>

      {/* Expand affordance — the whole frame opens the viewer, but a target
          that says so beats relying on the cursor alone */}
      <button
        type="button"
        onClick={onExpand}
        className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 border border-[#1e1e1e] bg-[#0a0a0a]/80 font-mono text-[9px] tracking-[0.18em] text-[#888888] hover:border-[#a8ff00] hover:text-[#a8ff00] hover:bg-[#0a0a0a]/95 transition-colors duration-200 cursor-pointer"
      >
        <span aria-hidden="true">⤢</span>
        {expandLabel}
      </button>

      {count > 1 && (
        <>
          {/* Scrims: a bright screenshot would otherwise swallow the chrome */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-14 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-14 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
          />

          {/* Frame counter — clears the panel's top-left corner bracket */}
          <span
            className="absolute top-3 left-10 z-20 font-mono text-[9px] tracking-[0.2em] pointer-events-none"
            style={{ color: "rgba(168,255,0,0.65)", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
          >
            {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
          </span>

          {([-1, 1] as const).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => paginate(step)}
              aria-label={step < 0 ? "Previous image" : "Next image"}
              // Hidden on phones: they sit exactly where a thumb starts a
              // swipe, and a drag begun on the button does nothing.
              className={`absolute top-1/2 -translate-y-1/2 z-20 w-8 h-12 hidden sm:flex items-center justify-center border font-mono text-sm border-[#1e1e1e] text-[#888888] bg-[#0a0a0a]/70 hover:border-[#a8ff00] hover:text-[#a8ff00] hover:bg-[#0a0a0a]/90 transition-all duration-200 cursor-pointer ${
                step < 0 ? "left-2" : "right-2"
              }`}
            >
              {step < 0 ? "‹" : "›"}
            </button>
          ))}

          {/* Tick indicator, doubling as direct access to a frame */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className="h-3 flex items-center cursor-pointer"
              >
                <span
                  className="block transition-all duration-200"
                  style={{
                    width: i === index ? 18 : 8,
                    height: 2,
                    background: i === index ? "#a8ff00" : "rgba(168,255,0,0.3)",
                    boxShadow: i === index ? "0 0 6px rgba(168,255,0,0.7)" : "none",
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
