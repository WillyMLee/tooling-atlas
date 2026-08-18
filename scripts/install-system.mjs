import {
  access,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(root, "skills");
const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
};
const has = (name) => process.argv.includes(`--${name}`);
const userHome = resolve(option("home") || homedir());
const codexHome = resolve(option("codex-home") || process.env.CODEX_HOME || join(userHome, ".codex"));
const skillRoot = resolve(option("skills-root") || join(userHome, ".agents", "skills"));
const telemetryPath = resolve(option("events") || join(codexHome, "telemetry", "tooling-atlas-events.ndjson"));
const checkOnly = has("check");
const dryRun = has("dry-run");
const jsonOutput = has("json");

const managedStart = "<!-- tooling-atlas:system-routing:start -->";
const managedEnd = "<!-- tooling-atlas:system-routing:end -->";
const managedBlock = `${managedStart}
## Tooling Atlas skill routing

- Treat user skills in \`~/.agents/skills\` as available across Codex tasks.
- Match the task against skill descriptions. Use the smallest useful set; do not load every Atlas skill on every prompt.
- When one specialist clearly matches, use it directly. When several skills could apply, activation is ambiguous, or a multi-stage workflow needs ordered specialists, use \`route-skills\` first.
- Keep \`eval-improvement-loop\` and \`implement-skills\` for explicit measurement or reusable-skill work, not routine execution overhead.
- A selected skill cannot expand authorization for writes, external communication, deployment, or delegation.
- For material Atlas routing decisions, record the privacy-minimal decision and outcome pair described by \`route-skills\`; never record prompts, messages, tool arguments, tool output, credentials, or file contents.
${managedEnd}`;

const hookEvents = [
  "SessionStart",
  "SessionEnd",
  "UserPromptSubmit",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PostToolUse",
  "PreCompact",
  "PostCompact",
];
const collectorPath = join(root, "scripts", "capture-hook.mjs");
const slash = (value) => value.replaceAll("\\", "/");
const hookCommand = `node \"${slash(collectorPath)}\" --out \"${slash(telemetryPath)}\"`;
const atlasHook = (event) => ({
  type: "command",
  command: hookCommand,
  commandWindows: hookCommand,
  ...(event === "SessionEnd" ? { timeout: 3 } : { async: true, timeout: 10 }),
});
const isAtlasHook = (hook) =>
  typeof hook?.command === "string" && hook.command.includes("capture-hook.mjs") && hook.command.includes("tooling-atlas-events.ndjson");

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readText = async (path, fallback = "") => {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};

const replaceManagedBlock = (content) => {
  const start = managedStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const end = managedEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const without = content.replace(new RegExp(`${start}[\\s\\S]*?${end}`, "g"), "").trimEnd();
  return `${without ? `${without}\n\n` : ""}${managedBlock}\n`;
};

const writeAtomic = async (path, content) => {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tooling-atlas-${process.pid}.tmp`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, path);
};

const skillNames = [
  "batch-tool-calls",
  "context-budget",
  "design-tool-surface",
  "eval-improvement-loop",
  "implement-skills",
  "orchestration-plan",
  "route-skills",
  "web-interaction-loop",
];

const inspectSkill = async (name) => {
  const source = join(sourceRoot, name);
  const target = join(skillRoot, name);
  if (!(await exists(join(source, "SKILL.md")))) return { name, status: "source-missing", source, target };
  try {
    await lstat(target);
    const [resolvedSource, resolvedTarget] = await Promise.all([realpath(source), realpath(target)]);
    return { name, status: resolvedSource === resolvedTarget ? "linked" : "conflict", source, target };
  } catch (error) {
    if (error.code === "ENOENT") return { name, status: "missing", source, target };
    throw error;
  }
};

const inspectGuidance = async () => {
  const basePath = join(codexHome, "AGENTS.md");
  const overridePath = join(codexHome, "AGENTS.override.md");
  const override = await readText(overridePath);
  const activePath = override.trim() ? overridePath : basePath;
  const [base, active] = await Promise.all([readText(basePath), readText(activePath)]);
  return {
    basePath,
    activePath,
    baseReady: base.includes(managedBlock),
    activeReady: active.includes(managedBlock),
    overrideActive: activePath === overridePath,
  };
};

const inspectHooks = async () => {
  const path = join(codexHome, "hooks.json");
  const raw = await readText(path);
  if (!raw.trim()) return { path, configured: [], missing: hookEvents, valid: true, value: { hooks: {} } };
  try {
    const value = JSON.parse(raw);
    const configured = hookEvents.filter((event) =>
      (value.hooks?.[event] ?? []).some((group) => (group.hooks ?? []).some(isAtlasHook)),
    );
    return { path, configured, missing: hookEvents.filter((event) => !configured.includes(event)), valid: true, value };
  } catch {
    return { path, configured: [], missing: hookEvents, valid: false, value: null };
  }
};

const inspect = async () => {
  const [skills, guidance, hooks] = await Promise.all([
    Promise.all(skillNames.map(inspectSkill)),
    inspectGuidance(),
    inspectHooks(),
  ]);
  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  return {
    schemaVersion: 1,
    mode: checkOnly ? "check" : dryRun ? "dry-run" : "install",
    roots: { atlas: root, codex: codexHome, skills: skillRoot },
    runtime: { node: process.versions.node, supported: nodeMajor >= 20 },
    skills,
    guidance,
    hooks: { path: hooks.path, configured: hooks.configured, missing: hooks.missing, valid: hooks.valid, trust: "review-in-codex" },
    telemetry: { path: telemetryPath },
    ready:
      nodeMajor >= 20 &&
      skills.every((skill) => skill.status === "linked") &&
      guidance.baseReady &&
      guidance.activeReady &&
      hooks.valid &&
      hooks.missing.length === 0,
    _hookValue: hooks.value,
  };
};

const install = async (before) => {
  await mkdir(skillRoot, { recursive: true });
  for (const skill of before.skills) {
    if (skill.status === "missing") await symlink(skill.source, skill.target, process.platform === "win32" ? "junction" : "dir");
  }

  const baseContent = await readText(before.guidance.basePath);
  const nextBase = replaceManagedBlock(baseContent);
  if (baseContent !== nextBase) await writeAtomic(before.guidance.basePath, nextBase);
  if (before.guidance.overrideActive) {
    const overrideContent = await readText(before.guidance.activePath);
    const nextOverride = replaceManagedBlock(overrideContent);
    if (overrideContent !== nextOverride) await writeAtomic(before.guidance.activePath, nextOverride);
  }

  if (!before.hooks.valid) throw new Error(`Cannot merge Atlas hooks because ${before.hooks.path} is not valid JSON.`);
  const hooksValue = before._hookValue ?? { hooks: {} };
  hooksValue.description ||= "User-level Codex lifecycle hooks.";
  hooksValue.hooks ||= {};
  for (const event of hookEvents) {
    const groups = (hooksValue.hooks[event] ?? [])
      .map((group) => ({ ...group, hooks: (group.hooks ?? []).filter((hook) => !isAtlasHook(hook)) }))
      .filter((group) => group.hooks.length > 0);
    groups.push({ hooks: [atlasHook(event)] });
    hooksValue.hooks[event] = groups;
  }
  const nextHooks = `${JSON.stringify(hooksValue, null, 2)}\n`;
  if ((await readText(before.hooks.path)) !== nextHooks) await writeAtomic(before.hooks.path, nextHooks);
  await mkdir(dirname(telemetryPath), { recursive: true });
};

const print = (state) => {
  const publicState = { ...state };
  delete publicState._hookValue;
  if (jsonOutput) {
    console.log(JSON.stringify(publicState, null, 2));
    return;
  }
  console.log(`Tooling Atlas system ${publicState.ready ? "ready" : "needs attention"}`);
  console.log(`Skills: ${publicState.skills.filter((item) => item.status === "linked").length}/${publicState.skills.length} linked`);
  for (const item of publicState.skills.filter((skill) => skill.status !== "linked")) console.log(`- ${item.name}: ${item.status}`);
  console.log(`Global routing: ${publicState.guidance.activeReady ? "active" : "missing"}${publicState.guidance.overrideActive ? " via AGENTS.override.md" : ""}`);
  console.log(`Lifecycle capture: ${publicState.hooks.missing.length ? `${publicState.hooks.missing.length} events missing` : "configured"} (trust: review with /hooks)`);
  console.log(`Telemetry: ${publicState.telemetry.path}`);
};

let state = await inspect();
if (!checkOnly && !dryRun) {
  const conflicts = state.skills.filter((skill) => skill.status === "conflict" || skill.status === "source-missing");
  if (conflicts.length) throw new Error(`Refusing to overwrite conflicting skills: ${conflicts.map((skill) => skill.name).join(", ")}`);
  await install(state);
  state = await inspect();
}
print(state);
if ((checkOnly || (!dryRun && !checkOnly)) && !state.ready) process.exitCode = 1;
