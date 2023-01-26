import createCache from "@emotion/cache";

function createEmotionCache() {
  return createCache({ key: "css", prepend: false });
}

export default createEmotionCache;
