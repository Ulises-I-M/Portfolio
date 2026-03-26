"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface GlitchBand {
  y: number;        // top y of the band
  height: number;   // band height (px)
  offsetX: number;  // horizontal shift
  alpha: number;    // opacity
  life: number;     // remaining frames
  rgb: boolean;     // show RGB separation
}

export default function GlitchScanlines() {
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
    let bands: GlitchBand[] = [];
    let nextGlitch = 80; // frames until next glitch event

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const spawnGlitch = (intense: boolean) => {
      const count = intense ? 3 + Math.floor(Math.random() * 4) : 1;
      for (let i = 0; i < count; i++) {
        bands.push({
          y: Math.random() * canvas.height,
          height: 2 + Math.random() * (intense ? 18 : 6),
          offsetX: (Math.random() - 0.5) * (intense ? 40 : 14),
          alpha: 0.08 + Math.random() * (intense ? 0.18 : 0.08),
          life: 3 + Math.floor(Math.random() * (intense ? 10 : 5)),
          rgb: intense && Math.random() > 0.5,
        });
      }
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      frame++;

      // ── Scanlines (drawn as a repeating horizontal pattern) ──
      const SCAN_GAP = 3; // px between scanlines
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let y = 0; y < height; y += SCAN_GAP) {
        ctx.fillRect(0, y, width, 1);
      }

      // ── Horizontal drift lines (slow, subtle) ──
      const DRIFT_COUNT = 5;
      for (let i = 0; i < DRIFT_COUNT; i++) {
        const y = ((frame * (0.15 + i * 0.08) + i * 137) % height);
        const alpha = 0.02 + Math.sin(frame * 0.03 + i) * 0.01;
        ctx.fillStyle = `rgba(168,255,0,${Math.max(0, alpha)})`;
        ctx.fillRect(0, y, width, 1);
      }

      // ── Schedule glitch events ──
      nextGlitch--;
      if (nextGlitch <= 0) {
        const intense = Math.random() > 0.6;
        spawnGlitch(intense);
        // idle gap: 120–360 frames (~2–6 s at 60 fps)
        nextGlitch = 120 + Math.floor(Math.random() * 240);
      }

      // ── Draw & age glitch bands ──
      bands = bands.filter((b) => b.life > 0);
      for (const b of bands) {
        const fadeAlpha = b.alpha * (b.life / 8);

        if (b.rgb) {
          // Red channel shifted left
          ctx.fillStyle = `rgba(255,0,60,${fadeAlpha * 0.5})`;
          ctx.fillRect(b.offsetX - 4, b.y, width, b.height);
          // Cyan channel shifted right
          ctx.fillStyle = `rgba(0,230,255,${fadeAlpha * 0.5})`;
          ctx.fillRect(b.offsetX + 4, b.y, width, b.height);
        }

        // Main neon green band
        ctx.fillStyle = `rgba(168,255,0,${fadeAlpha})`;
        ctx.fillRect(b.offsetX, b.y, width, b.height);

        b.life--;
      }

      // ── Occasional full-width flash line ──
      if (Math.random() < 0.004) {
        const fy = Math.random() * height;
        ctx.fillStyle = "rgba(168,255,0,0.06)";
        ctx.fillRect(0, fy, width, 1);
      }

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
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
