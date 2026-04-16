"use client";

/**
 * CRTOverlay — fixed full-screen overlay that adds two subtle CRT effects:
 *   1. Vignette: dark corners via radial gradient, transparent centre
 *   2. Scanlines: faint horizontal stripe pattern via repeating-linear-gradient
 *
 * Pure CSS — no JS, no animations, zero runtime cost.
 * Place outside BootWrapper so it appears even during the boot sequence.
 */
export default function CRTOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9998]">
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.72) 100%)",
        }}
      />
      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
        }}
      />
    </div>
  );
}
