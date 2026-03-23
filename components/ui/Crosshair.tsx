interface CrosshairProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function Crosshair({
  className = "",
  size = 16,
  color = "#a8ff00",
}: CrosshairProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <line x1="8" y1="0" x2="8" y2="6" stroke={color} strokeWidth="1" />
      <line x1="8" y1="10" x2="8" y2="16" stroke={color} strokeWidth="1" />
      <line x1="0" y1="8" x2="6" y2="8" stroke={color} strokeWidth="1" />
      <line x1="10" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1" />
      <circle cx="8" cy="8" r="1.5" fill={color} />
    </svg>
  );
}
