"use client";

import { useMemo } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { lightTheme, darkTheme } from "./theme";
import createEmotionCache from "./emotionCache";
import { ColorModeProvider } from "./ColorModeContext";

interface Props {
  children: React.ReactNode;
}

export default function ThemeRegistry({ children }: Props) {
  const cache = useMemo(() => {
    const emotionCache = createEmotionCache();
    emotionCache.compat = true;
    return emotionCache;
  }, []);

  return (
    <CacheProvider value={cache}>
      <ColorModeProvider>
        {(mode: string) => (
          <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
          </ThemeProvider>
        )}
      </ColorModeProvider>
    </CacheProvider>
  );
}
