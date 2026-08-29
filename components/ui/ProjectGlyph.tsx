"use client";

import type { ProjectGlyph as GlyphKind } from "@/lib/data";

/**
 * Stand-in artwork for projects with no shareable screenshot — enterprise
 * deployments behind an NDA, mostly. Rather than borrow an unrelated capture,
 * each card gets a schematic drawn from its own domain: a routing polyline for
 * the waste-collection work, a level trend for the pump SCADA, and so on.
 *
 * Everything is derived from the project title, so a given project always draws
 * the same figure — server and client included, which is what keeps hydration
 * quiet without a useEffect.
 */

const W = 320;
const H = 180;

const NEON = "#a8ff00";

// FNV-1a — small, stable, and enough spread for the seeds below
function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Deterministic 0..1 generator (LCG), so a seed replays the same figure. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type MotifProps = { rand: () => number };

// ─── Motifs ──────────────────────────────────────────────────────────────────

/** Device mesh — the platform work: many entities, few hops between them. */
function Nodes({ rand }: MotifProps) {
  const pts = Array.from({ length: 11 }, () => ({
    x: 26 + rand() * (W - 52),
    y: 24 + rand() * (H - 48),
    r: 1.6 + rand() * 2.4,
  }));
  const links: [number, number][] = [];
  pts.forEach((a, i) => {
    pts.forEach((b, j) => {
      if (j <= i) return;
      if (Math.hypot(a.x - b.x, a.y - b.y) < 82) links.push([i, j]);
    });
  });
  return (
    <g>
      {links.map(([i, j], k) => (
        <line
          key={k}
          x1={pts[i].x}
          y1={pts[i].y}
          x2={pts[j].x}
          y2={pts[j].y}
          stroke={NEON}
          strokeWidth={0.6}
          opacity={0.22}
        />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={NEON} opacity={0.5} />
      ))}
    </g>
  );
}

/** Sweep and blips — personnel tracking on a site. */
function Radar({ rand }: MotifProps) {
  const cx = W / 2;
  const cy = H / 2;
  return (
    <g>
      {[26, 48, 70].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={NEON} strokeWidth={0.7} opacity={0.22} />
      ))}
      <line x1={cx - 78} y1={cy} x2={cx + 78} y2={cy} stroke={NEON} strokeWidth={0.5} opacity={0.15} />
      <line x1={cx} y1={cy - 78} x2={cx} y2={cy + 78} stroke={NEON} strokeWidth={0.5} opacity={0.15} />
      <path
        d={`M ${cx} ${cy} L ${cx + 70} ${cy - 34} A 78 78 0 0 0 ${cx + 76} ${cy + 8} Z`}
        fill={NEON}
        opacity={0.08}
      />
      {Array.from({ length: 7 }, (_, i) => {
        const a = rand() * Math.PI * 2;
        const d = 14 + rand() * 62;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * d}
            cy={cy + Math.sin(a) * d * 0.72}
            r={2.2}
            fill={NEON}
            opacity={0.45 + rand() * 0.4}
          />
        );
      })}
    </g>
  );
}

/** Stops along a planned run — the collection routing. */
function Route({ rand }: MotifProps) {
  const stops = Array.from({ length: 7 }, (_, i) => ({
    x: 24 + (i * (W - 48)) / 6,
    y: 42 + rand() * (H - 96),
  }));
  const d = stops.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <g>
      <path d={d} fill="none" stroke={NEON} strokeWidth={1.1} opacity={0.4} />
      <path d={d} fill="none" stroke={NEON} strokeWidth={0.6} opacity={0.5} strokeDasharray="3 5" />
      {stops.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4.2} fill="none" stroke={NEON} strokeWidth={0.9} opacity={0.55} />
          <circle cx={p.x} cy={p.y} r={1.6} fill={NEON} opacity={0.7} />
        </g>
      ))}
    </g>
  );
}

/** Level trend with a threshold band — the wet-well reading. */
function Wave({ rand }: MotifProps) {
  const n = 42;
  const pts = Array.from({ length: n }, (_, i) => {
    const x = 16 + (i * (W - 32)) / (n - 1);
    const y =
      H / 2 +
      Math.sin(i / 4.4) * 26 +
      Math.sin(i / 1.7) * 7 +
      (rand() - 0.5) * 6;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = `M ${pts.join(" L ")}`;
  return (
    <g>
      <line x1={0} y1={52} x2={W} y2={52} stroke={NEON} strokeWidth={0.6} opacity={0.25} strokeDasharray="4 4" />
      <path d={`${line} L ${W - 16} ${H} L 16 ${H} Z`} fill={NEON} opacity={0.07} />
      <path d={line} fill="none" stroke={NEON} strokeWidth={1.3} opacity={0.55} />
    </g>
  );
}

/** Severity grid — one cell per unit in the fleet. */
function Grid({ rand }: MotifProps) {
  const cols = 12;
  const rows = 6;
  const cw = (W - 28) / cols;
  const ch = (H - 28) / rows;
  return (
    <g>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const v = rand();
        return (
          <rect
            key={i}
            x={14 + c * cw + 1.5}
            y={14 + r * ch + 1.5}
            width={cw - 3}
            height={ch - 3}
            fill={NEON}
            opacity={v > 0.82 ? 0.2 : v > 0.55 ? 0.09 : 0.04}
          />
        );
      })}
    </g>
  );
}

/** Counted flow — entries and exits over a window. */
function Bars({ rand }: MotifProps) {
  const n = 20;
  const bw = (W - 32) / n;
  return (
    <g>
      <line x1={16} y1={H - 26} x2={W - 16} y2={H - 26} stroke={NEON} strokeWidth={0.6} opacity={0.3} />
      {Array.from({ length: n }, (_, i) => {
        const h = 12 + rand() * 96;
        return (
          <rect
            key={i}
            x={16 + i * bw + bw * 0.22}
            y={H - 26 - h}
            width={bw * 0.56}
            height={h}
            fill={NEON}
            opacity={0.1 + (h / 108) * 0.22}
          />
        );
      })}
    </g>
  );
}

/** Vibration samples under a fitted trend — the predictive work. */
function Scatter({ rand }: MotifProps) {
  const pts = Array.from({ length: 46 }, () => {
    const x = 20 + rand() * (W - 40);
    const drift = (x / W) * 54;
    const y = H - 44 - drift + (rand() - 0.5) * 42;
    return { x, y: Math.max(16, Math.min(H - 16, y)) };
  });
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.8} fill={NEON} opacity={0.4} />
      ))}
      <line x1={20} y1={H - 44} x2={W - 20} y2={H - 96} stroke={NEON} strokeWidth={1.2} opacity={0.6} />
      <line
        x1={20}
        y1={H - 24}
        x2={W - 20}
        y2={H - 76}
        stroke={NEON}
        strokeWidth={0.6}
        opacity={0.22}
        strokeDasharray="5 4"
      />
    </g>
  );
}

/** Valves on a line — the plant piping. */
function Flow({ rand }: MotifProps) {
  const rows = [46, 90, 134];
  return (
    <g>
      {rows.map((y, r) => {
        const valves = Array.from({ length: 3 }, (_, i) => 58 + i * 84 + (rand() - 0.5) * 18);
        return (
          <g key={r}>
            <line x1={14} y1={y} x2={W - 14} y2={y} stroke={NEON} strokeWidth={0.9} opacity={0.28} />
            {valves.map((x, i) => {
              const open = rand() > 0.42;
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <path
                    d="M -7 -6 L 0 0 L -7 6 Z M 7 -6 L 0 0 L 7 6 Z"
                    fill={open ? NEON : "none"}
                    stroke={NEON}
                    strokeWidth={0.9}
                    opacity={open ? 0.5 : 0.35}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Honeycomb — the fleet-management build. */
function Hex({ rand }: MotifProps) {
  const r = 15;
  const dx = r * 1.72;
  const dy = r * 1.5;
  const cells: { cx: number; cy: number; on: boolean }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      cells.push({
        cx: 14 + col * dx + (row % 2 ? dx / 2 : 0),
        cy: 18 + row * dy,
        on: rand() > 0.74,
      });
    }
  }
  const path = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" L ");
  return (
    <g>
      {cells.map((c, i) => (
        <path
          key={i}
          d={`M ${path(c.cx, c.cy)} Z`}
          fill={c.on ? NEON : "none"}
          fillOpacity={c.on ? 0.1 : 0}
          stroke={NEON}
          strokeWidth={0.6}
          opacity={c.on ? 0.34 : 0.13}
        />
      ))}
    </g>
  );
}

const MOTIFS: Record<GlyphKind, (p: MotifProps) => React.ReactElement> = {
  nodes: Nodes,
  radar: Radar,
  route: Route,
  wave: Wave,
  grid: Grid,
  bars: Bars,
  scatter: Scatter,
  flow: Flow,
  hex: Hex,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectGlyph({
  code,
  kind = "nodes",
  seed,
  /** Larger type for the modal, where the panel is read rather than scanned. */
  scale = 1,
}: {
  code: string;
  kind?: GlyphKind;
  seed: string;
  scale?: number;
}) {
  const rand = makeRng(hashString(seed));
  const Motif = MOTIFS[kind] ?? Nodes;
  const gridId = `pg-grid-${hashString(seed).toString(36)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      role="img"
      aria-label={`${code} — schematic placeholder`}
    >
      <defs>
        <pattern id={gridId} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke={NEON} strokeWidth="0.4" opacity="0.07" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill="#0b0b0b" />
      <rect width={W} height={H} fill={`url(#${gridId})`} />

      <Motif rand={rand} />

      {/* Sigil — the card's identity when there is no screenshot to carry it */}
      <text
        x={W / 2}
        y={H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize={54 * scale}
        fontWeight={700}
        letterSpacing={8 * scale}
        fill="#efefef"
        opacity={0.13}
      >
        {code}
      </text>

      {/* Registration ticks, so the plate reads as a drawing and not a fallback */}
      <g opacity={0.3}>
        <line x1={W / 2 - 6} y1={6} x2={W / 2 + 6} y2={6} stroke={NEON} strokeWidth={0.8} />
        <line x1={W / 2 - 6} y1={H - 6} x2={W / 2 + 6} y2={H - 6} stroke={NEON} strokeWidth={0.8} />
      </g>
    </svg>
  );
}
