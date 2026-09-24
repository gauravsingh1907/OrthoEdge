"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translate } from "@/lib/translate";

const SUPPORTED_LANGUAGES = ["en", "hi", "as", "bn", "brx", "mni", "lus"];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("orthoedge-language");

    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
      return;
    }

    setLanguage(newLanguage);
    localStorage.setItem("orthoedge-language", newLanguage);
  };

  const t = (key) => {
    return translate(language, key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}