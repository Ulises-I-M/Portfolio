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
    <footer className="border-t border-[#1e1e1e] py-8 px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright — hover reveals easter egg */}
        <div className="group relative cursor-default select-none">
          <p className="font-mono text-xs text-[#555555] tracking-[0.1em] transition-opacity duration-300 group-hover:opacity-0">
            © {year} {personal.nameDisplay}
          </p>
          <p
            className="absolute inset-0 font-mono text-xs tracking-[0.1em] text-[#a8ff00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
            aria-hidden="true"
          >
            // HIRE ME? ✦ ulisesmiranda332@gmail.com
          </p>
        </div>

        <p className="font-mono text-xs text-[#555555] tracking-[0.1em]">
          <span className="text-[#a8ff00]">✦</span> BUILT WITH NEXT.JS + TAILWIND
        </p>
      </div>
    </footer>
  );
}
