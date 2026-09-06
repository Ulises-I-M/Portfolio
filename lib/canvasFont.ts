/**
 * Resolves the app's monospace family for use in `ctx.font`.
 *
 * next/font generates a hashed family name at build time, exposed to CSS as
 * --font-space-mono. Canvas does not resolve `var()`, so the value has to be
 * read off the document before it can be put in a font shorthand.
 */
export function monoFamily(): string {
  if (typeof document === "undefined") return "ui-monospace, monospace";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-space-mono")
    .trim();
  return v ? `${v}, ui-monospace, monospace` : "ui-monospace, monospace";
}
