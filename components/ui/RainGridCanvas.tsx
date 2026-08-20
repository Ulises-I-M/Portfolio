"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  col: number;   // grid column index
  y: number;     // current head y (px)
  len: number;   // trail length (px)
  speed: number; // px per frame
  alpha: number; // base opacity
}

export default function RainGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const GRID = 40; // cell size
    let particles: Particle[] = [];
    let cols = 0;
    let rows = 0;

    const buildGrid = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols = Math.ceil(canvas.width / GRID) + 1;
      rows = Math.ceil(canvas.height / GRID) + 1;

      // Spawn ~40% of columns with a particle, staggered vertically
      particles = [];
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.45) {
          particles.push(spawnParticle(c, -Math.random() * canvas.height));
        }
      }
    };

    const spawnParticle = (col: number, startY: number): Particle => ({
      col,
      y: startY,
      len: 20 + Math.random() * 60,
      speed: 0.5 + Math.random() * 1.0,
      alpha: 0.3 + Math.random() * 0.45,
    });

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // ── Grid dots ──
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const x = c * GRID;
          const y = r * GRID;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(168,255,0,0.12)";
          ctx.fill();
        }
      }

      // ── Grid lines (very faint, only vertical — the "rain tracks") ──
      ctx.lineWidth = 0.4;
      for (let c = 0; c <= cols; c++) {
        const x = c * GRID;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.strokeStyle = "rgba(168,255,0,0.03)";
        ctx.stroke();
      }

      // ── Particles (falling streaks) ──
      for (const p of particles) {
        const x = p.col * GRID;
        const tailY = Math.max(0, p.y - p.len);
        const headY = p.y;

        // Gradient trail: transparent at tail → bright at head
        const grad = ctx.createLinearGradient(x, tailY, x, headY);
        grad.addColorStop(0, `rgba(168,255,0,0)`);
        grad.addColorStop(0.6, `rgba(168,255,0,${(p.alpha * 0.4).toFixed(3)})`);
        grad.addColorStop(1, `rgba(168,255,0,${p.alpha.toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(x, tailY);
        ctx.lineTo(x, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bright head dot
        ctx.beginPath();
        ctx.arc(x, headY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,255,180,${Math.min(1, p.alpha * 1.4).toFixed(3)})`;
        ctx.fill();

        // Glow halo at head
        ctx.beginPath();
        ctx.arc(x, headY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,255,0,${(p.alpha * 0.15).toFixed(3)})`;
        ctx.fill();

        // Advance
        p.y += p.speed;

        // Reset when fully off bottom
        if (p.y - p.len > height) {
          p.y = -Math.random() * height * 0.3;
          p.len = 20 + Math.random() * 60;
          p.speed = 0.5 + Math.random() * 1.0;
          p.alpha = 0.3 + Math.random() * 0.45;
        }
      }

      // ── Occasionally spawn a new particle on an empty column ──
      if (Math.random() < 0.015) {
        const col = Math.floor(Math.random() * cols);
        // Only add if no active particle near the top of this column
        const busy = particles.some((p) => p.col === col && p.y < canvas.height * 0.3);
        if (!busy) particles.push(spawnParticle(col, 0));
      }

      rafId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(buildGrid);
    ro.observe(canvas);
    buildGrid();
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
