import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const router = join(root, "skills", "route-skills", "scripts", "route.mjs");
const run = (...args) => {
  const result = spawnSync(process.execPath, [router, ...args], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `Router exited with ${result.status}`);
  return JSON.parse(result.stdout);
};
const modules = (items) => items.map((item) => item.module);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const direct = run("--scope", "small", "--work-shape", "coupled");
assert(direct.mode === "direct" && direct.useNow.length === 0, "Small coupled task must stay direct");
assert(modules(direct.skip).includes("orchestration-plan"), "Direct route must explain skipped orchestration");

const belowBatchThreshold = run("--scope", "small", "--work-shape", "independent", "--operation-count", "7");
assert(!modules(belowBatchThreshold.useNow).includes("batch-tool-calls"), "Seven operations must stay below the provisional batch threshold");
const atBatchThreshold = run("--scope", "small", "--work-shape", "independent", "--operation-count", "8");
assert(modules(atBatchThreshold.useNow).includes("batch-tool-calls"), "Eight operations must activate batching");

const layered = run("--scope", "multi", "--work-shape", "browser", "--source-count", "7", "--improvement", "skill", "--shared-writes", "true");
for (const module of ["orchestration-plan", "context-budget", "web-interaction-loop"]) assert(modules(layered.useNow).includes(module), `Layered route missing ${module}`);
for (const module of ["eval-improvement-loop", "implement-skills"]) assert(modules(layered.afterCompletion).includes(module), `Layered route missing deferred ${module}`);
assert(layered.constraints.length === 1, "Shared writes must create a single-owner constraint");

const explicit = run("--scope", "small", "--work-shape", "coupled", "--explicit-skills", "context-budget");
assert(modules(explicit.useNow).includes("context-budget"), "Explicit skill invocation must be honored");

console.log("Verified direct, threshold, layered, shared-write, and explicit-skill routing cases.");

