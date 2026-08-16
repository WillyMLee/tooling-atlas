import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const policy = JSON.parse(await readFile(join(root, "references", "routing-policy.json"), "utf8"));
const value = (name, fallback = "") => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const integer = (name) => {
  const parsed = Number.parseInt(value(name), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
};

const input = {
  scope: value("scope", "small"),
  workShape: value("work-shape", "coupled"),
  sourceCount: integer("source-count"),
  operationCount: integer("operation-count"),
  improvement: value("improvement", "none"),
  toolAmbiguity: value("tool-ambiguity", "false") === "true",
  sharedWrites: value("shared-writes", "false") === "true",
  explicitSkills: value("explicit-skills").split(",").map((item) => item.trim()).filter(Boolean)
};

const allowed = {
  scope: ["small", "broad", "multi"],
  workShape: ["coupled", "independent", "browser"],
  improvement: ["none", "eval", "skill"]
};
for (const [field, choices] of Object.entries(allowed)) {
  if (!choices.includes(input[field])) throw new Error(`Invalid --${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${input[field]}`);
}

const useNow = [];
const afterCompletion = [];
const skip = [];
const add = (target, module, reason) => { if (!target.some((item) => item.module === module)) target.push({ module, reason }); };
for (const module of input.explicitSkills) add(useNow, module, "Explicitly requested by the user.");
if (input.scope === "multi") add(useNow, "orchestration-plan", policy.rules.find((rule) => rule.module === "orchestration-plan").reason);
if (input.scope === "broad" || input.sourceCount >= policy.thresholds.broadSourceCount) add(useNow, "context-budget", policy.rules.find((rule) => rule.module === "context-budget").reason);
if (input.workShape === "independent" && input.operationCount >= policy.thresholds.independentOperationCount) add(useNow, "batch-tool-calls", policy.rules.find((rule) => rule.module === "batch-tool-calls").reason);
if (input.workShape === "browser") add(useNow, "web-interaction-loop", policy.rules.find((rule) => rule.module === "web-interaction-loop").reason);
if (input.toolAmbiguity) add(afterCompletion, "design-tool-surface", policy.rules.find((rule) => rule.module === "design-tool-surface").reason);
if (["eval", "skill"].includes(input.improvement)) add(afterCompletion, "eval-improvement-loop", policy.rules.find((rule) => rule.module === "eval-improvement-loop").reason);
if (input.improvement === "skill") add(afterCompletion, "implement-skills", policy.rules.find((rule) => rule.module === "implement-skills").reason);

const selected = new Set([...useNow, ...afterCompletion].map((item) => item.module));
if (!selected.has("orchestration-plan")) add(skip, "orchestration-plan", "No multi-part dependency graph requires coordination.");
if (!selected.has("context-budget")) add(skip, "context-budget", `Source scope is below the provisional ${policy.thresholds.broadSourceCount}-source threshold.`);
if (input.workShape === "independent" && !selected.has("batch-tool-calls")) add(skip, "batch-tool-calls", `Independent work is below the provisional ${policy.thresholds.independentOperationCount}-operation threshold.`);
if (!selected.has("web-interaction-loop") && input.workShape !== "browser") add(skip, "web-interaction-loop", "No visible browser state needs verification.");
if (!selected.has("eval-improvement-loop") && input.improvement === "none") add(skip, "eval-improvement-loop", "No reusable comparison is requested.");
if (!selected.has("implement-skills") && input.improvement !== "skill") add(skip, "implement-skills", "No reusable skill outcome is requested.");

const taskShape = input.scope === "multi" ? "multi-part"
  : input.workShape === "browser" ? "visible-browser"
    : input.scope === "broad" ? "broad-many-source"
      : input.workShape === "independent" ? "large-independent"
        : "small-coupled";

const packet = {
  policyVersion: policy.policyVersion,
  mode: useNow.some((item) => item.module === "orchestration-plan") ? "orchestrated" : useNow.length ? "specialist" : "direct",
  useNow,
  afterCompletion,
  skip,
  constraints: input.sharedWrites ? ["Keep shared mutable targets with one owner."] : [],
  activation: {
    taskShape,
    activationMode: "recommended",
    activationReason: "task-shape",
    sourceCount: input.sourceCount,
    independentOperationCount: input.operationCount
  },
  stopCondition: "Re-route only when the task shape or authorization boundary materially changes."
};

if (value("format", "json") === "text") {
  console.log(`Mode: ${packet.mode}`);
  console.log(`Use now: ${useNow.map((item) => item.module).join(" + ") || "work directly"}`);
  console.log(`After completion: ${afterCompletion.map((item) => item.module).join(" + ") || "none"}`);
  console.log(`Skip: ${skip.map((item) => item.module).join(" + ") || "none"}`);
  if (packet.constraints.length) console.log(`Constraint: ${packet.constraints.join(" ")}`);
} else {
  console.log(JSON.stringify(packet, null, 2));
}
