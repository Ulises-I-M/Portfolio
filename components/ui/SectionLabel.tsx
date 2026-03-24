interface SectionLabelProps {
  index: string;
  label: string;
  className?: string;
}

export default function SectionLabel({
  index,
  label,
  className = "",
}: SectionLabelProps) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] ${className}`}
    >
      <span className="text-[#a8ff00]">{index}</span>
      <span
        className="h-px w-8 bg-[#a8ff00] opacity-40"
        aria-hidden="true"
      />
      <span className="text-[#555555] uppercase">{label}</span>
    </div>
  );
}
