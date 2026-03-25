"use client";

import { createContext, useContext, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type LangContextType = {
  lang: Lang;
  toggle: () => void;
  tr: typeof t["en"];
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  toggle: () => {},
  tr: t.en,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggle = () => setLang((l) => (l === "en" ? "es" : "en"));
  return (
    <LangContext.Provider value={{ lang, toggle, tr: t[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
