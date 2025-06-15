"use client";

import * as React from "react";
import { useMemo } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import createEmotionCache from "./emotionCache";
import { ColorModeProvider } from "./ColorModeContext";
import { SnackbarProvider } from "notistack";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useMemo(() => {
    const createdCache = createEmotionCache();
    createdCache.compat = true;
    return createdCache;
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
