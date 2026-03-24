import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        "bg-2": "#111111",
        accent: "#a8ff00",
        "accent-dim": "#7acc00",
        muted: "#555555",
        "border-dark": "#1e1e1e",
      },
      fontFamily: {
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
