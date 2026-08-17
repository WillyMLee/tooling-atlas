import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = resolve(tmpdir());
const directory = await mkdtemp(join(temporaryRoot, "tooling-atlas-route-"));
const output = join(directory, "events.ndjson");

try {
  const common = ["--out", output, "--route-id", "route-self-test", "--task-shape", "multi-part", "--routing-mode", "orchestrated", "--selected", "orchestration-plan,web-interaction-loop", "--skipped", "batch-tool-calls"];
  for (const args of [
    ["--stage", "decision", ...common],
    ["--stage", "outcome", ...common, "--outcome", "completed", "--quality-passed", "true"]
  ]) {
    const result = spawnSync(process.execPath, [join(root, "scripts", "record-route.mjs"), ...args], { cwd: root, encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  }
  const events = (await readFile(output, "utf8")).trim().split(/\r?\n/).map(JSON.parse);
  if (events.length !== 2 || events[0].event_name !== "routing.decided" || events[1].event_name !== "routing.completed") throw new Error("Expected one decision and one outcome event");
  if (events[1].quality_gate_passed !== true || events[1].skills_selected.length !== 2) throw new Error("Routing outcome metadata is incomplete");
  const serialized = JSON.stringify(events);
  for (const forbidden of ["prompt", "message", "tool_arguments", "tool_output"]) if (serialized.includes(forbidden)) throw new Error(`Private field persisted: ${forbidden}`);
  console.log("Verified privacy-minimal routing decision and outcome events.");
} finally {
  const resolved = resolve(directory);
  if (!resolved.startsWith(`${temporaryRoot}${sep}`) || !basename(resolved).startsWith("tooling-atlas-route-")) throw new Error("Refusing to clean an unexpected test directory");
  await rm(resolved, { recursive: true, force: true });
}
