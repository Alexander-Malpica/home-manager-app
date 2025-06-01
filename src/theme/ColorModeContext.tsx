"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ColorModeProviderProps {
  children: (mode: string) => ReactNode;
}

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("colorMode");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  const toggleColorMode = () => {
    const nextMode = mode === "light" ? "dark" : "light";
    setMode(nextMode);
    localStorage.setItem("colorMode", nextMode);
  };

  const value = useMemo(() => ({ toggleColorMode }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      {children(mode)}
    </ColorModeContext.Provider>
  );
}
