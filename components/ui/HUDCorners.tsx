interface HUDCornersProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
  /** Show edge tick marks between corners */
  ticks?: boolean;
  /** Optional top-left data label */
  label?: string;
}

export default function HUDCorners({
  children,
  className = "",
  color = "#a8ff00",
  size = 14,
  ticks = false,
  label,
}: HUDCornersProps) {
  const s = `${size}px`;
  const cornerStyle = {
    position: "absolute" as const,
    width: s,
    height: s,
    borderColor: color,
    borderStyle: "solid" as const,
    opacity: 0.7,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Top-left */}
      <span
        aria-hidden="true"
        style={{ ...cornerStyle, top: 0, left: 0, borderWidth: "1px 0 0 1px" }}
      />
      {/* Top-right */}
      <span
        aria-hidden="true"
        style={{ ...cornerStyle, top: 0, right: 0, borderWidth: "1px 1px 0 0" }}
      />
      {/* Bottom-left */}
      <span
        aria-hidden="true"
        style={{ ...cornerStyle, bottom: 0, left: 0, borderWidth: "0 0 1px 1px" }}
      />
      {/* Bottom-right */}
      <span
        aria-hidden="true"
        style={{ ...cornerStyle, bottom: 0, right: 0, borderWidth: "0 1px 1px 0" }}
      />

      {/* Edge tick marks */}
      {ticks && (
        <>
          {/* Top edge ticks */}
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ top: 0, left: "25%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ top: 0, left: "50%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ top: 0, left: "75%" }} />
          {/* Bottom edge ticks */}
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ bottom: 0, left: "25%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ bottom: 0, left: "50%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-v absolute" style={{ bottom: 0, left: "75%" }} />
          {/* Left edge ticks */}
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ left: 0, top: "25%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ left: 0, top: "50%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ left: 0, top: "75%" }} />
          {/* Right edge ticks */}
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ right: 0, top: "25%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ right: 0, top: "50%" }} />
          <span aria-hidden="true" className="cyber-tick cyber-tick-h absolute" style={{ right: 0, top: "75%" }} />
        </>
      )}

      {/* Optional data label */}
      {label && (
        <span
          aria-hidden="true"
          className="absolute font-mono text-[7px] tracking-[0.2em] uppercase"
          style={{
            top: -12,
            left: size + 4,
            color: "rgba(168,255,0,0.35)",
          }}
        >
          {label}
        </span>
      )}

      {children}
    </div>
  );
}
