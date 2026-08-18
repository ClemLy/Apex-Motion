/**
 * Model optimization pipeline.
 *
 * Run manually with `npm run optimize:models` after dropping a new raw .glb
 * into `public/models/_source/`. Never runs in CI or at build time, since it
 * is a slow, one-off, content-dependent step — the output is committed.
 *
 * Deliberately does NOT flatten, join, instance, or palette the scene graph.
 * Those transforms are the standard "optimize" playbook, but they rename and
 * merge nodes, which would destroy the named groups
 * (wing, wheels, calipers, sideskirts...) the configurator targets at runtime.
 * The trade-off is more draw calls than a fully joined scene, accepted here
 * because per-part control matters more than shaving the last few hundred
 * draw calls on a scene the GPU already handles fine.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress, weld, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = "public/models/_source";
const OUTPUT_DIR = "public/models";

/** Uniform cap. 4096px source textures become 1024px, which is the real win. */
const MAX_TEXTURE_SIZE = 1024;

const jobs = [
  { input: "1975_porsche_911_930_turbo.glb", output: "porsche-930-turbo.glb" },
  { input: "porsche_gt3_rs.glb", output: "porsche-gt3-rs.glb" },
];

async function fileSize(file) {
  try {
    const { size } = await stat(file);
    return size;
  } catch {
    return 0;
  }
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

async function optimize({ input, output }) {
  const inputPath = path.join(SOURCE_DIR, input);
  const outputPath = path.join(OUTPUT_DIR, output);

  const before = await fileSize(inputPath);
  if (before === 0) {
    console.log(`skip: ${inputPath} introuvable`);
    return;
  }

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "draco3d.decoder": await draco3d.createDecoderModule(),
      "draco3d.encoder": await draco3d.createEncoderModule(),
    });

  const document = await io.read(inputPath);

  await document.transform(
    dedup(),
    prune({ keepAttributes: false, keepSolidTextures: false }),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE],
    }),
    weld(),
    draco({ method: "edgebreaker", quantizePosition: 14, quantizeNormal: 10 }),
  );

  await io.write(outputPath, document);

  const after = await fileSize(outputPath);
  const reduction = (100 * (1 - after / before)).toFixed(0);
  console.log(
    `${input} -> ${output}: ${formatMb(before)} -> ${formatMb(after)} (-${reduction}%)`,
  );
}

await mkdir(OUTPUT_DIR, { recursive: true });
for (const job of jobs) {
  await optimize(job);
}
