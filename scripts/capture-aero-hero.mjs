/**
 * A single real 2D render of the GT3RS in Guards Red for the aero section
 * (components/sections/AeroFlow.tsx) — same capture route and technique as
 * scripts/capture-fleet-images.mjs, just one car/paint combination instead
 * of looping the whole fleet, so this section's colour doesn't get swapped
 * out the next time the fleet is regenerated.
 *
 * Also extracts the car's real top/bottom silhouette from the PNG's alpha
 * channel — so AeroFlow's flow lines can trace the actual roofline/hood/
 * wing contour instead of running straight across the image. Baked here
 * (not computed client-side) so the shipped page does zero pixel scanning.
 *
 * Requires `npm run dev` running in another terminal first. Run with
 * `npm run capture:aero`. Output (public/silhouettes/*.png, lib/three/
 * aeroHeroImage.ts, lib/three/aeroContour.ts) is committed, like the fleet
 * capture's.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const CAR_ID = "gt3rs";
const PAINT_ID = "guards-red";
const OUTPUT_DIR = "public/silhouettes";
const IMAGE_MANIFEST_PATH = "lib/three/aeroHeroImage.ts";
const CONTOUR_MANIFEST_PATH = "lib/three/aeroContour.ts";
const READY_TIMEOUT_MS = 60000;
const ALPHA_THRESHOLD = 10;
/** Minimum opaque-run height, in px, for a column to count as real bodywork
 * rather than a shadow/AO sliver — see extractRawContour(). */
const MIN_CAR_HEIGHT_PX = 20;

/** Each layer smooths the raw silhouette with a wider moving-average window
 * before tracing it, then lifts the result by `offset` px — closer layers
 * keep more surface detail (hood, roofline, wing), farther ones flatten out,
 * same as how only the streak nearest a real car's body visibly dips over
 * the roof in wind-tunnel smoke photography while the outer ones stay calm.
 * `corner` rounds the elbows the convex hull leaves at each contact point —
 * see roundCorners() — so the exported curve is fluid, not a drafted
 * polyline with kinks at every hull vertex. */
const TOP_LAYERS = [
  { window: 15, offset: 14, corner: 31 },
  { window: 35, offset: 34, corner: 51 },
  { window: 71, offset: 58, corner: 81 },
  { window: 131, offset: 88, corner: 121 },
];
const BOTTOM_LAYERS = [
  { window: 15, offset: 10, corner: 31 },
  { window: 51, offset: 24, corner: 61 },
];
/** Every Nth pixel of the rounded curve is kept for the exported path — fine
 * enough that straight segments between points read as a smooth curve. */
const DOWNSAMPLE_STEP = 6;

/** A little turbulence right behind the car, where real flow has already
 * separated off the wing and stops behaving like a clean streamline. */
const WAKE_AMPLITUDE_PX = 7;
const WAKE_FREQUENCY = 0.25;

/** Extracts, per column, the topmost and bottommost opaque pixel row from a
 * raw RGBA buffer — the car's silhouette, straight from the same transparent
 * PNG the page renders. Columns with no opaque pixel (before the nose / after
 * the tail) inherit the nearest car column's height, so the raw contour
 * stays flat approaching the car and levels back out after it, instead of
 * jumping at the car's edges. */
function extractRawContour(data, width, height, channels) {
  const top = new Array(width).fill(null);
  const bottom = new Array(width).fill(null);

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > ALPHA_THRESHOLD) {
        top[x] = y;
        break;
      }
    }
    for (let y = height - 1; y >= 0; y -= 1) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > ALPHA_THRESHOLD) {
        bottom[x] = y;
        break;
      }
    }
  }

  // A thin contact-shadow/ambient-occlusion sliver under the car can render
  // a couple of fully opaque pixels a few px tall, a little ahead of where
  // the real nose starts — if left in, that sliver's height (not the nose's)
  // becomes the flat pre-nose extension, producing a stray diagonal jump
  // instead of a sensible flat approach. Require real bodywork thickness to
  // count toward the car's horizontal extent.
  const carXs = [];
  for (let x = 0; x < width; x += 1) {
    if (top[x] !== null && bottom[x] - top[x] >= MIN_CAR_HEIGHT_PX) {
      carXs.push(x);
    }
  }
  if (carXs.length === 0) throw new Error("no opaque pixels found in capture");
  const carXMin = carXs[0];
  const carXMax = carXs[carXs.length - 1];

  for (let x = 0; x < carXMin; x += 1) {
    top[x] = top[carXMin];
    bottom[x] = bottom[carXMin];
  }
  for (let x = carXMax + 1; x < width; x += 1) {
    top[x] = top[carXMax];
    bottom[x] = bottom[carXMax];
  }

  return { top, bottom, carXMax };
}

function movingAverage(arr, window) {
  const half = (window - 1) / 2;
  return arr.map((_, x) => {
    let sum = 0;
    let count = 0;
    for (let k = -half; k <= half; k += 1) {
      const xi = x + k;
      if (xi < 0 || xi >= arr.length) continue;
      sum += arr[xi];
      count += 1;
    }
    return sum / count;
  });
}

/** A real streamline can't dip into a concave recess in the bodywork (the
 * trunk between the roof and the wing, say) — it stays attached over convex
 * bumps and bridges straight across anything concave, which is exactly a
 * convex hull. `keepMax` picks which side of the point set the hull hugs:
 * false keeps the smallest y (topmost points, for a roofline that should be
 * hugged from above), true keeps the largest y (lowest points, for an
 * underbody line that should hug the ground and bridge over recesses). */
function hullLine(points, keepMax) {
  const sign = keepMax ? 1 : -1;
  const pts = points.map(([x, y]) => [x, sign * y]);
  const hull = [];
  for (const p of pts) {
    while (hull.length >= 2) {
      const o = hull[hull.length - 2];
      const a = hull[hull.length - 1];
      const cross =
        (a[0] - o[0]) * (p[1] - o[1]) - (a[1] - o[1]) * (p[0] - o[0]);
      if (cross >= 0) hull.pop();
      else break;
    }
    hull.push(p);
  }
  return hull.map(([x, sy]) => [x, sign * sy]);
}

function addWakeRipple(arr, carXMax) {
  const width = arr.length;
  const out = arr.slice();
  for (let x = carXMax; x < width; x += 1) {
    const envelope = (x - carXMax) / Math.max(1, width - 1 - carXMax);
    out[x] =
      arr[x] -
      WAKE_AMPLITUDE_PX * envelope * Math.sin((x - carXMax) * WAKE_FREQUENCY);
  }
  return out;
}

/** Re-expands a hull's sparse (x, y) vertices back to one value per pixel
 * column, linearly interpolating between consecutive vertices — the same
 * shape the hull describes (attached over bumps, bridging dips), just at
 * full resolution so it can be smoothed into a curve next. */
function densify(hull, width) {
  const dense = new Array(width).fill(hull[0][1]);
  for (let i = 0; i < hull.length - 1; i += 1) {
    const [x0, y0] = hull[i];
    const [x1, y1] = hull[i + 1];
    for (let x = x0; x <= x1 && x < width; x += 1) {
      const t = (x - x0) / (x1 - x0 || 1);
      dense[x] = y0 + t * (y1 - y0);
    }
  }
  return dense;
}

/** A convex hull is geometrically correct (it hugs bodywork, bridges
 * concavities) but is made of dead-straight segments meeting at sharp
 * elbows — a drafted polyline, not moving air. Smoothing the densified
 * curve rounds those elbows into gentle arcs without pulling the line back
 * down into the concavity the hull deliberately skipped (a symmetric
 * moving average of an already-monotonic-between-bends curve stays above
 * the recess it bridged; it only softens the corner). */
function roundCorners(dense, window) {
  return movingAverage(dense, window);
}

function downsample(arr, step) {
  const points = [];
  for (let x = 0; x < arr.length; x += step) {
    points.push([x, Math.round(arr[x] * 10) / 10]);
  }
  const last = arr.length - 1;
  points.push([last, Math.round(arr[last] * 10) / 10]);
  return points;
}

function buildLayers(rawArr, layers, keepMax, width) {
  return layers.map(({ window, offset, corner }) => {
    const smoothed = movingAverage(rawArr, window);
    const hull = hullLine(
      smoothed.map((y, x) => [x, y]),
      keepMax,
    );
    const shifted = hull.map(([x, y]) => [
      x,
      keepMax ? y + offset : y - offset,
    ]);
    const dense = densify(shifted, width);
    const rounded = roundCorners(dense, corner);
    return downsample(rounded, DOWNSAMPLE_STEP);
  });
}

function extractContour(data, width, height, channels) {
  const { top, bottom, carXMax } = extractRawContour(
    data,
    width,
    height,
    channels,
  );
  const topWithWake = addWakeRipple(top, carXMax);

  return {
    top: buildLayers(topWithWake, TOP_LAYERS, false, width),
    bottom: buildLayers(bottom, BOTTOM_LAYERS, true, width),
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 420 },
  });

  const url = `http://localhost:3000/silhouette-capture?car=${CAR_ID}&paint=${PAINT_ID}`;
  process.stdout.write(`${CAR_ID} (${PAINT_ID})... `);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => document.body.dataset.captureReady === "true",
    { timeout: READY_TIMEOUT_MS },
  );

  const dataUrl = await page.evaluate(() => {
    const canvas = document.querySelector("[data-capture-canvas] canvas");
    return canvas?.toDataURL("image/png") ?? null;
  });
  await browser.close();

  if (!dataUrl) throw new Error("no canvas found — is `npm run dev` running?");

  const buffer = Buffer.from(
    dataUrl.replace(/^data:image\/png;base64,/, ""),
    "base64",
  );
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 8);
  const filename = `gt3rs-${PAINT_ID}.${hash}.png`;
  await writeFile(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`${filename} (${(buffer.length / 1024).toFixed(0)}kb)`);

  // Remove a stale image from a previous run of this specific script only —
  // never touches the fleet's own gt3rs.<hash>.png from capture-fleet-images.mjs.
  const prefix = `gt3rs-${PAINT_ID}.`;
  for (const existing of await readdir(OUTPUT_DIR)) {
    if (existing.startsWith(prefix) && existing !== filename) {
      await unlink(path.join(OUTPUT_DIR, existing));
    }
  }

  await writeFile(
    IMAGE_MANIFEST_PATH,
    `// Generated by scripts/capture-aero-hero.mjs — do not edit by hand.
export const AERO_HERO_IMAGE = "/silhouettes/${filename}";
`,
  );
  console.log(`Wrote ${IMAGE_MANIFEST_PATH}`);

  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const contour = extractContour(data, info.width, info.height, info.channels);

  await writeFile(
    CONTOUR_MANIFEST_PATH,
    `// Generated by scripts/capture-aero-hero.mjs — do not edit by hand.
// Streamline layers traced over/under the captured car's real silhouette, in
// source-pixel coordinates (${info.width}x${info.height}) — innermost (closest
// to the body) first, outermost last. See hullLine() in the generating
// script: each layer is a convex hull of a smoothed copy of the silhouette,
// so it hugs convex bodywork (hood, roof, wing) and bridges straight across
// concave recesses (the trunk) the way separated airflow actually does.
export const AERO_CONTOUR_WIDTH = ${info.width};
export const AERO_CONTOUR_HEIGHT = ${info.height};
export const AERO_TOP_LAYERS: [number, number][][] = ${JSON.stringify(contour.top)};
export const AERO_BOTTOM_LAYERS: [number, number][][] = ${JSON.stringify(contour.bottom)};
`,
  );
  console.log(`Wrote ${CONTOUR_MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
