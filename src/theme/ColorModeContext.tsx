"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";

type Mode = "light" | "dark";

interface ColorModeProviderProps {
  children: (mode: Mode) => ReactNode;
}

interface ColorModeContextValue {
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  toggleColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export const ColorModeProvider: FC<ColorModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    const stored = localStorage.getItem("colorMode");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  const contextValue = useMemo(() => {
    const toggleColorMode = () => {
      const nextMode: Mode = mode === "light" ? "dark" : "light";
      setMode(nextMode);
      localStorage.setItem("colorMode", nextMode);
    };

    return { toggleColorMode };
  }, [mode]);

  return (
    <ColorModeContext.Provider value={contextValue}>
      {children(mode)}
    </ColorModeContext.Provider>
  );
};
