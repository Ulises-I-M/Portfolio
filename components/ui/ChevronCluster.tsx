interface ChevronClusterProps {
  /** Number of chevrons (default 3) */
  count?: number;
  size?: number;
  color?: string;
  className?: string;
  /** Direction: right (default) | left | up | down */
  direction?: "right" | "left" | "up" | "down";
}

/**
 * Decorative nested chevron group — ⟩⟩⟩
 * Inspired by mecha/FUI design language (RX-09 reference).
 * Each successive chevron is slightly more opaque.
 */
export default function ChevronCluster({
  count = 3,
  size = 8,
  color = "#a8ff00",
  className = "",
  direction = "right",
}: ChevronClusterProps) {
  const rotations: Record<string, number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  const rot = rotations[direction];
  const w = size * 0.6;
  const h = size;
  const spacing = w * 0.9;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={w * count + spacing * (count - 1)}
      height={h}
      viewBox={`0 0 ${w * count + spacing * (count - 1)} ${h}`}
      style={{ transform: `rotate(${rot}deg)`, display: "inline-block" }}
    >
      {Array.from({ length: count }, (_, i) => {
        const opacity = 0.25 + (i / (count - 1)) * 0.75;
        const x = i * (w + spacing);
        const mid = h / 2;
        return (
          <polyline
            key={i}
            points={`${x},0 ${x + w},${mid} ${x},${h}`}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="square"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}
