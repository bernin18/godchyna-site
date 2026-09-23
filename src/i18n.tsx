import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Language = "pt" | "en";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  pick: <T,>(pt: T, en: T) => T;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "godchyna-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === "en" ? "en" : "pt";
    } catch {
      return "pt";
    }
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Local storage may be blocked; the in-memory preference still works.
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      pick: (pt, en) => (lang === "pt" ? pt : en),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
