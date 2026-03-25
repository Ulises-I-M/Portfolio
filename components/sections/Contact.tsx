"use client";

import { useState } from "react";
import SocialIcon from "@/components/ui/SocialIcon";
import SectionLabel from "@/components/ui/SectionLabel";
import HUDCorners from "@/components/ui/HUDCorners";
import RevealText from "@/components/ui/RevealText";
import Crosshair from "@/components/ui/Crosshair";
import { personal, social } from "@/lib/data";
import { useLang } from "@/context/LangContext";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { tr } = useLang();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(personal.formspree, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full bg-transparent border border-[#1e1e1e] px-4 py-3 font-mono text-sm text-[#efefef] tracking-wide placeholder:text-[#333333] focus:border-[#a8ff00] focus:outline-none transition-colors duration-200";

  return (
    <section
      id="contact"
      className="relative py-28 px-6 border-t border-[#1e1e1e]"
      aria-label="Contact"
    >
      {/* Decorative crosshair */}
      <Crosshair className="absolute top-16 right-16 opacity-20 hidden md:block" size={24} />

      <div className="mx-auto max-w-7xl">
        <RevealText>
          <SectionLabel index="07" label={tr.sections.contact} className="mb-12" />
        </RevealText>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — info */}
          <RevealText direction="left" delay={0.1}>
            <h2
              className="font-mono font-bold text-[#efefef] mb-6 leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              <span className="text-[#a8ff00]">✦</span> {tr.contact.heading1}<br />
              {tr.contact.heading2}
            </h2>
            <p className="font-mono text-sm leading-loose text-[#555555] mb-10 max-w-md">
              {tr.contact.tagline}
            </p>

            {/* Contact info rows */}
            <div className="space-y-4 mb-10">
              {[
                { label: "EMAIL", value: personal.email, href: `mailto:${personal.email}` },
                { label: "PHONE", value: personal.phone, href: `tel:${personal.phone.replace(/\s/g, "")}` },
                { label: "LOCATION", value: personal.location, href: undefined },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[#555555] w-20">
                    {item.label}
                  </span>
                  <span className="h-px flex-1 max-w-[24px] bg-[#1e1e1e]" aria-hidden="true" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="font-mono text-sm text-[#efefef] hover:text-[#a8ff00] transition-colors cursor-pointer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-mono text-sm text-[#efefef]">{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-4">
                // SOCIAL
              </p>
              <div className="flex gap-6">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs tracking-[0.15em] text-[#555555] hover:text-[#a8ff00] transition-colors cursor-pointer group"
                    aria-label={`${s.label} — ${s.handle}`}
                  >
                    <SocialIcon
                      name={s.icon as "github" | "linkedin" | "instagram"}
                      size={14}
                      className="transition-colors duration-200 group-hover:text-[#a8ff00]"
                    />
                    {s.label.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </RevealText>

          {/* Right — form */}
          <RevealText delay={0.2}>
            <HUDCorners className="p-8" size={16}>
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
                  <span className="text-4xl text-[#a8ff00]" aria-hidden="true">✦</span>
                  <p className="font-mono text-sm text-[#efefef] tracking-[0.1em]">
                    {tr.contact.successTitle}
                  </p>
                  <p className="font-mono text-xs text-[#555555]">
                    {tr.contact.successSub}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#555555] mb-6">
                    // SEND MESSAGE
                  </p>

                  <div className="space-y-4 mb-4">
                    <div>
                      <label htmlFor="name" className="sr-only">{tr.contact.nameLabel}</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder={tr.contact.namePlaceholder}
                        className={inputClass}
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="sr-only">{tr.contact.emailLabel}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={tr.contact.emailPlaceholder}
                        className={inputClass}
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="sr-only">{tr.contact.subjectLabel}</label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder={tr.contact.subjectPlaceholder}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="sr-only">{tr.contact.messageLabel}</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder={tr.contact.messagePlaceholder}
                        className={`${inputClass} resize-none`}
                        aria-required="true"
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <p
                      role="alert"
                      className="font-mono text-xs text-red-400 mb-4 tracking-[0.1em]"
                    >
                      {tr.contact.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full border border-[#a8ff00] px-6 py-3 font-mono text-xs tracking-[0.2em] text-[#a8ff00] transition-all duration-200 hover:bg-[#a8ff00] hover:text-[#0a0a0a] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-busy={status === "loading"}
                  >
                    {status === "loading" ? tr.contact.sending : tr.contact.send}
                  </button>
                </form>
              )}
            </HUDCorners>
          </RevealText>
        </div>
      </div>
    </section>
  );
}
