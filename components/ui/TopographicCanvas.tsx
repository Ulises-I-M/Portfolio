"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Focus { x: number; y: number; phase: number; rx: number; ry: number }
interface Ring  { focusIdx: number; r: number; alpha: number; speed: number }

// Seeded LCG RNG
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const SPAWN_INTERVAL = 42; // frames between new rings per focus
const MAX_R          = 220; // px — ring dies here
const INIT_ALPHA     = 0.2;
const DECAY          = INIT_ALPHA / (MAX_R / 0.7); // alpha per px of growth

export default function TopographicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let frame = 0;
    let foci: Focus[] = [];
    let rings: Ring[] = [];
    let scanY = 0;

    const rebuild = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const rng = mkRng(canvas.width * 5 + canvas.height * 9);
      const count = 5;
      foci = Array.from({ length: count }, (_, i) => ({
        x:     0.1 + rng() * 0.8,   // normalised, resolved each frame
        y:     0.1 + rng() * 0.8,
        phase: Math.floor(rng() * SPAWN_INTERVAL),
        rx:    0.75 + rng() * 0.5,  // ellipse x-scale relative to r
        ry:    0.75 + rng() * 0.5,  // ellipse y-scale relative to r
      }));
      rings  = [];
      scanY  = 0;
      frame  = 0;
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      frame++;

      // ── Spawn new rings ──
      for (let fi = 0; fi < foci.length; fi++) {
        if ((frame + foci[fi].phase) % SPAWN_INTERVAL === 0) {
          rings.push({ focusIdx: fi, r: 0, alpha: INIT_ALPHA, speed: 0.55 + Math.random() * 0.25 });
        }
      }

      // ── Draw crosshairs at each focus ──
      for (const f of foci) {
        const fx = f.x * width;
        const fy = f.y * height;
        const ARM = 6;
        ctx.strokeStyle = "rgba(168,255,0,0.18)";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(fx - ARM, fy); ctx.lineTo(fx + ARM, fy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx, fy - ARM); ctx.lineTo(fx, fy + ARM); ctx.stroke();
        // centre dot
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,255,0,0.35)";
        ctx.fill();
      }

      // ── Draw & advance rings ──
      rings = rings.filter((ring) => {
        const f  = foci[ring.focusIdx];
        const fx = f.x * width;
        const fy = f.y * height;

        ctx.beginPath();
        ctx.ellipse(fx, fy, ring.r * f.rx, ring.r * f.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168,255,0,${ring.alpha.toFixed(4)})`;
        // lineWidth tapers 0.9 → 0.15 as ring grows
        ctx.lineWidth = 0.15 + (ring.alpha / INIT_ALPHA) * 0.75;
        ctx.stroke();

        ring.r     += ring.speed;
        ring.alpha -= DECAY * ring.speed;
        return ring.alpha > 0.005 && ring.r < MAX_R;
      });

      // ── Slow horizontal scan line ──
      scanY += 0.25;
      if (scanY > height) scanY = 0;
      ctx.fillStyle = "rgba(168,255,0,0.03)";
      ctx.fillRect(0, scanY, width, 1.5);

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);
    rebuild();
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
