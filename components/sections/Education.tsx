"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import { education } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Education() {
  const { tr } = useLang();

  if (education.length === 0) return null;

  return (
    <section
      id="education"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Education"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="04" label={tr.sections.education} className="mb-12" />
        </RevealText>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl">
          {education.map((entry, i) => (
            <RevealText key={i} delay={0.1 + i * 0.05}>
              <div
                className="group border border-[#1e1e1e] p-6 transition-all duration-200 hover:border-[#a8ff00]"
                style={{ transition: "border-color 0.25s" }}
              >
                {/* Type badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border"
                    style={{
                      borderColor:
                        entry.type === "formal"
                          ? "#a8ff00"
                          : entry.type === "course"
                          ? "#555555"
                          : "#333333",
                      color:
                        entry.type === "formal"
                          ? "#a8ff00"
                          : "#555555",
                    }}
                  >
                    {tr.education[entry.type].toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-[#555555]">
                    {entry.year}
                  </span>
                </div>

                {/* Degree */}
                <h3 className="font-mono font-bold text-sm text-[#efefef] tracking-tight mb-1 group-hover:text-[#a8ff00] transition-colors duration-200">
                  {entry.degree}
                </h3>

                {/* Institution */}
                <p className="font-mono text-[10px] tracking-[0.15em] text-[#555555] mb-4">
                  {entry.institution.toUpperCase()}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#1e1e1e] px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-[#555555]"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
