"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const CELL  = 55;   // world-space cell size
const COLS  = 26;   // grid columns
const ROWS  = 32;   // grid rows (extra rows for scroll wrap)
const FOV   = 480;  // perspective focal length
const CAM_Z = 220;  // camera Z distance
const CAM_Y = 90;   // camera elevation (higher = more top-down)
const SCROLL_SPEED = 0.18; // world units per frame

/** Sum-of-sines height approximation (no external noise lib needed) */
const heightAt = (x: number, z: number, t: number) =>
  Math.sin(x * 0.09 + t * 0.35) * 20
  + Math.sin(z * 0.11 - t * 0.28) * 14
  + Math.sin((x + z) * 0.065 + t * 0.18) * 9
  + Math.sin((x - z) * 0.04 - t * 0.12) * 5;

/** Simple perspective projection */
const project = (
  wx: number, wy: number, wz: number,
  W: number, H: number
) => {
  const scale = FOV / (wz + CAM_Z);
  return {
    sx: W / 2 + wx * scale,
    sy: H * 0.42 + (wy - CAM_Y) * scale, // horizon at 42%, camera elevated
    scale,
  };
};

export default function NoiseTerrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let time   = 0;
    let offset = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      time   += 0.008;
      offset += SCROLL_SPEED;

      // World X range: centre the grid
      const totalW = (COLS - 1) * CELL;

      // Pre-compute projected vertices
      const verts: { sx: number; sy: number; alpha: number }[][] = [];

      for (let row = 0; row < ROWS; row++) {
        verts[row] = [];
        for (let col = 0; col < COLS; col++) {
          // World coords
          const wx = col * CELL - totalW / 2;
          // Z: rows scroll toward camera (decreasing Z = closer)
          const wz = row * CELL - (offset % (ROWS * CELL));
          const wy = heightAt(col, row + offset / CELL, time);

          // Skip vertices behind the camera
          if (wz + CAM_Z <= 10) {
            verts[row][col] = { sx: 0, sy: 0, alpha: 0 };
            continue;
          }

          const { sx, sy, scale } = project(wx, wy, wz, width, height);

          // Depth fog: far = faint, near = brighter (but always subtle)
          const depth = Math.max(0, Math.min(1, 1 - wz / (ROWS * CELL)));
          const alpha = 0.02 + depth * 0.13;

          verts[row][col] = { sx, sy, alpha };
        }
      }

      // Draw horizontal grid lines (across cols)
      for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 0; col < COLS - 1; col++) {
          const a = verts[row][col];
          const b = verts[row][col + 1];
          if (!a.alpha || !b.alpha) continue;

          const alpha = (a.alpha + b.alpha) / 2;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(4)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Draw vertical grid lines (across rows)
      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS - 1; row++) {
          const a = verts[row][col];
          const b = verts[row + 1][col];
          if (!a.alpha || !b.alpha) continue;

          const alpha = (a.alpha + b.alpha) / 2;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = `rgba(168,255,0,${alpha.toFixed(4)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
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
