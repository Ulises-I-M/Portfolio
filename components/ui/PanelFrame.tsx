interface PanelFrameProps {
  children: React.ReactNode;
  label: string;
  /** Optional status text shown on the right of the header */
  status?: string;
  className?: string;
}

/**
 * FUI-style panel container.
 * Thin border with a floating label on the top edge — inspired by
 * "ENERGY REACTOR" / "MEMORY CLUSTERS" panels from cyberpunk HUD references.
 */
export default function PanelFrame({
  children,
  label,
  status,
  className = "",
}: PanelFrameProps) {
  return (
    <div
      className={`relative border border-[#1e1e1e] pt-5 pb-5 px-5 ${className}`}
    >
      {/* Top-edge floating label row */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3"
        style={{ transform: "translateY(-50%)" }}
        aria-hidden="true"
      >
        {/* Left label */}
        <span className="panel-label">
          {label}
        </span>

        {/* Right status */}
        {status && (
          <span className="panel-label" style={{ color: "rgba(168,255,0,0.3)" }}>
            {status}
          </span>
        )}
      </div>

      {/* Top-left corner accent */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 w-2 h-2"
        style={{
          borderTop: "1px solid rgba(168,255,0,0.4)",
          borderLeft: "1px solid rgba(168,255,0,0.4)",
        }}
      />

      {/* Bottom-right corner accent */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-2 h-2"
        style={{
          borderBottom: "1px solid rgba(168,255,0,0.4)",
          borderRight: "1px solid rgba(168,255,0,0.4)",
        }}
      />

      {children}
    </div>
  );
}
