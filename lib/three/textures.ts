import * as THREE from "three";

/**
 * Procedural texture atlas.
 *
 * Everything here is painted into an offscreen canvas at load time rather than
 * downloaded, which keeps the bundle free of image payloads and lets the maps
 * scale to any tiling without compression artefacts.
 */

let carbonNormal: THREE.CanvasTexture | null = null;
let clearcoatNormal: THREE.CanvasTexture | null = null;

function createCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Woven carbon-fibre normal map: a 2x2 twill of directional tows, encoded as a
 * tangent-space normal so the weave catches highlights from the studio lights.
 */
export function getCarbonNormalMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (carbonNormal) return carbonNormal;

  const size = 256;
  const tow = size / 8;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Flat normal (pointing straight out) is mid-grey with a full blue channel.
  ctx.fillStyle = "rgb(128,128,255)";
  ctx.fillRect(0, 0, size, size);

  const drawTow = (x: number, y: number, horizontal: boolean) => {
    const gradient = horizontal
      ? ctx.createLinearGradient(0, y, 0, y + tow)
      : ctx.createLinearGradient(x, 0, x + tow, 0);

    // Rounded tow cross-section: normal tilts one way then the other.
    if (horizontal) {
      gradient.addColorStop(0, "rgb(128,196,220)");
      gradient.addColorStop(0.5, "rgb(128,128,255)");
      gradient.addColorStop(1, "rgb(128,60,220)");
    } else {
      gradient.addColorStop(0, "rgb(196,128,220)");
      gradient.addColorStop(0.5, "rgb(128,128,255)");
      gradient.addColorStop(1, "rgb(60,128,220)");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, horizontal ? tow * 2 : tow, horizontal ? tow : tow * 2);
  };

  // 2x2 twill: alternating pairs of warp and weft tows.
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const horizontal = (Math.floor(row / 2) + Math.floor(col / 2)) % 2 === 0;
      drawTow(col * tow, row * tow, horizontal);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.anisotropy = 4;
  carbonNormal = texture;
  return texture;
}

/**
 * Very low-amplitude noise normal map. Applied to paint it breaks the perfectly
 * mirror-flat clearcoat into something that reads as a real sprayed surface.
 */
export function getClearcoatNormalMap(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (clearcoatNormal) return clearcoatNormal;

  const size = 128;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    // Tiny perturbation around the flat normal keeps orange-peel subtle.
    const jitter = (Math.random() - 0.5) * 14;
    image.data[i] = 128 + jitter;
    image.data[i + 1] = 128 + jitter;
    image.data[i + 2] = 255;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(14, 14);
  clearcoatNormal = texture;
  return texture;
}

/** Frees the cached textures. Called when the last canvas unmounts. */
export function disposeTextures() {
  carbonNormal?.dispose();
  clearcoatNormal?.dispose();
  carbonNormal = null;
  clearcoatNormal = null;
}
