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
  const lineCount = 3 + Math.floor(Math.random() * 5);
  const lines = Array.from({ length: lineCount }, () => {
    const bytes = 1 + Math.floor(Math.random() * 3);
    return Array.from({ length: bytes }, randomByte).join("  ");
  });
  return {
    x: Math.random() * (W - 160) + 20,
    y: Math.random() * (H - lineCount * 16 - 20) + 10,
    lines,
    alpha: 0,
    state: "in",
    tick: 0,
    holdFor: 60 + Math.floor(Math.random() * 120),
  };
};

const MAX_BLOCKS = 9;
const FADE_FRAMES = 20;

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
        spawnTimer = 18 + Math.floor(Math.random() * 40);
      }

      // Draw & update each block
      blocks = blocks.filter((b) => {
        b.tick++;

        if (b.state === "in") {
          b.alpha = Math.min(1, b.tick / FADE_FRAMES);
          if (b.tick >= FADE_FRAMES) { b.state = "hold"; b.tick = 0; }
        } else if (b.state === "hold") {
          b.alpha = 1;
          // Randomly mutate one character to simulate live data
          if (Math.random() < 0.03) {
            const li = Math.floor(Math.random() * b.lines.length);
            const chars = b.lines[li].split("");
            const ci = Math.floor(Math.random() * chars.length);
            if (chars[ci] === "0") chars[ci] = "1";
            else if (chars[ci] === "1") chars[ci] = "0";
            b.lines[li] = chars.join("");
          }
          if (b.tick >= b.holdFor) { b.state = "out"; b.tick = 0; }
        } else {
          b.alpha = Math.max(0, 1 - b.tick / FADE_FRAMES);
          if (b.tick >= FADE_FRAMES) return false; // remove
        }

        const LINE_H = 15;
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = "left";

        b.lines.forEach((line, i) => {
          // Dim all lines slightly except a "cursor" line that cycles
          const isCursor = (b.state === "hold") &&
            (Math.floor(b.tick / 8) % b.lines.length === i);
          const lineAlpha = b.alpha * (isCursor ? 0.95 : 0.38);

          ctx.fillStyle = `rgba(168,255,0,${lineAlpha.toFixed(3)})`;
          ctx.fillText(line, b.x, b.y + i * LINE_H);
        });

        // Bracket decoration around the block
        const bW = Math.max(...b.lines.map((l) => ctx.measureText(l).width) );
        const bH = b.lines.length * LINE_H;
        const alpha = b.alpha * 0.18;
        ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.6;
        // top-left corner
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y - 12 + 6); ctx.lineTo(b.x - 4, b.y - 12); ctx.lineTo(b.x - 4 + 6, b.y - 12);
        ctx.stroke();
        // bottom-right corner
        ctx.beginPath();
        ctx.moveTo(b.x + bW + 4 - 6, b.y + bH); ctx.lineTo(b.x + bW + 4, b.y + bH); ctx.lineTo(b.x + bW + 4, b.y + bH - 6);
        ctx.stroke();

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
