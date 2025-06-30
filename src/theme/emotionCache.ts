import createCache from "@emotion/cache";
import type { EmotionCache } from "@emotion/cache";

/**
 * Creates a new Emotion cache instance for MUI styling.
 * The `prepend: true` option ensures MUI styles are inserted first.
 */
export default function createEmotionCache(): EmotionCache {
  return createCache({ key: "mui", prepend: true });
}
