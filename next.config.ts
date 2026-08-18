import type { NextConfig } from "next";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Optimized .glb models and the local Draco decoder are versioned by
        // filename (see scripts/optimize-models.mjs) — a changed model gets a
        // new name, so the old one can be cached as if it never changes.
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${YEAR_IN_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/draco/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${YEAR_IN_SECONDS}, immutable`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
