/**
 * Production smoke test.
 *
 * Boots `next start`, drives every route with headless Chromium, and fails if a
 * page throws, logs a console error, renders blank, or renders without its
 * WebGL canvas. Run with `npm run test:smoke` (expects `npm run build` first).
 *
 * Deliberately does NOT gate on the preloader's exit animation finishing.
 * That animation's wall-clock duration depends on how much the main thread
 * is contended by concurrent WebGL/shader work, which varies a lot on a
 * shared, GPU-less CI runner (`ubuntu-latest` renders WebGL in software) —
 * it is real but slow, not broken, and asserting on it produced repeated
 * false-red CI runs. The canvas check below doesn't need the click either:
 * the canvas mounts under the preloader from first paint, so it is checked
 * directly rather than waited on behind a fragile, timing-dependent gate.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = process.env.SMOKE_PORT ?? "3111";
const BASE = `http://127.0.0.1:${PORT}`;
const BOOT_TIMEOUT_MS = 60_000;
const GATE_TIMEOUT_MS = 45_000;

const ROUTES = [
  { path: "/", needsCanvas: true },
  { path: "/configurator", needsCanvas: true },
  { path: "/heritage", needsCanvas: false },
  { path: "/garage", needsCanvas: false },
];

/** Ignore noise that does not indicate a broken page. */
const IGNORED = [/favicon/i, /Download the React DevTools/i];

const failures = [];

const server = spawn("npx", ["next", "start", "--port", PORT], {
  stdio: ["ignore", "pipe", "pipe"],
  env: process.env,
});

server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

async function waitForServer() {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      // Server not up yet.
    }
    await sleep(500);
  }
  throw new Error(`Server did not start within ${BOOT_TIMEOUT_MS}ms`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();

  for (const route of ROUTES) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (IGNORED.some((re) => re.test(text))) return;
      errors.push(text);
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    const response = await page.goto(`${BASE}${route.path}`, {
      waitUntil: "networkidle",
    });

    if (!response || response.status() >= 400) {
      failures.push(
        `${route.path}: HTTP ${response?.status() ?? "no response"}`,
      );
    }

    // The canvas mounts under the preloader from first paint, independent of
    // whether the curtain has been dismissed, so this needs no interaction.
    if (route.needsCanvas) {
      const canvasCount = await page.locator("canvas").count();
      if (canvasCount === 0) {
        failures.push(`${route.path}: expected a WebGL canvas, found none`);
      }
    }

    // Clicking through the preloader still exercises real code (audio
    // unlock, the GSAP entry timeline) and is worth doing, but only the gate
    // becoming clickable is asserted on — that proves hydration and the
    // preloader's own readiness logic work. How long the exit curtain then
    // takes to visually finish is not a correctness signal.
    try {
      const gate = page.getByRole("button", { name: /Démarrer|Ignition/ });
      await gate.waitFor({ state: "visible", timeout: GATE_TIMEOUT_MS });
      await gate.click();
    } catch {
      failures.push(`${route.path}: entry gate never became clickable`);
    }

    const bodyText = (await page.locator("body").innerText()).trim();
    if (bodyText.length < 40) {
      failures.push(
        `${route.path}: rendered almost no text, likely a blank page`,
      );
    }

    if (errors.length > 0) {
      failures.push(`${route.path}: console errors -> ${errors.join(" | ")}`);
    }

    console.log(
      `${failures.length === 0 ? "ok" : "checked"}  ${route.path}  (${canvasOrDash(route)})`,
    );
    await page.close();
  }
} catch (err) {
  failures.push(`fatal: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}

function canvasOrDash(route) {
  return route.needsCanvas ? "canvas requis" : "statique";
}

if (failures.length > 0) {
  console.error("\nSmoke test FAILED:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nSmoke test OK: toutes les routes repondent et rendent.");
process.exit(0);
