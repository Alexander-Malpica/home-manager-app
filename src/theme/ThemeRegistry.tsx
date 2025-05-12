"use client";

import { ReactNode } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import emotionCache from "./emotionCache";
import theme from "./theme";

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
