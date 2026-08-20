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
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const SOURCE_DIR = "public/models/_source";
const OUTPUT_DIR = "public/models";
const MANIFEST_PATH = "lib/three/modelManifest.ts";

/** Uniform cap. 4096px source textures become 1024px, which is the real win. */
const MAX_TEXTURE_SIZE = 1024;

/**
 * Some downloads model the whole wheel — tyre included — under a single
 * material, so recolouring the rim would tint the rubber along with it. This
 * moves the rim geometry onto its own material and leaves the tread behind.
 *
 * Wheels are found by clustering the material's primitives (left/right by X,
 * front/rear by the widest gap along Z), then measuring how close each
 * primitive gets to its own wheel's axis. A primitive sitting entirely in the
 * outer annulus is tread; anything reaching inward belongs to the rim.
 */
function splitRimFromTyre({ material, rimName, treadRatio = 0.75 }) {
  return createTransform("split-rim", (document) => {
    const entries = [];
    for (const node of document.getRoot().listNodes()) {
      const mesh = node.getMesh();
      if (!mesh) continue;
      const m = node.getWorldMatrix();
      for (const prim of mesh.listPrimitives()) {
        const name = prim.getMaterial()?.getName();
        if (!name || !name.includes(material)) continue;
        const pos = prim.getAttribute("POSITION");
        if (!pos) continue;
        const pts = [];
        const el = [0, 0, 0];
        for (let i = 0; i < pos.getCount(); i += 1) {
          pos.getElement(i, el);
          pts.push([
            m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12],
            m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13],
            m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14],
          ]);
        }
        entries.push({
          prim,
          pts,
          cx: pts.reduce((s, p) => s + p[0], 0) / pts.length,
          cz: pts.reduce((s, p) => s + p[2], 0) / pts.length,
        });
      }
    }
    if (entries.length === 0) {
      console.log(`   split-rim: aucun primitif ne porte "${material}"`);
      return;
    }

    const sorted = entries.map((e) => e.cz).sort((a, b) => a - b);
    let zSplit = sorted[0];
    let widest = -1;
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i] - sorted[i - 1] > widest) {
        widest = sorted[i] - sorted[i - 1];
        zSplit = (sorted[i] + sorted[i - 1]) / 2;
      }
    }

    const wheels = new Map();
    for (const e of entries) {
      const key = `${e.cx >= 0 ? "R" : "L"}${e.cz >= zSplit ? "F" : "B"}`;
      if (!wheels.has(key)) wheels.set(key, []);
      wheels.get(key).push(e);
    }

    const rim = entries[0].prim.getMaterial().clone().setName(rimName);
    let rimPrims = 0;
    let treadPrims = 0;

    for (const list of wheels.values()) {
      let ymin = Infinity;
      let ymax = -Infinity;
      let zmin = Infinity;
      let zmax = -Infinity;
      for (const e of list) {
        for (const p of e.pts) {
          ymin = Math.min(ymin, p[1]);
          ymax = Math.max(ymax, p[1]);
          zmin = Math.min(zmin, p[2]);
          zmax = Math.max(zmax, p[2]);
        }
      }
      const yc = (ymin + ymax) / 2;
      const zc = (zmin + zmax) / 2;
      let outer = 0;
      for (const e of list) {
        for (const p of e.pts) {
          outer = Math.max(outer, Math.hypot(p[1] - yc, p[2] - zc));
        }
      }
      for (const e of list) {
        let inner = Infinity;
        for (const p of e.pts) {
          inner = Math.min(inner, Math.hypot(p[1] - yc, p[2] - zc));
        }
        if (inner < treadRatio * outer) {
          e.prim.setMaterial(rim);
          rimPrims += 1;
        } else {
          treadPrims += 1;
        }
      }
    }
    console.log(
      `   split-rim -> "${rimName}": ${rimPrims} jante / ${treadPrims} pneu sur ${wheels.size} roues`,
    );
  });
}

/**
 * Where a model already isolates the rims as their own nodes but shares one
 * material with the rest of the brightwork, moving those nodes onto a
 * dedicated material is enough — no geometry analysis needed.
 */
function isolateNodesAsMaterial({ nodes, name }) {
  return createTransform("isolate-material", (document) => {
    const wanted = new Set(nodes);
    const prims = [];
    for (const node of document.getRoot().listNodes()) {
      if (!wanted.has(node.getName())) continue;
      const mesh = node.getMesh();
      if (!mesh) continue;
      prims.push(...mesh.listPrimitives());
    }
    if (prims.length === 0) {
      console.log(`   isolate-material: aucun noeud trouve pour "${name}"`);
      return;
    }
    const isolated = prims[0].getMaterial().clone().setName(name);
    for (const prim of prims) prim.setMaterial(isolated);
    console.log(`   isolate-material -> "${name}": ${prims.length} primitifs`);
  });
}

const jobs = [
  { input: "1975_porsche_911_930_turbo.glb", output: "porsche-930-turbo.glb" },
  { input: "porsche_gt3_rs.glb", output: "porsche-gt3-rs.glb" },
  // targetLength = real nose-to-tail length in meters. Its presence is what
  // switches a job onto the normalize + flatten + join branch below.
  {
    input: "2020_porsche_718_cayman_gt4.glb",
    output: "porsche-718-gt4.glb",
    targetLength: 4.46,
    splits: [splitRimFromTyre({ material: "Wheel1A", rimName: "GT4_RimFace" })],
  },
  {
    input: "porsche_911_carrera_4s.glb",
    output: "porsche-911-carrera-4s.glb",
    targetLength: 4.53,
    splits: [
      isolateNodesAsMaterial({
        nodes: ["Cylinder.000_0", "Cylinder.001_0"],
        name: "Carrera4S_RimFace",
      }),
    ],
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

async function optimize({ input, output, targetLength, splits }) {
  const inputPath = path.join(SOURCE_DIR, input);

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
          ...(splits ?? []),
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

  const glb = await io.writeBinary(document);

  // The filename carries a hash of the bytes it holds, so a rebuilt model
  // always lands on a fresh URL. That is what actually makes the year-long
  // immutable cache in next.config.ts safe: without it, editing a model while
  // keeping its name pins every returning visitor to the stale copy.
  const base = output.replace(/\.glb$/, "");
  const hash = createHash("sha256").update(glb).digest("hex").slice(0, 8);
  const fileName = `${base}.${hash}.glb`;

  // Sweep away earlier builds of this same model, hashed or not, so old
  // revisions do not pile up in the served directory.
  for (const entry of await readdir(OUTPUT_DIR)) {
    if (entry === fileName) continue;
    const isLegacy = entry === `${base}.glb`;
    const isHashed =
      entry.startsWith(`${base}.`) &&
      entry.endsWith(".glb") &&
      /^[0-9a-f]{8}$/.test(entry.slice(base.length + 1, -4));
    if (isLegacy || isHashed) await unlink(path.join(OUTPUT_DIR, entry));
  }

  await writeFile(path.join(OUTPUT_DIR, fileName), glb);

  const reduction = (100 * (1 - glb.byteLength / before)).toFixed(0);
  console.log(
    `${input} -> ${fileName}: ${formatMb(before)} -> ${formatMb(glb.byteLength)} (-${reduction}%)`,
  );
  return { base, url: `/models/${fileName}` };
}

/** Regenerates the module carConfigs.ts reads its model URLs from. */
async function writeManifest(built) {
  const rows = [...built]
    .sort((a, b) => a.base.localeCompare(b.base))
    .map((entry) => `  "${entry.base}": "${entry.url}",`)
    .join("\n");

  await writeFile(
    MANIFEST_PATH,
    `// Generated by scripts/optimize-models.mjs - do not edit by hand.
//
// Every optimized model is named after a hash of its own contents, so a
// rebuilt car is served from a new URL and no visitor is left holding a stale
// copy of one (see next.config.ts, which caches /models/* for a year).
export const MODEL_URLS = {
${rows}
} as const;
`,
  );
}

await mkdir(OUTPUT_DIR, { recursive: true });

const built = [];
let skipped = 0;
for (const job of jobs) {
  const result = await optimize(job);
  if (result) built.push(result);
  else skipped += 1;
}

// public/models/_source/ is gitignored, so a fresh clone has no sources.
// Rewriting the manifest then would drop entries and break the build, so the
// committed one is left alone unless every model was rebuilt.
if (skipped > 0) {
  console.log(`\nmanifeste inchange : ${skipped} source(s) absente(s).`);
} else {
  await writeManifest(built);
  console.log(`\nmanifeste ecrit : ${MANIFEST_PATH}`);
}
