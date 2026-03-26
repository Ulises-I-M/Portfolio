"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Animated hex-grid canvas background.
 * Pointy-top hexagons in a neon lime palette with a slow wave pulse.
 * Replaces the organic particle spider-web for a more cybernetic aesthetic.
 */
export default function HexGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const drawHex = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6; // pointy-top
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const R = 38;
      const hW = R * Math.sqrt(3); // pointy-top hex: flat-to-flat width
      const vH = R * 1.5;          // row-to-row vertical step

      const cols = Math.ceil(width / hW) + 2;
      const rows = Math.ceil(height / vH) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * hW + (row % 2 === 0 ? 0 : hW / 2);
          const cy = row * vH;

          // Wave pulse based on distance from centre + time
          const nx = (cx / width) - 0.5;
          const ny = (cy / height) - 0.5;
          const dist = Math.sqrt(nx * nx + ny * ny);
          const wave = Math.sin(time * 0.6 - dist * 8) * 0.5 + 0.5;

          const baseOpacity = 0.04;
          const pulseOpacity = wave * 0.06;
          const opacity = baseOpacity + pulseOpacity;

          // Hex outline
          drawHex(cx, cy, R - 2);
          ctx.strokeStyle = `rgba(168,255,0,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Occasional filled accent hex (grid intersection nodes)
          if ((Math.abs(col * 3 + row * 7)) % 11 === 0) {
            ctx.fillStyle = `rgba(168,255,0,${opacity * 0.4})`;
            ctx.fill();

            // Centre node dot
            ctx.beginPath();
            ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(168,255,0,${opacity * 2.5})`;
            ctx.fill();
          }
        }
      }

      time += 0.008;
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
