interface HUDCornersProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
}

export default function HUDCorners({
  children,
  className = "",
  color = "#a8ff00",
  size = 14,
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
        style={{
          ...cornerStyle,
          top: 0,
          left: 0,
          borderWidth: "1px 0 0 1px",
        }}
      />
      {/* Top-right */}
      <span
        aria-hidden="true"
        style={{
          ...cornerStyle,
          top: 0,
          right: 0,
          borderWidth: "1px 1px 0 0",
        }}
      />
      {/* Bottom-left */}
      <span
        aria-hidden="true"
        style={{
          ...cornerStyle,
          bottom: 0,
          left: 0,
          borderWidth: "0 0 1px 1px",
        }}
      />
      {/* Bottom-right */}
      <span
        aria-hidden="true"
        style={{
          ...cornerStyle,
          bottom: 0,
          right: 0,
          borderWidth: "0 1px 1px 0",
        }}
      />
      {children}
    </div>
  );
}
