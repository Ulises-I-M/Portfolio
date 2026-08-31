"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Screenshot gallery for the project detail panel.
 *
 * A project usually needs several shots to make sense — a fleet view, a detail
 * state, the mobile layout — so the panel pages through them by swipe, arrow
 * button or keyboard, rather than picking one and hoping it carries the whole
 * story. With a single image it renders as a plain still with no chrome.
 */

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export default function ProjectGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const prefersReducedMotion = useReducedMotion();
  const count = images.length;

  const paginate = useCallback(
    (step: number) => {
      if (count < 2) return;
      setPage(([i]) => [(i + step + count) % count, step]);
    },
    [count],
  );

  // The gallery only exists while the panel is open, so a window listener here
  // is already scoped to it.
  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, paginate]);

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
          className="absolute inset-0"
          drag={count > 1 && !prefersReducedMotion ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) {
              paginate(1);
            } else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) {
              paginate(-1);
            }
          }}
        >
          <Image
            src={images[index]}
            alt={count > 1 ? `${alt} — ${index + 1}/${count}` : alt}
            fill
            priority={index === 0}
            draggable={false}
            className="object-cover select-none"
            style={{ filter: "grayscale(0.2) contrast(1.05)" }}
            sizes="(max-width: 768px) 100vw, 512px"
          />
        </motion.div>
      </AnimatePresence>

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
                onClick={() => setPage([i, i > index ? 1 : -1])}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className="h-3 flex items-center cursor-pointer group/tick"
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
