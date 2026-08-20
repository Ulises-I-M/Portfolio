"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// Glyphs pool: hex digits + binary fragments + circuit symbols
const GLYPHS =
  "0123456789ABCDEF01><+-=|_[]{}/#";

interface Column {
  x: number;
  y: number;       // current head y (px)
  speed: number;   // px per frame
  trailLen: number; // number of characters in trail
  chars: string[]; // char for each trail slot (randomised)
  bright: boolean; // whether this column gets a brighter head
}

export default function DataRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const FONT_SIZE = 11;
    const COL_GAP = 18; // px between columns
    let columns: Column[] = [];

    const buildColumns = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const count = Math.ceil(canvas.width / COL_GAP);
      columns = Array.from({ length: count }, (_, i) => {
        const trailLen = 6 + Math.floor(Math.random() * 10);
        return {
          x: i * COL_GAP + Math.floor(COL_GAP / 2),
          y: -Math.random() * canvas.height, // stagger start above viewport
          speed: 0.6 + Math.random() * 1.2,
          trailLen,
          chars: Array.from({ length: trailLen }, () =>
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          ),
          bright: Math.random() > 0.55,
        };
      });
    };

    const draw = () => {
      const { width, height } = canvas;

      // Fade out old frame (produces the trail effect)
      ctx.fillStyle = "rgba(10,10,10,0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px "Space Mono", monospace`;
      ctx.textAlign = "center";

      for (const col of columns) {
        const charH = FONT_SIZE + 4;

        for (let i = 0; i < col.trailLen; i++) {
          const cy = col.y - i * charH;
          if (cy < -charH || cy > height + charH) continue;

          // Head character — brightest
          if (i === 0) {
            ctx.fillStyle = col.bright
              ? "rgba(220,255,180,0.95)"  // near-white tip
              : "rgba(168,255,0,0.85)";
          } else {
            // Trail fades: alpha decays with distance from head
            const fade = 1 - i / col.trailLen;
            const alpha = fade * (col.bright ? 0.55 : 0.35);
            ctx.fillStyle = `rgba(168,255,0,${alpha.toFixed(3)})`;
          }

          ctx.fillText(col.chars[i], col.x, cy);

          // Occasionally randomise a trailing character
          if (Math.random() < 0.04) {
            col.chars[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        // Advance head
        col.y += col.speed;

        // Reset when fully off-screen at bottom
        if (col.y - col.trailLen * (FONT_SIZE + 4) > height) {
          col.y = -Math.random() * height * 0.4;
          col.speed = 0.6 + Math.random() * 1.2;
          col.trailLen = 6 + Math.floor(Math.random() * 10);
          col.bright = Math.random() > 0.55;
          col.chars = Array.from({ length: col.trailLen }, () =>
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          );
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(buildColumns);
    ro.observe(canvas);
    buildColumns();
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
