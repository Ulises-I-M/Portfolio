import SectionLabel from "@/components/ui/SectionLabel";
import HUDCorners from "@/components/ui/HUDCorners";
import RevealText from "@/components/ui/RevealText";
import { experience } from "@/lib/data";

export default function Experience() {
  return (
    <section
      id="experience"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Work experience"
    >
      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="03" label="Experience" className="mb-12" />
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
                  {exp.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#1e1e1e] px-3 py-1 font-mono text-[10px] tracking-[0.15em] text-[#555555]"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </HUDCorners>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
