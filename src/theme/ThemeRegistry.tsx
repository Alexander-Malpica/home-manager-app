"use client";

import * as React from "react";
import { useInsertionEffect, useMemo } from "react";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./emotionCache";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import createEmotionServer from "@emotion/server/create-instance";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cache, flush } = useMemo(() => {
    const cache = createEmotionCache();
    cache.compat = true;

    const { extractCriticalToChunks, constructStyleTagsFromChunks } =
      createEmotionServer(cache);

    let insertedStyles = "";

    const flush = () => {
      const chunks = extractCriticalToChunks(insertedStyles);
      insertedStyles = ""; // reset after flushing
      return constructStyleTagsFromChunks(chunks);
    };

    const originalInsert = cache.insert;
    cache.insert = (...args) => {
      const [, serialized] = args;
      if (!cache.inserted[serialized.name]) {
        insertedStyles += serialized.styles;
      }
      return originalInsert(...args);
    };

    return { cache, flush };
  }, []);

  useInsertionEffect(() => {
    const styles = flush();
    if (typeof document !== "undefined") {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }
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
