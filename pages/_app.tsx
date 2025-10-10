import { CacheProvider, EmotionCache } from "@emotion/react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { Decimal } from "decimal.js";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import PropTypes from "prop-types";
import * as React from "react";
import superjson from "superjson";

import Navbar from "../src/components/layout/Navbar";
import darkThemeOptions from "../src/styles/theme/darkThemeOptions";
import createEmotionCache from "../src/utils/createEmotionCache";
import "../src/styles/globals.css";

const clientSideEmotionCache = createEmotionCache();

const darkTheme = createTheme(darkThemeOptions);

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
          </Head>
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </CacheProvider>
    </SessionProvider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};

superjson.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal.js"
);
