"use client";

import { useEffect } from "react";
import { personal } from "@/lib/data";

const CONSOLE_ART = [
  "██╗   ██╗██╗     ██╗███████╗███████╗███████╗",
  "██║   ██║██║     ██║██╔════╝██╔════╝██╔════╝",
  "██║   ██║██║     ██║███████╗█████╗  ███████╗",
  "██║   ██║██║     ██║╚════██║██╔══╝  ╚════██║",
  "╚██████╔╝███████╗██║███████║███████╗███████║",
  " ╚═════╝ ╚══════╝╚═╝╚══════╝╚══════╝╚══════╝",
  "",
  "// IF YOU'RE READING THIS — LET'S BUILD SOMETHING.",
  "// ulisesmiranda332@gmail.com",
].join("\n");

export default function Footer() {
  const year = new Date().getFullYear();

  useEffect(() => {
    console.log(
      `%c${CONSOLE_ART}`,
      "color:#a8ff00; font-family:monospace; font-size:11px; line-height:1.5"
    );
  }, []);

  return (
    <footer className="relative border-t border-[#1e1e1e] py-8 px-6 overflow-hidden">
      {/* Circuit line decorations */}
      <div className="absolute inset-x-0 top-0 h-px" aria-hidden="true">
        <div
          className="h-full"
          style={{
            background: "linear-gradient(to right, transparent 10%, rgba(168,255,0,0.15) 30%, rgba(168,255,0,0.15) 70%, transparent 90%)",
          }}
        />
      </div>

      {/* Tick marks along top */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-[15%]" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="cyber-tick cyber-tick-v" style={{ marginTop: "-1px" }} />
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Main footer row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: system info */}
          <div className="flex items-center gap-4">
            {/* Status dot */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff00] hud-pulse" aria-hidden="true" />

            {/* Copyright — hover reveals easter egg */}
            <div className="group relative cursor-default select-none">
              <p className="font-mono text-xs text-[#555555] tracking-[0.1em] transition-opacity duration-300 group-hover:opacity-0">
                &copy; {year} {personal.nameDisplay}
              </p>
              <p
                className="absolute inset-0 font-mono text-xs tracking-[0.1em] text-[#a8ff00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                aria-hidden="true"
              >
                // HIRE ME? ✦ ulisesmiranda332@gmail.com
              </p>
            </div>
          </div>

          {/* Center: circuit divider (desktop) */}
          <div className="hidden md:flex items-center gap-2" aria-hidden="true">
            <span className="w-1 h-1 rounded-full bg-[#333333]" />
            <span className="w-16 h-px" style={{ background: "linear-gradient(to right, #333333, transparent)" }} />
            <span className="font-mono text-[7px] tracking-[0.2em] text-[#222222]">v2.0</span>
            <span className="w-16 h-px" style={{ background: "linear-gradient(to left, #333333, transparent)" }} />
            <span className="w-1 h-1 rounded-full bg-[#333333]" />
          </div>

          {/* Right: tech stack */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[8px] tracking-[0.2em] text-[#222222]" aria-hidden="true">
              BUILD.OK
            </span>
            <span className="w-px h-3 bg-[#1e1e1e]" aria-hidden="true" />
            <p className="font-mono text-xs text-[#555555] tracking-[0.1em]">
              <span className="text-[#a8ff00]">✦</span> NEXT.JS + TAILWIND
            </p>
          </div>
        </div>

        {/* Bottom data strip */}
        <div className="mt-4 pt-3 border-t border-[#111111] flex justify-center">
          <span className="font-mono text-[7px] tracking-[0.3em] text-[#1a1a1a]" aria-hidden="true">
            0x4F4E4C494E45 // SYS.NOMINAL // EOF
          </span>
        </div>
      </div>
    </footer>
  );
}
