import { useEffect, useState } from "react";
import { getStoredLanguage, words, type Lang } from "../translations";

export function useLang() {
  const [lang, setLang] = useState<Lang>(getStoredLanguage);
  const t = words[lang];
  const toggle = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("assetpro-language", next);
    setLang(next);
    window.dispatchEvent(new Event("asset-language-change"));
  };
  useEffect(() => {
    const syncLanguage = () => setLang(getStoredLanguage());
    window.addEventListener("asset-language-change", syncLanguage);
    return () =>
      window.removeEventListener("asset-language-change", syncLanguage);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return { lang, t, toggle };
}
