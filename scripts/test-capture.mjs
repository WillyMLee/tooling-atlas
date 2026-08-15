import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = resolve(tmpdir());
const directory = await mkdtemp(join(temporaryRoot, "tooling-atlas-capture-"));
const output = join(directory, "events.ndjson");
const sentinel = "PRIVATE_CONTENT_MUST_NOT_PERSIST";

try {
  const child = spawn(process.execPath, [
    join(root, "scripts", "capture-hook.mjs"),
    "--out", output,
    "--module", "batch-tool-calls",
    "--variant", "candidate",
  ], { cwd: root, stdio: ["pipe", "ignore", "inherit"] });
  child.stdin.end(JSON.stringify({
    session_id: "self-test-session",
    turn_id: "self-test-turn",
    hook_event_name: "PostToolUse",
    cwd: root,
    model: "self-test-model",
    tool_name: "self-test-tool",
    prompt: sentinel,
    tool_input: { secret: sentinel },
    tool_response: sentinel,
  }));
  const exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", resolveExit);
  });
  if (exitCode !== 0) throw new Error(`Collector exited with ${exitCode}`);
  const serialized = await readFile(output, "utf8");
  if (serialized.includes(sentinel)) throw new Error("Collector persisted private hook content");
  const event = JSON.parse(serialized.trim());
  if (event.event_name !== "tool.completed" || event.tool_name !== "self-test-tool") throw new Error("Collector did not normalize the tool event");
  if (event.module_slug !== "batch-tool-calls" || event.variant !== "candidate") throw new Error("Collector did not retain assigned eval attribution");
  if (event.input_tokens !== null || event.output_tokens !== null || event.estimated_cost_usd !== null) throw new Error("Unknown usage must remain null");
  console.log("Verified privacy-minimal hook capture and explicit eval attribution.");
} finally {
  const resolved = resolve(directory);
  if (!resolved.startsWith(`${temporaryRoot}${sep}`) || !basename(resolved).startsWith("tooling-atlas-capture-")) throw new Error("Refusing to clean an unexpected test directory");
  await rm(resolved, { recursive: true, force: true });
}
