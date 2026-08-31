"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/context/LangContext";

/**
 * Full-screen screenshot viewer.
 *
 * A dashboard shot at panel size is a thumbnail of a thing with tables and KPIs
 * in it — legible only at something close to its real size. This sits above the
 * page's CRT and grain overlays (z far past theirs) so nothing is laid over the
 * image, and lets it run to the edges of the window.
 */

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export default function ProjectImageViewer({
  images,
  index,
  direction,
  paginate,
  goTo,
  onClose,
  title,
}: {
  images: string[];
  index: number;
  direction: number;
  paginate: (step: number) => void;
  goTo: (i: number) => void;
  onClose: () => void;
  title: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { tr } = useLang();
  const count = images.length;

  const slide = prefersReducedMotion
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0 }),
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      // Past the global CRT (9998) and grain (9999) layers, which is the whole
      // point: the image is the one thing on this screen with nothing over it.
      className="fixed inset-0 z-[10050] flex flex-col"
      // Inline, not bg-[#060606]/97: /97 is outside Tailwind's opacity scale,
      // so that class was dropped and the backdrop came out transparent.
      style={{ background: "rgba(6,6,6,0.97)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-4 px-5 sm:px-8 py-4 border-b border-[#1e1e1e]">
        <span className="font-mono text-xs tracking-[0.15em] text-[#efefef] uppercase truncate">
          {title}
        </span>
        {count > 1 && (
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#a8ff00] flex-shrink-0">
            {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={tr.projects.close}
          className="ml-auto flex-shrink-0 w-9 h-9 flex items-center justify-center border border-[#1e1e1e] font-mono text-xs text-[#888888] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-colors duration-200 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Stage */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full h-full"
            drag={count > 1 && !prefersReducedMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
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
              alt={count > 1 ? `${title} — ${index + 1}/${count}` : title}
              fill
              priority
              draggable={false}
              // contain, not cover: at this size the point is to see the whole
              // frame, not to fill a shape with it
              className="object-contain select-none"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 &&
          ([-1, 1] as const).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => paginate(step)}
              aria-label={step < 0 ? "Previous image" : "Next image"}
              className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-16 hidden sm:flex items-center justify-center border border-[#1e1e1e] bg-[#0a0a0a]/80 font-mono text-lg text-[#888888] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-colors duration-200 cursor-pointer ${
                step < 0 ? "left-3" : "right-3"
              }`}
            >
              {step < 0 ? "‹" : "›"}
            </button>
          ))}
      </div>

      {/* Ticks */}
      {count > 1 && (
        <div className="flex-shrink-0 flex justify-center gap-2 pb-6 pt-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === index}
              className="h-4 flex items-center cursor-pointer"
            >
              <span
                className="block transition-all duration-200"
                style={{
                  width: i === index ? 26 : 12,
                  height: 2,
                  background: i === index ? "#a8ff00" : "rgba(168,255,0,0.28)",
                  boxShadow: i === index ? "0 0 6px rgba(168,255,0,0.7)" : "none",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
