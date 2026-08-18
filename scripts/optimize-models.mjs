/**
 * Model optimization pipeline.
 *
 * Run manually with `npm run optimize:models` after dropping a new raw .glb
 * into `public/models/_source/`. Never runs in CI or at build time, since it
 * is a slow, one-off, content-dependent step — the output is committed.
 *
 * Two pipelines, selected per job by whether `targetLength` is set:
 *
 * - The original hand-authored exports (GT3RS, 930 Turbo) deliberately do NOT
 *   flatten, join, instance, or palette the scene graph. Those transforms are
 *   the standard "optimize" playbook, but they rename and merge nodes, which
 *   would destroy the named groups (wing, wheels, calipers...) the
 *   configurator targets at runtime. The trade-off is more draw calls than a
 *   fully joined scene, accepted here because per-part control matters more
 *   than shaving draw calls on a scene the GPU already handles fine.
 * - Newer downloads (`targetLength` set) are messier, generic-node-name
 *   exports at inconsistent authoring scale/offset, and none of them are
 *   targeted by node name at runtime — only by material name (see
 *   GltfCar.tsx). So for these, and only these, the pipeline also
 *   recenters/rescales to real-world meters and runs flatten()+join() to
 *   collapse very high node counts. Material identity (name + factors) is
 *   untouched by any of this — see normalizeScene() and the keepUniqueNames
 *   note below.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  createTransform,
  dedup,
  flatten,
  getBounds,
  join,
  prune,
  textureCompress,
  weld,
  draco,
} from "@gltf-transform/functions";
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
  // targetLength = real nose-to-tail length in meters. Its presence is what
  // switches a job onto the normalize + flatten + join branch below.
  {
    input: "2020_porsche_718_cayman_gt4.glb",
    output: "porsche-718-gt4.glb",
    targetLength: 4.46,
  },
  {
    input: "porsche_911_carrera_4s.glb",
    output: "porsche-911-carrera-4s.glb",
    targetLength: 4.53,
  },
  {
    input: "porsche_917k_lm_red.glb",
    output: "porsche-917k-lm.glb",
    targetLength: 4.12,
  },
  {
    input: "porsche_918_spyder_2015.glb",
    output: "porsche-918-spyder.glb",
    targetLength: 4.65,
  },
  {
    input: "porsche_mission_r.glb",
    output: "porsche-mission-r.glb",
    targetLength: 4.6,
  },
];

/**
 * Recenters a Scene at the origin (X/Z centered, resting on Y=0) and
 * uniformly rescales it so its longest horizontal extent equals
 * `targetLength` (meters). Uses max(sizeX, sizeZ) rather than a fixed "length
 * axis", since these source files don't share one authoring convention.
 *
 * A single wrapper node carries the corrective scale + translation, with the
 * Scene's existing root children reparented under it — Node.addChild() auto-
 * detaches its argument from any previous parent, so no manual removeChild()
 * bookkeeping is needed.
 *
 * Runs BEFORE flatten() deliberately: flatten()'s clearNodeParent() bakes
 * each node's full accumulated world matrix (including this wrapper's
 * correction) back into that node's own local transform and reparents it
 * straight to the Scene, so the now-childless wrapper is swept away by
 * flatten()'s own cleanup pass — no leftover correction node ships.
 */
function normalizeScene({ targetLength }) {
  return createTransform("normalize", (document) => {
    const logger = document.getLogger();
    for (const scene of document.getRoot().listScenes()) {
      const bbox = getBounds(scene);
      const centerX = (bbox.min[0] + bbox.max[0]) / 2;
      const centerZ = (bbox.min[2] + bbox.max[2]) / 2;
      const groundY = bbox.min[1];
      const currentLength = Math.max(
        bbox.max[0] - bbox.min[0],
        bbox.max[2] - bbox.min[2],
      );
      const scaleFactor = targetLength / currentLength;

      logger.debug(
        `normalize: "${scene.getName()}" x${scaleFactor.toFixed(4)}, pivot [${centerX.toFixed(3)}, ${groundY.toFixed(3)}, ${centerZ.toFixed(3)}]`,
      );

      const wrapper = document
        .createNode("ApexMotionNormalize")
        .setScale([scaleFactor, scaleFactor, scaleFactor])
        .setTranslation([
          -scaleFactor * centerX,
          -scaleFactor * groundY,
          -scaleFactor * centerZ,
        ]);
      for (const child of scene.listChildren()) wrapper.addChild(child);
      scene.addChild(wrapper);
    }
  });
}

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

async function optimize({ input, output, targetLength }) {
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

  const steps =
    targetLength === undefined
      ? [dedup(), prune({ keepAttributes: false, keepSolidTextures: false })]
      : [
          // keepUniqueNames guards every uniquely-named Material — the only
          // identity signal GltfCar.tsx's runtime matching relies on — from
          // being silently merged into a same-valued-but-differently-named
          // Material.
          dedup({ keepUniqueNames: true }),
          prune({ keepAttributes: false, keepSolidTextures: false }),
          normalizeScene({ targetLength }),
          flatten(),
          join({ keepNamed: false }),
        ];

  await document.transform(
    ...steps,
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
