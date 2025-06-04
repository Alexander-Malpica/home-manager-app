"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Preferences {
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr" | "it" | "jp";
  setTheme: (theme: Preferences["theme"]) => void;
  setLanguage: (lang: Preferences["language"]) => void;
}

const PreferencesContext = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Preferences["theme"]>("system");
  const [language, setLanguage] = useState<Preferences["language"]>("en");

  return (
    <PreferencesContext.Provider
      value={{ theme, setTheme, language, setLanguage }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
}
