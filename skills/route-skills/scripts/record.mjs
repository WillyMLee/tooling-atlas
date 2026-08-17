import { appendFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";

const value = (name, fallback = "") => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const list = (name) => value(name).split(",").map((item) => item.trim()).filter(Boolean);
const stage = value("stage", "decision");
if (!["decision", "outcome"].includes(stage)) throw new Error("--stage must be decision or outcome");
const routeId = value("route-id");
if (!routeId) throw new Error("--route-id is required");
const requestedPath = value("out") || process.env.TOOLING_ATLAS_EVENTS_PATH || join(homedir(), ".codex", "telemetry", "tooling-atlas-events.ndjson");
const destination = isAbsolute(requestedPath) ? requestedPath : resolve(process.cwd(), requestedPath);
const event = {
  schema_version: 2,
  event_time: new Date().toISOString(),
  event_name: stage === "decision" ? "routing.decided" : "routing.completed",
  run_id: value("run-id", routeId),
  route_id: routeId,
  status: stage === "decision" ? "started" : value("status", "completed"),
  module_slug: "route-skills",
  module_version: value("module-version", "0.2.0"),
  activation_mode: value("activation-mode", "recommended"),
  activation_reason: value("activation-reason", "task-shape"),
  task_shape: value("task-shape", "unknown"),
  routing_mode: value("routing-mode", "direct"),
  skills_considered: list("considered"),
  skills_selected: list("selected"),
  skills_skipped: list("skipped"),
  outcome: stage === "outcome" ? value("outcome", "unknown") : "",
  quality_gate_passed: stage === "outcome" ? value("quality-passed") === "true" : null,
  duration_ms: null,
  input_tokens: null,
  output_tokens: null,
  cached_tokens: null,
  tool_calls: 0,
  retry_count: Number.parseInt(value("retry-count", "0"), 10) || 0,
  estimated_cost_usd: null,
  success: stage === "outcome" ? value("status", "completed") === "completed" : null,
  error_code: "",
  attributes: {}
};
await mkdir(dirname(destination), { recursive: true });
await appendFile(destination, `${JSON.stringify(event)}\n`, "utf8");
console.log(`Recorded ${event.event_name} for ${routeId}`);
