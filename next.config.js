/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: [
    "@mui/material",
    "@mui/system",
    "@mui/styled-engine",
    "@mui/icons-material",
    "@emotion/cache",
    "@emotion/react",
    "@emotion/server",
    "@emotion/styled",
    "react-material-ui-carousel",
  ],
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.mainFields = ["main", "module"];
    return config;
  },
};

module.exports = nextConfig;
