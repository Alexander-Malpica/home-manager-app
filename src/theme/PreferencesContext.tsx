"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";
type Language = "en" | "es" | "fr" | "it" | "jp";

interface PreferencesContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
);

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [language, setLanguage] = useState<Language>("en");

  return (
    <PreferencesContext.Provider
      value={{ theme, setTheme, language, setLanguage }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
