"use client";

import * as React from "react";
import { useMemo } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import createEmotionCache from "./emotionCache";

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
