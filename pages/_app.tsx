import { CacheProvider, EmotionCache } from "@emotion/react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { Decimal } from "decimal.js";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import * as React from "react";
import superjson from "superjson";

import Navbar from "../src/components/layout/Navbar";
import darkThemeOptions from "../src/styles/theme/darkThemeOptions";
import createEmotionCache from "../src/utils/createEmotionCache";
import "../src/styles/globals.css";

const clientSideEmotionCache = createEmotionCache();

const darkTheme = createTheme(darkThemeOptions);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_DESCRIPTION =
  "Track every musical and play you see. Build your theatre logbook, follow friends, and plan shows together.";

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: MyAppProps) {
  return (
    <SessionProvider>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Head>
            <title>StageKeeper</title>
            <meta charSet="utf-8" />
            <meta content="initial-scale=1.0, width=device-width" name="viewport" />
            <meta content={SITE_DESCRIPTION} name="description" />

            <meta content="website" property="og:type" />
            <meta content="StageKeeper" property="og:site_name" />
            <meta content="StageKeeper" property="og:title" />
            <meta content={SITE_DESCRIPTION} property="og:description" />
            <meta content={SITE_URL} property="og:url" />
            <meta content={`${SITE_URL}/og.png`} property="og:image" />
            <meta content="image/png" property="og:image:type" />
            <meta content="1200" property="og:image:width" />
            <meta content="630" property="og:image:height" />
            <meta content="StageKeeper — a logbook for the stage" property="og:image:alt" />

            <meta content="summary_large_image" name="twitter:card" />
            <meta content="StageKeeper" name="twitter:title" />
            <meta content={SITE_DESCRIPTION} name="twitter:description" />
            <meta content={`${SITE_URL}/og.png`} name="twitter:image" />
            <meta content="StageKeeper — a logbook for the stage" name="twitter:image:alt" />
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}

superjson.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal.js"
);
