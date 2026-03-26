"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import SocialIcon from "@/components/ui/SocialIcon";
import Crosshair from "@/components/ui/Crosshair";
import GlitchText from "@/components/ui/GlitchText";
import Typewriter from "@/components/ui/Typewriter";
import CityCanvas from "@/components/ui/CityCanvas";
import SerratedRingGauge from "@/components/ui/SerratedRingGauge";
import ChevronCluster from "@/components/ui/ChevronCluster";
import CircuitPath from "@/components/ui/CircuitPath";
import WarningBadge from "@/components/ui/WarningBadge";
import BarcodeIndicator from "@/components/ui/BarcodeIndicator";
import { personal, social } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { tr } = useLang();
  const sectionRef = useRef<HTMLElement>(null);

  // Chromatic aberration: grows as the user scrolls out of the hero
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const aberration = useTransform(scrollYProgress, [0, 0.5], [0, 10]);
  const textShadow = useMotionTemplate`${aberration}px 0 rgba(255,0,100,0.75), -${aberration}px 0 rgba(0,230,255,0.75)`;

  const fadeIn = (delay: number) => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.6,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  });

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-grid"
      aria-label="Hero — Ulises Miranda"
    >
      {/* 3D city wireframe background */}
      <CityCanvas />

      {/* Circuit path decoration — top-right */}
      <CircuitPath
        variant="hero"
        width={320}
        height={220}
        className="absolute top-16 right-24 opacity-60 hidden lg:block"
      />

      {/* HUD corner crosshairs */}
      <Crosshair className="absolute top-8 left-8 opacity-40" size={20} />
      <Crosshair className="absolute top-8 right-8 opacity-40" size={20} />
      <Crosshair className="absolute bottom-8 left-8 opacity-40" size={20} />
      <Crosshair className="absolute bottom-8 right-8 opacity-40" size={20} />

      {/* Vertical neon line */}
      <div
        aria-hidden="true"
        className="absolute left-[15%] top-0 bottom-0 w-px opacity-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #a8ff00 30%, #a8ff00 70%, transparent)",
        }}
      />

      {/* Floating ambient glow */}
      <motion.div
        aria-hidden="true"
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,255,0,0.04) 0%, transparent 70%)",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* HUD data labels — top right */}
      <div className="absolute top-24 right-8 hidden md:flex flex-col items-end gap-1 font-mono text-[10px] text-[#555555] tracking-[0.15em]">
        <span>LOC: {personal.locationCode}</span>
        <span>{tr.hero.hudStack}</span>
        <span>{tr.hero.hudRole}</span>
        <motion.span
          className="text-[#a8ff00]"
          animate={prefersReducedMotion ? {} : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {tr.hero.hudStatus}
        </motion.span>
      </div>

      {/* Serrated ring gauges — bottom right (desktop) */}
      <div
        className="absolute bottom-12 right-8 hidden md:flex items-end gap-4"
        aria-hidden="true"
      >
        <SerratedRingGauge value={75} size={88} centerText="2+" subText="YRS" label="EXPERIENCE" teeth={32} />
        <SerratedRingGauge value={85} size={88} centerText="4+" subText="PROJ" label="PROJECTS" teeth={32} />
      </div>

      {/* HUD data labels + barcode readout — bottom left */}
      <div className="absolute bottom-14 left-8 hidden md:flex flex-col gap-2 font-mono text-[10px] text-[#555555] tracking-[0.15em]">
        {/* Vertical barcode spectrum */}
        <BarcodeIndicator bars={24} maxHeight={32} />
        <span className="text-[#222222]">LAT: -34.6037</span>
        <span className="text-[#222222]">LNG: -58.3816</span>
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#a8ff00] hud-pulse" />
          <span className="text-[#333333]">CONNECTED</span>
        </div>
        <span className="text-[#222222]">0x00FF.INIT</span>
      </div>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-20" style={{ zIndex: 1 }}>
        {/* Section counter */}
        <motion.p
          {...fadeIn(0.1)}
          className="mb-6 font-mono text-xs tracking-[0.25em] text-[#555555] flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff00] hud-pulse" aria-hidden="true" />
          <span className="text-[#333333]">[</span>
          <span className="text-[#a8ff00]">01</span>
          <span className="text-[#333333]">]</span>
          <span className="text-[#222222]">——</span> INIT
        </motion.p>

        {/* Big display name — chromatic aberration applied here */}
        <motion.div style={prefersReducedMotion ? {} : { textShadow }}>
          <h1
            className="font-mono font-bold leading-none tracking-tight mb-2"
            aria-label={personal.nameDisplay}
          >
            <span
              className="block text-[#efefef]"
              style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)", lineHeight: 1 }}
            >
              <GlitchText text="ULISES" />
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
                lineHeight: 1,
                color: "#a8ff00",
                textShadow: "0 0 40px rgba(168,255,0,0.3)",
              }}
            >
              <GlitchText text="MIRANDA" />
            </span>
          </h1>
        </motion.div>

        {/* Role typewriter + warning badge */}
        <motion.div {...fadeIn(0.7)} className="mt-6 flex items-center gap-4 flex-wrap">
          <Typewriter
            phrases={[
              "FRONTEND_DEVELOPER",
              "REACT_ENGINEER",
              "UI_ARCHITECT",
              "AVAILABLE_FOR_HIRE",
            ]}
            className="font-mono text-sm md:text-base tracking-[0.2em] text-[#555555] uppercase"
          />
          <WarningBadge label="AVAILABLE" level="ok" pulse />
        </motion.div>

        {/* Divider */}
        <motion.hr {...fadeIn(0.85)} className="neon-rule my-8 max-w-xs" />

        {/* Bio short */}
        <motion.p
          {...fadeIn(1.0)}
          className="font-mono text-sm leading-relaxed text-[#aaaaaa] max-w-md"
        >
          {tr.hero.bio}
        </motion.p>

        {/* CTAs — chamfered corners */}
        <motion.div
          {...fadeIn(1.1)}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-3 border border-[#a8ff00] px-6 py-3 font-mono text-xs tracking-[0.2em] text-[#a8ff00] transition-all duration-200 hover:bg-[#a8ff00] hover:text-[#0a0a0a] cursor-pointer focus-visible:outline focus-visible:outline-[#a8ff00] chamfered-sm"
            aria-label="View my work"
          >
            {tr.hero.viewWork}
            <ChevronCluster count={3} size={8} />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-[#1e1e1e] px-6 py-3 font-mono text-xs tracking-[0.2em] text-[#555555] transition-all duration-200 hover:border-[#a8ff00] hover:text-[#efefef] cursor-pointer chamfered-sm chamfered-glow"
          >
            {tr.hero.contact}
          </a>
          <a
            href="/cv.pdf"
            download
            className="inline-flex items-center gap-2 border border-[#1e1e1e] px-6 py-3 font-mono text-xs tracking-[0.2em] text-[#555555] transition-all duration-200 hover:border-[#a8ff00] hover:text-[#a8ff00] cursor-pointer chamfered-sm chamfered-glow"
            aria-label="Download CV"
          >
            {tr.hero.cv} <span aria-hidden="true">↓</span>
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          {...fadeIn(1.2)}
          className="mt-12 flex items-center gap-6"
        >
          {social.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-[#555555] transition-colors duration-200 hover:text-[#a8ff00] cursor-pointer group"
              aria-label={`${s.label} profile`}
            >
              <SocialIcon
                name={s.icon as "github" | "linkedin" | "instagram"}
                size={14}
                className="transition-colors duration-200 group-hover:text-[#a8ff00]"
              />
              {s.label.toUpperCase()}
            </a>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeIn(1.4)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
        style={{ zIndex: 1 }}
      >
        <span className="font-mono text-[9px] tracking-[0.25em] text-[#555555]">
          SCROLL
        </span>
        <motion.div
          className="h-6 w-px bg-[#a8ff00] origin-top"
          animate={prefersReducedMotion ? {} : { scaleY: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
