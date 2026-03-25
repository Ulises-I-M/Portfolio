"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import HUDCorners from "@/components/ui/HUDCorners";
import RevealText from "@/components/ui/RevealText";
import { experience } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Experience() {
  const [openAchievement, setOpenAchievement] = useState<string | null>(null);
  const { tr, lang } = useLang();

  return (
    <section
      id="experience"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Work experience"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="03" label={tr.sections.experience} className="mb-12" />
        </RevealText>

        <div className="max-w-3xl">
          {experience.map((exp, i) => (
            <RevealText key={i} delay={0.1}>
              <HUDCorners className="p-8" size={16}>
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-mono font-bold text-[#efefef] text-lg tracking-tight mb-1">
                      {exp.role.toUpperCase()}
                    </h3>
                    <p className="font-mono text-sm text-[#a8ff00] tracking-[0.15em]">
                      @ {exp.company.toUpperCase()}
                    </p>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.2em] text-[#555555] sm:text-right">
                    <div className="text-[#a8ff00] mb-1">{exp.periodCode}</div>
                    <div>{exp.period}</div>
                  </div>
                </div>

                {/* Divider */}
                <hr className="neon-rule mb-6" />

                {/* Description */}
                <p className="font-mono text-sm leading-loose text-[#555555] mb-6">
                  {lang === "es" && exp.descriptionEs ? exp.descriptionEs : exp.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#1e1e1e] px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-[#555555]"
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
                            className="w-full flex items-center justify-between gap-3 border border-[#1e1e1e] px-4 py-3 font-mono text-xs tracking-[0.1em] text-[#efefef] transition-all duration-200 hover:border-[#a8ff00] hover:text-[#a8ff00] cursor-pointer text-left"
                            style={{
                              borderColor:
                                openAchievement === ach.client ? "#a8ff00" : "#1e1e1e",
                              color:
                                openAchievement === ach.client ? "#a8ff00" : "#efefef",
                            }}
                            aria-expanded={openAchievement === ach.client}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{
                                  background:
                                    openAchievement === ach.client ? "#a8ff00" : "#555555",
                                }}
                                aria-hidden="true"
                              />
                              {ach.label.toUpperCase()}
                            </span>
                            <span
                              className="text-[#555555] text-xs flex-shrink-0 transition-transform duration-200"
                              style={{
                                transform:
                                  openAchievement === ach.client
                                    ? "rotate(45deg)"
                                    : "rotate(0deg)",
                                color:
                                  openAchievement === ach.client ? "#a8ff00" : "#555555",
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
                                <div className="border border-t-0 border-[#a8ff00] border-opacity-30 px-4 py-4"
                                  style={{ borderColor: "rgba(168,255,0,0.2)" }}>
                                  <p className="font-mono text-xs leading-loose text-[#555555]">
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
              </HUDCorners>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
