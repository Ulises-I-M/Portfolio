"use client";

import { useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import PanelFrame from "@/components/ui/PanelFrame";
import ChevronCluster from "@/components/ui/ChevronCluster";
import { experience } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Experience() {
  const [openAchievement, setOpenAchievement] = useState<string | null>(null);
  const { tr, lang } = useLang();

  return (
    <section
      id="experience"
      className="relative py-28 px-6"
      aria-label="Work experience"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText scan>
          <SectionLabel index="03" label={tr.sections.experience} className="mb-16" />
        </RevealText>

        {/* Timeline */}
        <div className="relative max-w-3xl">
          {/* Vertical neon line */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom, #a8ff00 0%, rgba(168,255,0,0.1) 100%)",
            }}
          />

          <div className="space-y-12 pl-16">
            {experience.map((exp, i) => {
              const nodeRef = useRef<HTMLDivElement>(null);
              const inView = useInView(nodeRef, { once: true });

              return (
                <RevealText key={i} delay={i * 0.12}>
                  <div ref={nodeRef} className="relative">
                    {/* Timeline dot */}
                    <motion.div
                      aria-hidden="true"
                      className="absolute -left-[3.1rem] top-1 w-3 h-3 rounded-full border-2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
                      style={{
                        borderColor: "#a8ff00",
                        background: "#0a0a0a",
                        boxShadow: inView ? "0 0 10px rgba(168,255,0,0.6)" : "none",
                      }}
                    />

                    {/* Card — wrapped in PanelFrame */}
                    <PanelFrame label={`EXP.${String(i + 1).padStart(2, "0")}`} status={exp.periodCode}>
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-mono font-bold text-[#efefef] text-lg tracking-tight mb-1">
                            {(lang === "es" && exp.roleEs ? exp.roleEs : exp.role).toUpperCase()}
                          </h3>
                          <p className="font-mono text-sm text-[#a8ff00] tracking-[0.15em] flex items-center gap-2">
                            @ {exp.company.toUpperCase()}
                            <ChevronCluster count={3} size={7} />
                          </p>
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.2em] text-[#555555] sm:text-right">
                          <div className="text-[#a8ff00] mb-1">{exp.periodCode}</div>
                          <div>{lang === "es" && exp.periodEs ? exp.periodEs : exp.period}</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <hr className="neon-rule mb-6" />

                      {/* Description */}
                      <p className="font-mono text-sm leading-loose text-[#aaaaaa] mb-6">
                        {lang === "es" && exp.descriptionEs ? exp.descriptionEs : exp.description}
                      </p>

                      {/* Tags — chamfered */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {exp.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-[#1e1e1e] px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-[#555555] chamfered-sm"
                          >
                            {tag.toUpperCase()}
                          </span>
                        ))}
                      </div>

                      {/* Achievements */}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div>
                          <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-4">
                            {tr.experience.achievements}
                          </p>
                          <div className="space-y-2">
                            {exp.achievements.map((ach) => (
                              <div key={ach.client}>
                                <button
                                  onClick={() =>
                                    setOpenAchievement(
                                      openAchievement === ach.client ? null : ach.client
                                    )
                                  }
                                  className="w-full flex items-center justify-between gap-3 border border-[#1e1e1e] px-4 py-3 font-mono text-xs tracking-[0.1em] text-[#efefef] transition-all duration-200 hover:border-[#a8ff00] hover:text-[#a8ff00] cursor-pointer text-left chamfered-sm chamfered-glow"
                                  style={{
                                    borderColor: openAchievement === ach.client ? "#a8ff00" : "#1e1e1e",
                                    color: openAchievement === ach.client ? "#a8ff00" : "#efefef",
                                  }}
                                  aria-expanded={openAchievement === ach.client}
                                >
                                  <span className="flex items-center gap-3">
                                    <span
                                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{
                                        background: openAchievement === ach.client ? "#a8ff00" : "#555555",
                                      }}
                                      aria-hidden="true"
                                    />
                                    {(lang === "es" && ach.labelEs
                                      ? ach.labelEs
                                      : ach.label
                                    ).toUpperCase()}
                                  </span>
                                  <span
                                    className="text-[#555555] text-xs flex-shrink-0 transition-transform duration-200"
                                    style={{
                                      transform: openAchievement === ach.client ? "rotate(45deg)" : "rotate(0deg)",
                                      color: openAchievement === ach.client ? "#a8ff00" : "#555555",
                                    }}
                                    aria-hidden="true"
                                  >
                                    +
                                  </span>
                                </button>

                                <AnimatePresence>
                                  {openAchievement === ach.client && (
                                    <motion.div
                                      key="content"
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: "easeInOut" }}
                                      className="overflow-hidden"
                                    >
                                      <div
                                        className="border border-t-0 px-4 py-4"
                                        style={{ borderColor: "rgba(168,255,0,0.2)" }}
                                      >
                                        <p className="font-mono text-xs leading-loose text-[#aaaaaa]">
                                          {lang === "es" && ach.descriptionEs ? ach.descriptionEs : ach.description}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </PanelFrame>
                  </div>
                </RevealText>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
