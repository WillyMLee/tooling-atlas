import { appendFile, mkdir } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
};

const destination = option("out") || process.env.TOOLING_ATLAS_EVENTS_PATH;
const assignedModule = option("module") || process.env.TOOLING_ATLAS_MODULE || "";
const assignedVariant = option("variant") || process.env.TOOLING_ATLAS_VARIANT || "";
const assignedModuleVersion = option("module-version") || process.env.TOOLING_ATLAS_MODULE_VERSION || "";
const activationMode = option("activation-mode") || process.env.TOOLING_ATLAS_ACTIVATION_MODE || "";
const activationReason = option("activation-reason") || process.env.TOOLING_ATLAS_ACTIVATION_REASON || "";
const taskShape = option("task-shape") || process.env.TOOLING_ATLAS_TASK_SHAPE || "";
const orchestrationPhase = option("orchestration-phase") || process.env.TOOLING_ATLAS_ORCHESTRATION_PHASE || "";
const optionalCount = (name, environmentName) => {
  const raw = option(name) || process.env[environmentName] || "";
  if (raw === "") return null;
  const value = Number.parseInt(raw, 10);
  return Number.isInteger(value) && value >= 0 ? value : null;
};
const sourceCount = optionalCount("source-count", "TOOLING_ATLAS_SOURCE_COUNT");
const independentOperationCount = optionalCount("independent-operations", "TOOLING_ATLAS_INDEPENDENT_OPERATIONS");

if (!destination) process.exit(0);

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
};

const eventName = (hookName = "") => ({
  SessionStart: "session.started",
  SessionEnd: "session.completed",
  UserPromptSubmit: "turn.started",
  Stop: "turn.completed",
  SubagentStart: "workstream.started",
  SubagentStop: "workstream.completed",
  PreToolUse: "tool.started",
  PostToolUse: "tool.completed",
  PreCompact: "context.compaction_started",
  PostCompact: "context.compaction_completed",
}[hookName] || `hook.${String(hookName || "unknown").toLowerCase()}`);

try {
  const input = JSON.parse(await readStdin());
  const event = {
    schema_version: 1,
    event_time: new Date().toISOString(),
    event_name: eventName(input.hook_event_name),
    run_id: String(input.session_id || crypto.randomUUID()),
    turn_id: String(input.turn_id || ""),
    trace_id: "",
    span_id: String(input.tool_use_id || input.agent_id || ""),
    parent_span_id: "",
    project: input.cwd ? basename(input.cwd) : "",
    surface: "codex-hook",
    module_slug: String(assignedModule),
    module_version: String(assignedModuleVersion),
    activation_mode: String(activationMode),
    activation_reason: String(activationReason),
    task_shape: String(taskShape),
    source_count: sourceCount,
    independent_operation_count: independentOperationCount,
    orchestration_phase: String(orchestrationPhase),
    variant: String(assignedVariant),
    model: String(input.model || ""),
    reasoning_effort: "",
    tool_name: String(input.tool_name || ""),
    status: input.hook_event_name?.startsWith("Pre") || input.hook_event_name === "SessionStart" || input.hook_event_name === "UserPromptSubmit" || input.hook_event_name === "SubagentStart" ? "started" : "completed",
    duration_ms: null,
    input_tokens: null,
    output_tokens: null,
    cached_tokens: null,
    tool_calls: input.hook_event_name === "PostToolUse" ? 1 : 0,
    estimated_cost_usd: null,
    quality_score: null,
    success: null,
    error_code: "",
    attributes: {
      hook_event_name: String(input.hook_event_name || ""),
      permission_mode: String(input.permission_mode || ""),
      source: String(input.source || ""),
      reason: String(input.reason || ""),
      agent_type: String(input.agent_type || "")
    }
  };

  const resolvedDestination = resolve(destination);
  await mkdir(dirname(resolvedDestination), { recursive: true });
  await appendFile(resolvedDestination, `${JSON.stringify(event)}\n`, "utf8");
} catch {
  // Telemetry must never interrupt the agent workflow.
}
