"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { lang, toggle } = useLang();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["home", "about", "experience", "education", "projects", "testimonials", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#1e1e1e]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        {/* Logo with status dot */}
        <a
          href="/#home"
          className="flex items-center gap-2 font-mono text-sm tracking-[0.15em] text-[#a8ff00] hover:opacity-80 transition-opacity"
          aria-label="Ulises Miranda — back to top"
        >
          {/* Status dot */}
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#a8ff00] hud-pulse flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-[#333333]">&gt;</span> UM
        </a>

        {/* Desktop links + status + lang toggle */}
        <div className="hidden md:flex items-center gap-8">
          {/* System coordinates */}
          <span className="font-mono text-[8px] tracking-[0.2em] text-[#222222]" aria-hidden="true">
            SYS.ONLINE
          </span>

          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = active === sectionId;
              return (
                <li key={link.href}>
                  <a
                    href={`/${link.href}`}
                    className="relative font-mono text-xs tracking-[0.2em] transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                    style={{ color: isActive ? "#a8ff00" : "#555555" }}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <span
                        className="w-1 h-1 rounded-full bg-[#a8ff00] flex-shrink-0"
                        style={{ boxShadow: "0 0 4px rgba(168,255,0,0.6)" }}
                        aria-hidden="true"
                      />
                    )}
                    {link.label}
                    {isActive && !prefersReducedMotion && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-[#a8ff00]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Divider tick */}
          <span className="w-px h-4 bg-[#1e1e1e]" aria-hidden="true" />

          {/* Language toggle */}
          <button
            onClick={toggle}
            aria-label={`Switch to ${lang === "en" ? "Spanish" : "English"}`}
            className="font-mono text-[10px] tracking-[0.2em] border border-[#1e1e1e] px-2 py-1 text-[#555555] hover:border-[#a8ff00] hover:text-[#a8ff00] transition-all duration-200 cursor-pointer"
          >
            <span style={{ color: lang === "en" ? "#a8ff00" : "#555555" }}>EN</span>
            <span className="text-[#333333] mx-1">|</span>
            <span style={{ color: lang === "es" ? "#a8ff00" : "#555555" }}>ES</span>
          </button>
        </div>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-3">
          {/* Language toggle mobile */}
          <button
            onClick={toggle}
            aria-label={`Switch to ${lang === "en" ? "Spanish" : "English"}`}
            className="font-mono text-[9px] tracking-[0.15em] text-[#555555] cursor-pointer"
          >
            <span style={{ color: lang === "en" ? "#a8ff00" : "#555555" }}>EN</span>
            <span className="text-[#333333] mx-0.5">|</span>
            <span style={{ color: lang === "es" ? "#a8ff00" : "#555555" }}>ES</span>
          </button>

          {/* Hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex flex-col gap-[5px] cursor-pointer p-2"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className="block h-px w-6 bg-[#efefef] transition-transform duration-200"
              style={{ transform: menuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }}
            />
            <span
              className="block h-px w-6 bg-[#efefef] transition-opacity duration-200"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-px w-6 bg-[#efefef] transition-transform duration-200"
              style={{ transform: menuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-[#1e1e1e] px-6 py-6">
          <ul className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={`/${link.href}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-sm tracking-[0.2em] text-[#efefef] hover:text-[#a8ff00] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-[#333333]" aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
            <span className="font-mono text-[8px] tracking-[0.2em] text-[#222222]">SYS.ONLINE // PORTFOLIO v2.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
