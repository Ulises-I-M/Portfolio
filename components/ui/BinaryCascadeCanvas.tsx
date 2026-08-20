"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Block {
  x: number;
  y: number;
  lines: string[];
  alpha: number;
  state: "in" | "hold" | "out";
  tick: number;      // frames in current state
  holdFor: number;   // frames to hold at full alpha
}

// Generate a random binary byte string e.g. "01001101"
const randomByte = () =>
  Array.from({ length: 8 }, () => (Math.random() > 0.5 ? "1" : "0")).join("");

const buildBlock = (W: number, H: number): Block => {
  const lineCount = 1 + Math.floor(Math.random() * 3); // smaller: 1–3 lines
  const lines = Array.from({ length: lineCount }, () => {
    const bytes = 1 + Math.floor(Math.random() * 2); // 1–2 bytes only
    return Array.from({ length: bytes }, randomByte).join("  ");
  });
  return {
    x: Math.random() * (W - 140) + 20,
    y: Math.random() * (H - lineCount * 16 - 20) + 10,
    lines,
    alpha: 0,
    state: "in",
    tick: 0,
    holdFor: 80 + Math.floor(Math.random() * 160), // hold longer before fading
  };
};

const MAX_BLOCKS = 6;
const FADE_FRAMES = 30;
const MAX_ALPHA   = 0.13; // very subtle — texture only

export default function BinaryCascadeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let blocks: Block[] = [];
    let spawnTimer = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Spawn new blocks
      spawnTimer--;
      if (spawnTimer <= 0 && blocks.length < MAX_BLOCKS) {
        blocks.push(buildBlock(width, height));
        spawnTimer = 40 + Math.floor(Math.random() * 80);
      }

      // Draw & update each block
      blocks = blocks.filter((b) => {
        b.tick++;

        if (b.state === "in") {
          b.alpha = Math.min(MAX_ALPHA, (b.tick / FADE_FRAMES) * MAX_ALPHA);
          if (b.tick >= FADE_FRAMES) { b.state = "hold"; b.tick = 0; }
        } else if (b.state === "hold") {
          b.alpha = MAX_ALPHA;
          if (b.tick >= b.holdFor) { b.state = "out"; b.tick = 0; }
        } else {
          b.alpha = Math.max(0, MAX_ALPHA - (b.tick / FADE_FRAMES) * MAX_ALPHA);
          if (b.tick >= FADE_FRAMES) return false;
        }

        const LINE_H = 15;
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = "left";

        b.lines.forEach((line, i) => {
          ctx.fillStyle = `rgba(168,255,0,${b.alpha.toFixed(3)})`;
          ctx.fillText(line, b.x, b.y + i * LINE_H);
        });

        return true;
      });

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
