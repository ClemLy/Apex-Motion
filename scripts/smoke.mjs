/**
 * Production smoke test.
 *
 * Boots `next start`, drives every route with headless Chromium, and fails if a
 * page throws, logs a console error, or renders without its WebGL canvas.
 * Run with `npm run test:smoke` (expects `npm run build` to have run first).
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = process.env.SMOKE_PORT ?? "3111";
const BASE = `http://127.0.0.1:${PORT}`;
const BOOT_TIMEOUT_MS = 60_000;

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

    // Every route mounts the preloader. Clicking through it is the only way to
    // reach the real page, and it also exercises the entry sequence itself.
    // Timeouts here are generous: a cold, software-rendered CI runner can be
    // far slower than a dev machine at font loading and shader compilation.
    let gateClicked = false;
    try {
      const gate = page.getByRole("button", { name: /Démarrer|Ignition/ });
      await gate.waitFor({ state: "visible", timeout: 30_000 });
      await gate.click();
      gateClicked = true;
    } catch {
      failures.push(`${route.path}: entry gate never became clickable`);
    }

    // Wait for the curtain to actually finish rather than a fixed sleep, so
    // this scales with how fast the runner really is instead of guessing.
    if (gateClicked) {
      const dismissed = await page
        .getByRole("dialog")
        .waitFor({ state: "detached", timeout: 20_000 })
        .then(() => true)
        .catch(() => false);
      if (!dismissed) {
        failures.push(`${route.path}: preloader never dismissed`);
      }
    } else {
      failures.push(`${route.path}: preloader never dismissed`);
    }

    if (route.needsCanvas) {
      const canvasCount = await page.locator("canvas").count();
      if (canvasCount === 0) {
        failures.push(`${route.path}: expected a WebGL canvas, found none`);
      }
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
