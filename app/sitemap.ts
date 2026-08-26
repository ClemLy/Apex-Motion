import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Real "last meaningfully changed" dates per route, taken from
 * `git log -1 --format=%cI -- <paths for that route>` at the time each was
 * last touched. Kept as constants rather than shelled out to git at build
 * time: Vercel's default shallow clone only has the tip commit, so a
 * path-scoped `git log` can silently come back empty in CI even though it
 * works locally. Bump the relevant date by hand when a route's content
 * meaningfully changes.
 */
const LAST_MODIFIED = {
  home: "2026-08-26T15:53:46+02:00",
  configurator: "2026-08-26T14:51:35+02:00",
  heritage: "2026-08-26T14:51:35+02:00",
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED.home,
      changeFrequency: "monthly",
      priority: 1,
      images: [
        `${SITE_URL}/screenshots/hero.jpg`,
        `${SITE_URL}/screenshots/lap-telemetry.jpg`,
        `${SITE_URL}/screenshots/aero-flow.jpg`,
        `${SITE_URL}/screenshots/particle-reveal.jpg`,
      ],
    },
    {
      url: `${SITE_URL}/configurator`,
      lastModified: LAST_MODIFIED.configurator,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${SITE_URL}/screenshots/studio.jpg`],
    },
    {
      url: `${SITE_URL}/heritage`,
      lastModified: LAST_MODIFIED.heritage,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [`${SITE_URL}/screenshots/heritage.jpg`],
    },
  ];
}
