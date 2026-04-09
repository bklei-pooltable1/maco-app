import { createContext, useContext, useState, useCallback } from "react";
import { translations } from "../i18n/translations";

const LangContext = createContext(null);

// Resolve a dot-notation key like "nav.events" from a nested object
function resolve(obj, key) {
  return key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

export function LangProvider({ children }) {
  // Detect browser language on first load
  const browserLang =
    typeof navigator !== "undefined" &&
    navigator.language?.toLowerCase().startsWith("mk")
      ? "mk"
      : "en";
  const [lang, setLang] = useState(browserLang);

  // t("key.subkey") → translated string, falls back to English, then the key itself
  const t = useCallback(
    (key) => {
      const result = resolve(translations[lang], key);
      if (result === null || typeof result === "object") {
        const en = resolve(translations.en, key);
        return typeof en === "string" ? en : key;
      }
      return result;
    },
    [lang]
  );

  // For display/heading fonts: Cinzel (EN) doesn't support Cyrillic, so
  // Macedonian headings fall back to the body font stack (Montserrat).
  // Components should use displayFont(lang) instead of the bare `display` constant.
  const cyrillicDisplay =
    "'Cormorant Garamond', 'PT Serif', Georgia, serif";

  return (
    <LangContext.Provider value={{ lang, setLang, t, cyrillicDisplay }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
