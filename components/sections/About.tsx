"use client";

import Image from "next/image";
import SectionLabel from "@/components/ui/SectionLabel";
import HUDCorners from "@/components/ui/HUDCorners";
import RevealText from "@/components/ui/RevealText";
import GrainEffect from "@/components/ui/GrainEffect";
import CircuitPath from "@/components/ui/CircuitPath";
import NestedSquares from "@/components/ui/NestedSquares";
import GateReveal from "@/components/ui/GateReveal";
import { personal, skills } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function About() {
  const { tr } = useLang();

  return (
    <section
      id="about"
      className="relative py-28 px-6 overflow-hidden"
      aria-label="About Ulises Miranda"
    >
      {/* Circuit path decoration — bottom right */}
      <CircuitPath
        variant="about"
        width={320}
        height={180}
        className="absolute bottom-12 right-8 opacity-50 hidden lg:block"
      />
      {/* Nested squares — top left corner accent */}
      <NestedSquares
        size={72}
        layers={3}
        rotate
        className="absolute top-10 left-6 opacity-30 hidden lg:block"
      />
      <div className="mx-auto max-w-7xl">
        <RevealText scan>
          <SectionLabel index="02" label={tr.sections.about} className="mb-12" />
        </RevealText>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image column */}
          <RevealText direction="left" delay={0.1}>
            <HUDCorners className="inline-block" size={18} ticks label="PROFILE.IMG">
              <div style={{ padding: "10px" }}>
                <GateReveal>
                  <div className="relative overflow-hidden">
                    <Image
                      src="/images/about_hero.png"
                      alt="Ulises Miranda"
                      width={480}
                      height={560}
                      priority
                      loading="eager"
                      className="block w-full object-cover"
                      style={{ filter: "grayscale(0.3) contrast(1.05)" }}
                    />
                    {/* Neon overlay tint */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(168,255,0,0.06) 0%, transparent 60%)",
                      }}
                    />
                    {/* Diagonal hatch texture */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none hatch"
                      style={{ opacity: 0.5 }}
                    />
                    <GrainEffect />
                  </div>
                </GateReveal>
              </div>
            </HUDCorners>

            {/* HUD data below image */}
            <div className="mt-4 flex gap-8 font-mono text-[10px] tracking-[0.15em]">
              <div>
                <span className="text-[#555555] block">LOC</span>
                <span className="text-[#a8ff00]">{personal.locationCode}</span>
              </div>
              <div>
                <span className="text-[#555555] block">EXP</span>
                <span className="text-[#a8ff00]">2+ YRS</span>
              </div>
              <div>
                <span className="text-[#555555] block">FOCUS</span>
                <span className="text-[#a8ff00]">FE / UX</span>
              </div>
            </div>
          </RevealText>

          {/* Text column */}
          <div>
            <RevealText delay={0.2}>
              <h2
                className="font-mono font-bold text-[#efefef] mb-6 leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
              >
                <span className="text-[#a8ff00]">✦</span> {tr.about.heading1}<br />
                {tr.about.heading2}
              </h2>
            </RevealText>

            <RevealText delay={0.3}>
              <p className="font-mono text-sm leading-loose text-[#aaaaaa] mb-6 max-w-lg">
                {tr.about.bio1}
              </p>
            </RevealText>

            <RevealText delay={0.4}>
              <p className="font-mono text-sm leading-loose text-[#aaaaaa] mb-6 max-w-lg">
                {tr.about.bio2}
              </p>
            </RevealText>

            <RevealText delay={0.45}>
              <div className="border-l-2 border-[#a8ff00] pl-4 mb-10 max-w-lg">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#a8ff00] mb-1">
                  {tr.about.uxLabel}
                </p>
                <p className="font-mono text-sm leading-loose text-[#aaaaaa]">
                  {tr.about.uxNote}
                </p>
              </div>
            </RevealText>

            {/* Skills grid */}
            <RevealText delay={0.5}>
              <div className="mb-4">
                <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-4 uppercase">
                  {tr.about.techStack}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="group flex flex-col items-center gap-2 border border-[#1e1e1e] p-3 transition-all duration-200 hover:border-[#a8ff00] cursor-default"
                    >
                      {skill.icon ? (
                        <img
                          src={`https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${skill.icon}.svg`}
                          alt=""
                          aria-hidden="true"
                          width={20}
                          height={20}
                          className="opacity-40 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            filter:
                              "invert(1) sepia(1) saturate(0) brightness(2)",
                          }}
                        />
                      ) : (
                        <span
                          className="text-[10px] text-[#a8ff00] font-mono font-bold opacity-40 group-hover:opacity-100"
                          aria-hidden="true"
                        >
                          TB
                        </span>
                      )}
                      <span className="font-mono text-[9px] tracking-[0.1em] text-[#555555] group-hover:text-[#efefef] transition-colors text-center">
                        {skill.name.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>
        </div>
      </div>
    </section>
  );
}
