import type { MetricDefinition } from "./types";
import { readdir, access } from "node:fs/promises";
import { constants as FS_CONSTANTS } from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

let registry: Map<string, MetricDefinition> | null = null;

/**
 * Why this exists:
 * - Some runtimes won't provide Vite-transformed `import.meta.glob` at execution time
 * - Direct ESM dynamic import of `.ts` from disk fails with: ERR_UNKNOWN_FILE_EXTENSION
 *
 * Fix:
 * - Prefer `import.meta.glob` if available
 * - Otherwise, use `jiti` to load TS modules from disk (compiles TS on the fly)
 * - Resolve the real metrics directory from process.cwd()
 */

async function firstExistingDir(candidates: string[]) {
  for (const dir of candidates) {
    try {
      await access(dir, FS_CONSTANTS.F_OK);
      return dir;
    } catch {
      // continue
    }
  }
  return null;
}

function isMetricFile(file: string) {
  if (file.startsWith("_")) return false;
  if (file.endsWith(".d.ts")) return false;
  return (
    file.endsWith(".ts") ||
    file.endsWith(".js") ||
    file.endsWith(".mjs") ||
    file.endsWith(".cjs")
  );
}

export async function getMetricRegistry(): Promise<Map<string, MetricDefinition>> {
  if (registry) return registry;

  registry = new Map<string, MetricDefinition>();

  // 1) Best case: Vite glob (only when provided by the runtime)
  const anyImportMeta = import.meta as any;
  if (anyImportMeta && typeof anyImportMeta.glob === "function") {
    const modules = anyImportMeta.glob("../metrics/*.{ts,js}", { eager: true }) as Record<
      string,
      { default?: MetricDefinition }
    >;

    for (const mod of Object.values(modules)) {
      const def = mod?.default;
      if (!def?.id) continue;
      registry.set(def.id, def);
    }
    return registry;
  }

  // 2) Fallback: scan from disk using process.cwd()
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "server", "metrics"),          // source (dev)
    path.join(cwd, ".nuxt", "server", "metrics"), // possible emitted
    path.join(cwd, ".output", "server", "metrics")// nitro output
  ];

  const metricsDir = await firstExistingDir(candidates);
  if (!metricsDir) {
    throw new Error(
      `Metrics directory not found. Tried:\n- ${candidates.join("\n- ")}\n\n` +
      `Expected: <projectRoot>/server/metrics/*.ts`
    );
  }

  const files = (await readdir(metricsDir)).filter(isMetricFile);

  // jiti can load TS/JS from disk without Node ESM choking on ".ts"
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    esmResolve: true
  });

  for (const file of files) {
    const fullPath = path.join(metricsDir, file);

    // jiti returns module exports; default export is the MetricDefinition
    const mod = jiti(fullPath) as any;
    const def = (mod?.default ?? mod) as MetricDefinition | null;

    if (!def?.id) continue;
    registry.set(def.id, def);
  }

  return registry;
}

export async function getMetric(id: string): Promise<MetricDefinition | null> {
  const reg = await getMetricRegistry();
  return reg.get(id) ?? null;
}