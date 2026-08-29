"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personal, skills, projects, social } from "@/lib/data";

type Line = { type: "input" | "output" | "error" | "blank"; text: string };

const PROMPT = "> ";

const HELP_TEXT = `
available commands:
  help        — show this message
  whoami      — about me
  skills      — tech stack
  projects    — list projects
  contact     — contact info
  social      — social links
  clear       — clear terminal
  exit        — close terminal
`.trim();

function processCommand(raw: string): Line[] {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return [];

  const lines: Line[] = [{ type: "input", text: `${PROMPT}${raw}` }];

  switch (cmd) {
    case "help":
      HELP_TEXT.split("\n").forEach((l) => lines.push({ type: "output", text: l }));
      break;

    case "whoami":
      [
        `name     : ${personal.name}`,
        `role     : ${personal.role}`,
        `location : ${personal.location}`,
        `email    : ${personal.email}`,
        `status   : available for hire`,
      ].forEach((l) => lines.push({ type: "output", text: l }));
      break;

    case "skills":
      lines.push({ type: "output", text: "tech stack:" });
      skills.forEach((s) => lines.push({ type: "output", text: `  — ${s.name}` }));
      break;

    case "projects":
      lines.push({ type: "output", text: "projects:" });
      projects.forEach((p) =>
        lines.push({
          type: "output",
          text: `  [${p.category.toUpperCase()}] ${p.title} → ${p.url ?? "private deployment"}`,
        })
      );
      break;

    case "contact":
      [
        `email    : ${personal.email}`,
        `phone    : ${personal.phone}`,
        `location : ${personal.location}`,
      ].forEach((l) => lines.push({ type: "output", text: l }));
      break;

    case "social":
      social.forEach((s) =>
        lines.push({ type: "output", text: `  ${s.label.padEnd(12)} ${s.url}` })
      );
      break;

    case "clear":
      return [{ type: "blank", text: "__CLEAR__" }];

    case "exit":
    case "quit":
    case "close":
      return [{ type: "blank", text: "__EXIT__" }];

    default:
      lines.push({ type: "error", text: `command not found: ${cmd}. type 'help' for options.` });
  }

  lines.push({ type: "blank", text: "" });
  return lines;
}

const BOOT_LINES = [
  "ULISES_MIRANDA TERMINAL v1.0",
  "──────────────────────────────────",
  `LOC: ${personal.locationCode}  //  ROLE: ${personal.role.toUpperCase()}`,
  "──────────────────────────────────",
  "type 'help' for available commands",
  "",
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(
    BOOT_LINES.map((t) => ({ type: "output" as const, text: t }))
  );
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Global key listener — open on backtick
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`" && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll to bottom on new lines
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const submit = () => {
    if (!input.trim() && input !== "") {
      setLines((prev) => [...prev, { type: "blank", text: "" }]);
      setInput("");
      return;
    }
    const result = processCommand(input);

    if (result[0]?.text === "__CLEAR__") {
      setLines(BOOT_LINES.map((t) => ({ type: "output" as const, text: t })));
    } else if (result[0]?.text === "__EXIT__") {
      close();
    } else {
      setLines((prev) => [...prev, ...result]);
    }
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <>
      {/* Floating trigger button — always visible */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open terminal"
        className="fixed bottom-8 left-8 z-[150] flex items-center gap-2 border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-[#555555] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-all duration-200 cursor-pointer group"
      >
        <span className="text-[#a8ff00] group-hover:opacity-100 opacity-60">&gt;_</span>
        TERMINAL
      </button>

    <AnimatePresence>
      {open && (
        <motion.div
          key="terminal"
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div
            className="relative w-full max-w-2xl border border-[#1e1e1e] bg-[#0a0a0a] flex flex-col"
            style={{ maxHeight: "80vh", boxShadow: "0 0 40px rgba(168,255,0,0.08)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#a8ff00]">
                TERMINAL
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[9px] tracking-[0.15em] text-[#333333]">
                  ESC to close
                </span>
                <button
                  onClick={close}
                  aria-label="Close terminal"
                  className="font-mono text-xs text-[#555555] hover:text-[#a8ff00] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto px-4 py-4 font-mono text-xs leading-relaxed" style={{ minHeight: "240px" }}>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.type === "input"
                      ? "text-[#a8ff00]"
                      : line.type === "error"
                      ? "text-red-400"
                      : "text-[#555555]"
                  }
                >
                  {line.text || "\u00A0"}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="flex items-center gap-0 border-t border-[#1e1e1e] px-4 py-3">
              <span className="font-mono text-xs text-[#a8ff00] select-none">{PROMPT}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent font-mono text-xs text-[#efefef] outline-none tracking-wide placeholder:text-[#333333]"
                placeholder="type a command..."
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
