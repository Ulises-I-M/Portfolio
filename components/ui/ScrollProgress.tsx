"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none"
      style={{ background: "#111111" }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: "#a8ff00",
          boxShadow: "0 0 8px rgba(168,255,0,0.6)",
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
