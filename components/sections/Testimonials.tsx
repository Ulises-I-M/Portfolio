"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import HUDCorners from "@/components/ui/HUDCorners";
import RevealText from "@/components/ui/RevealText";
import { testimonials } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Testimonials() {
  const { tr } = useLang();

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="06" label={tr.sections.testimonials} className="mb-12" />
        </RevealText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {testimonials.map((t, i) => (
            <RevealText key={i} delay={0.1 + i * 0.1}>
              <HUDCorners className="p-8" size={14}>
                {/* Quote mark */}
                <div
                  className="font-mono text-4xl text-[#a8ff00] leading-none mb-4 select-none"
                  aria-hidden="true"
                  style={{ opacity: 0.4 }}
                >
                  "
                </div>

                {/* Quote text */}
                <p className="font-mono text-sm leading-loose text-[#555555] mb-8 italic">
                  {t.text}
                </p>

                {/* Author */}
                <div className="border-t border-[#1e1e1e] pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-[#efefef] tracking-[0.1em] font-bold">
                        {t.name.toUpperCase()}
                      </p>
                      <p className="font-mono text-[10px] tracking-[0.15em] text-[#555555] mt-1">
                        {t.role.toUpperCase()}
                      </p>
                    </div>
                    <span
                      className="font-mono text-[9px] tracking-[0.2em] text-[#a8ff00] border border-[#a8ff00] px-2 py-0.5 flex-shrink-0"
                      style={{ opacity: 0.7 }}
                    >
                      @ {t.company.toUpperCase()}
                    </span>
                  </div>
                </div>
              </HUDCorners>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
