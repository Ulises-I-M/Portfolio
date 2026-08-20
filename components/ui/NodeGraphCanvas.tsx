"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseOffset: number; // phase offset for glow pulse
}

interface Signal {
  fromIdx: number;
  toIdx: number;
  t: number;    // 0→1 progress along the edge
  speed: number;
}

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const NODE_COUNT = 38;
const CONNECT_DIST = 160; // max edge length
const SIGNAL_SPAWN_CHANCE = 0.003; // per-edge per-frame

export default function NodeGraphCanvas() {
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
    let nodes: Node[] = [];
    let signals: Signal[] = [];

    const initNodes = () => {
      const rng = mkRng(canvas.width * 3 + canvas.height * 11);
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: rng() * canvas.width,
        y: rng() * canvas.height,
        vx: (rng() - 0.5) * 0.22,
        vy: (rng() - 0.5) * 0.22,
        radius: 1.5 + rng() * 1.5,
        pulseOffset: rng() * Math.PI * 2,
      }));
      signals = [];
    };

    const rebuild = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes();
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      time += 0.012;

      // ── Update node positions ──
      for (const nd of nodes) {
        nd.x += nd.vx;
        nd.y += nd.vy;
        if (nd.x < 0 || nd.x > width) nd.vx *= -1;
        if (nd.y < 0 || nd.y > height) nd.vy *= -1;
        nd.x = Math.max(0, Math.min(width, nd.x));
        nd.y = Math.max(0, Math.min(height, nd.y));
      }

      // ── Build edge list & maybe spawn signals ──
      const edges: [number, number, number][] = []; // [i, j, dist]
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            edges.push([i, j, d]);
            if (Math.random() < SIGNAL_SPAWN_CHANCE && signals.length < 30) {
              signals.push({
                fromIdx: Math.random() > 0.5 ? i : j,
                toIdx: Math.random() > 0.5 ? j : i,
                t: 0,
                speed: 0.008 + Math.random() * 0.012,
              });
            }
          }
        }
      }

      // ── Draw edges ──
      for (const [i, j, d] of edges) {
        const alpha = (1 - d / CONNECT_DIST) * 0.12;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(168,255,0,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ── Draw signals ──
      signals = signals.filter((sig) => {
        const from = nodes[sig.fromIdx];
        const to = nodes[sig.toIdx];
        if (!from || !to) return false;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > CONNECT_DIST) return false; // edge no longer exists

        const sx = from.x + dx * sig.t;
        const sy = from.y + dy * sig.t;

        // Trail
        const TRAIL_STEPS = 6;
        for (let s = 0; s < TRAIL_STEPS; s++) {
          const tBehind = Math.max(0, sig.t - (0.18 * (s + 1)) / TRAIL_STEPS);
          const tx = from.x + dx * tBehind;
          const ty = from.y + dy * tBehind;
          const alpha = (1 - s / TRAIL_STEPS) * 0.3;
          ctx.beginPath();
          ctx.arc(tx, ty, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168,255,0,${alpha})`;
          ctx.fill();
        }

        // Head
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,255,0,0.9)";
        ctx.fill();

        // Glow halo
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,255,0,0.1)";
        ctx.fill();

        sig.t += sig.speed;
        return sig.t < 1;
      });

      // ── Draw nodes ──
      for (const nd of nodes) {
        const pulse = Math.sin(time * 1.4 + nd.pulseOffset) * 0.5 + 0.5;
        const baseAlpha = 0.25 + pulse * 0.35;

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.radius + 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,255,0,${0.04 + pulse * 0.06})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, nd.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,255,0,${baseAlpha})`;
        ctx.fill();
      }

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
