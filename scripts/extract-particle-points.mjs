/**
 * Particle point-cloud extraction for the GT3RS dissolve/reform section.
 *
 * Run manually with `npm run extract:particles`. Reads the already-optimized,
 * committed GT3RS glb (see optimize-models.mjs), walks every primitive's real
 * geometry, and bakes a downsampled world-space point cloud to a binary file
 * the runtime fetches directly - no glTF parsing or scene graph in the
 * browser for this section, just a flat Float32Array.
 *
 * The scattered ("dispersed") position each particle starts from is also
 * baked in here rather than computed client-side: that per-particle
 * normalize()/trig loop was the actual cause of the section feeling slow to
 * appear, not the file fetch. Baking it means the runtime does a plain
 * buffer read with zero vector math.
 *
 * Never runs in CI or at build time: it's a slow, one-off, content-dependent
 * step and the output is committed, same convention as optimize-models.mjs.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const MODELS_DIR = "public/models";
const OUTPUT_DIR = "public/particles";
const MANIFEST_PATH = "lib/three/particlePoints.ts";

/** Above this many points, take an evenly-strided subset. Keeps the draw
 * call cheap while staying dense enough to read as a car once assembled. */
const TARGET_COUNT = 40000;

/** Mirrors GT3RS_CONFIG's material matching in lib/three/carConfigs.ts - kept
 * as plain substrings here since this script runs outside the TS/Next build
 * and can't import that module directly. */
const PAINT_MATCH = "carPaint";
const WHEEL_MATCH = "wheels_chrome_1";
const CALIPER_MATCH = "amdb11_caliper";

/** Same apple-green as lib/configurator/types.ts's new "apple-green" paint
 * option (and the car shown in scripts/capture-particle-hero.mjs's capture),
 * so the resting/assembled cloud reads as the same car the section reveals
 * at the end rather than an unrelated palette. Calipers stay a contrasting
 * red rather than matching the body - a common real factory pairing on
 * green PTS cars, and a useful accent in the cloud either way. */
const COLOR_PAINT = [0.545, 0.773, 0.247];
const COLOR_CALIPER = [0.659, 0.071, 0.102];
const COLOR_WHEEL = [0.16, 0.16, 0.18];
const COLOR_NEUTRAL = [0.72, 0.72, 0.76];

/** Deterministic PRNG (not Math.random()) so a re-run without any source
 * changes reproduces byte-identical output - easier to review in a diff. */
function mulberry32(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function categoryColor(materialName) {
  const name = materialName ?? "";
  if (name.includes(PAINT_MATCH)) return COLOR_PAINT;
  if (name.includes(CALIPER_MATCH)) return COLOR_CALIPER;
  if (name.includes(WHEEL_MATCH)) return COLOR_WHEEL;
  return COLOR_NEUTRAL;
}

async function findGt3rsModel() {
  const entries = await readdir(MODELS_DIR);
  const match = entries.find((entry) =>
    /^porsche-gt3-rs\.[0-9a-f]{8}\.glb$/.test(entry),
  );
  if (!match) {
    throw new Error(
      `No porsche-gt3-rs.<hash>.glb found in ${MODELS_DIR} - run npm run optimize:models first.`,
    );
  }
  return path.join(MODELS_DIR, match);
}

async function extractPoints(modelPath) {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
    });
  const document = await io.read(modelPath);

  // Same world-space vertex transform as splitRimFromTyre() in
  // optimize-models.mjs: each node's flat 16-element world matrix applied by
  // hand to every POSITION element of its primitives.
  const points = [];
  const el = [0, 0, 0];
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      const color = categoryColor(prim.getMaterial()?.getName());
      for (let i = 0; i < pos.getCount(); i += 1) {
        pos.getElement(i, el);
        points.push({
          x: m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12],
          y: m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13],
          z: m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14],
          color,
        });
      }
    }
  }
  return points;
}

/** Even stride keeps the subset representative of the full mesh's density
 * and per-material proportions without weighting one panel over another. */
function downsample(points, targetCount) {
  if (points.length <= targetCount) return points;
  const stride = Math.floor(points.length / targetCount);
  const kept = [];
  for (let i = 0; i < points.length; i += stride) kept.push(points[i]);
  return kept;
}

/** Radial scatter from the car's own center - direction preserved from each
 * point's real position, distance and jitter randomized - same shape the
 * client-side version used to compute per-frame; the only thing that moved
 * is *when* it runs. */
function buildBuffer(points) {
  const bounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity],
  };
  for (const p of points) {
    bounds.min[0] = Math.min(bounds.min[0], p.x);
    bounds.min[1] = Math.min(bounds.min[1], p.y);
    bounds.min[2] = Math.min(bounds.min[2], p.z);
    bounds.max[0] = Math.max(bounds.max[0], p.x);
    bounds.max[1] = Math.max(bounds.max[1], p.y);
    bounds.max[2] = Math.max(bounds.max[2], p.z);
  }
  const center = [
    (bounds.min[0] + bounds.max[0]) / 2,
    (bounds.min[1] + bounds.max[1]) / 2,
    (bounds.min[2] + bounds.max[2]) / 2,
  ];

  const random = mulberry32(1337);
  const floatsPerPoint = 10; // assembled xyz, dispersed xyz, color rgb, seed
  const buffer = new Float32Array(points.length * floatsPerPoint);

  points.forEach((p, i) => {
    let dx = p.x - center[0];
    let dy = p.y - center[1];
    let dz = p.z - center[2];
    let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-3) {
      dx = random() - 0.5;
      dy = random() - 0.5;
      dz = random() - 0.5;
      len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    }
    dx /= len;
    dy /= len;
    dz /= len;

    const distance = 2.5 + random() * 6;
    const dispersedX = center[0] + dx * distance + (random() - 0.5) * 0.6;
    const dispersedY = center[1] + dy * distance + (random() - 0.5) * 0.6 + 0.5;
    const dispersedZ = center[2] + dz * distance + (random() - 0.5) * 0.6;

    const o = i * floatsPerPoint;
    buffer[o] = p.x;
    buffer[o + 1] = p.y;
    buffer[o + 2] = p.z;
    buffer[o + 3] = dispersedX;
    buffer[o + 4] = dispersedY;
    buffer[o + 5] = dispersedZ;
    buffer[o + 6] = p.color[0];
    buffer[o + 7] = p.color[1];
    buffer[o + 8] = p.color[2];
    buffer[o + 9] = random();
  });

  return { buffer, bounds };
}

async function writeOutput(buffer, bounds, count) {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const bytes = Buffer.from(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
  const fileName = `gt3rs-points.${hash}.bin`;

  // Sweep away earlier builds, hashed or not - same convention as
  // optimize-models.mjs, so stale point clouds don't pile up in public/.
  for (const entry of await readdir(OUTPUT_DIR)) {
    if (entry === fileName) continue;
    if (/^gt3rs-points(\.[0-9a-f]{8})?\.bin$/.test(entry)) {
      await unlink(path.join(OUTPUT_DIR, entry));
    }
  }

  await writeFile(path.join(OUTPUT_DIR, fileName), bytes);

  const fmt = (n) => n.toFixed(3);
  await writeFile(
    MANIFEST_PATH,
    `// Generated by scripts/extract-particle-points.mjs - do not edit by hand.
//
// The binary file is a flat Float32Array, 10 floats per particle interleaved
// as [x, y, z, dx, dy, dz, r, g, b, seed] - assembled position (world-space
// meters), dispersed/scattered position, linear 0-1 color, and a 0-1 wobble
// seed. Both positions are baked at build time so the runtime never runs a
// per-particle scatter computation. Named after a hash of its own bytes so a
// rebuilt cloud is never served stale from a returning visitor's cache (see
// next.config.ts).
export const PARTICLE_POINTS = {
  url: "/particles/${fileName}",
  count: ${count},
  bounds: {
    min: [${bounds.min.map(fmt).join(", ")}],
    max: [${bounds.max.map(fmt).join(", ")}],
  },
} as const;
`,
  );

  return fileName;
}

const modelPath = await findGt3rsModel();
console.log(`Reading ${modelPath}`);

const allPoints = await extractPoints(modelPath);
console.log(`Extracted ${allPoints.length} vertices`);

const points = downsample(allPoints, TARGET_COUNT);
console.log(`Downsampled to ${points.length} particles`);

const { buffer, bounds } = buildBuffer(points);
const fileName = await writeOutput(buffer, bounds, points.length);

console.log(
  `Wrote ${OUTPUT_DIR}/${fileName} (${(buffer.byteLength / 1024).toFixed(0)} KB)`,
);
console.log(`Manifest written: ${MANIFEST_PATH}`);
