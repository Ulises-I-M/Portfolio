"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Seg { x1: number; y1: number; x2: number; y2: number; len: number }
interface Trace { segs: Seg[]; totalLen: number; nodes: { x: number; y: number }[] }
interface Pulse { traceIdx: number; t: number; speed: number } // t in [0, totalLen]

// ─── Deterministic pseudo-RNG (seeded, no Math.random) ────────────────────────

function mkRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Trace builder ─────────────────────────────────────────────────────────────

function buildTraces(W: number, H: number, rng: () => number): Trace[] {
  const CELL = 72;       // grid snap size
  const TRACE_COUNT = 22;
  const traces: Trace[] = [];

  for (let i = 0; i < TRACE_COUNT; i++) {
    // Random grid-aligned start
    const cols = Math.floor(W / CELL);
    const rows = Math.floor(H / CELL);
    let x = Math.floor(rng() * cols) * CELL;
    let y = Math.floor(rng() * rows) * CELL;

    const segs: Seg[] = [];
    const nodes: { x: number; y: number }[] = [{ x, y }];

    // Horizontal first or vertical first
    let dir: "h" | "v" = rng() > 0.5 ? "h" : "v";
    const bends = 2 + Math.floor(rng() * 3); // 2–4 bends

    for (let b = 0; b < bends; b++) {
      const steps = 2 + Math.floor(rng() * 5); // 2–6 cells
      let nx = x;
      let ny = y;

      if (dir === "h") {
        nx = Math.min(Math.max(x + (rng() > 0.5 ? 1 : -1) * steps * CELL, 0), W);
      } else {
        ny = Math.min(Math.max(y + (rng() > 0.5 ? 1 : -1) * steps * CELL, 0), H);
      }

      const len = Math.abs(dir === "h" ? nx - x : ny - y);
      if (len > 0) {
        segs.push({ x1: x, y1: y, x2: nx, y2: ny, len });
        nodes.push({ x: nx, y: ny });
      }

      x = nx;
      y = ny;
      dir = dir === "h" ? "v" : "h"; // 90° turn
    }

    const totalLen = segs.reduce((acc, s) => acc + s.len, 0);
    if (totalLen > 0) traces.push({ segs, totalLen, nodes });
  }

  return traces;
}

// ─── Position along a trace at distance dist ──────────────────────────────────

function posAlongTrace(trace: Trace, dist: number): { x: number; y: number } {
  let remaining = dist;
  for (const seg of trace.segs) {
    if (remaining <= seg.len) {
      const pct = remaining / seg.len;
      return {
        x: seg.x1 + (seg.x2 - seg.x1) * pct,
        y: seg.y1 + (seg.y2 - seg.y1) * pct,
      };
    }
    remaining -= seg.len;
  }
  const last = trace.segs[trace.segs.length - 1];
  return { x: last.x2, y: last.y2 };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CircuitPulseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let traces: Trace[] = [];
    let pulses: Pulse[] = [];

    const spawnPulses = () => {
      const rng = mkRng(0xbeef);
      pulses = traces.map((tr, idx) => ({
        traceIdx: idx,
        // stagger starting positions so they don't all start at t=0
        t: rng() * tr.totalLen,
        speed: 0.6 + rng() * 0.8, // px per frame (~36–48 px/s at 60 fps)
      }));
    };

    const rebuild = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const rng = mkRng(canvas.width * 7 + canvas.height * 13);
      traces = buildTraces(canvas.width, canvas.height, rng);
      spawnPulses();
    };

    const TRAIL_LEN = 28; // px

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // ── 1. Trace lines ──
      ctx.lineWidth = 0.8;
      for (const tr of traces) {
        for (const seg of tr.segs) {
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.strokeStyle = "rgba(168,255,0,0.07)";
          ctx.stroke();
        }
      }

      // ── 2. Node dots ──
      for (const tr of traces) {
        for (const nd of tr.nodes) {
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(168,255,0,0.18)";
          ctx.fill();
        }
      }

      // ── 3. Pulses ──
      for (const pulse of pulses) {
        const tr = traces[pulse.traceIdx];
        if (!tr) continue;

        const head = posAlongTrace(tr, pulse.t);

        // Trail — sample a few points behind the head
        const STEPS = 8;
        for (let s = 0; s < STEPS; s++) {
          const behind = Math.max(0, pulse.t - (TRAIL_LEN * (s + 1)) / STEPS);
          const tp = posAlongTrace(tr, behind);
          const alpha = (1 - s / STEPS) * 0.35;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168,255,0,${alpha})`;
          ctx.fill();
        }

        // Head dot — bright
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,255,0,0.95)";
        ctx.fill();

        // Glow halo
        ctx.beginPath();
        ctx.arc(head.x, head.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,255,0,0.12)";
        ctx.fill();

        // Advance
        pulse.t += pulse.speed;
        if (pulse.t > tr.totalLen) pulse.t = 0;
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
