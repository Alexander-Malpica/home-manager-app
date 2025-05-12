import createCache from "@emotion/cache";

const emotionCache = createCache({
  key: "css",
  prepend: true, // Ensures MUI styles are loaded first
});

export default emotionCache;
