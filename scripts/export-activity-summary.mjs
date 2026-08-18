import { access, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
};
const requested = option("input");
const input = requested
  ? (isAbsolute(requested) ? requested : resolve(process.cwd(), requested))
  : join(homedir(), ".codex", "telemetry", "tooling-atlas-events.ndjson");
const output = join(root, "observability", "activity-summary.json");
const registry = JSON.parse(await readFile(join(root, "catalog", "module-registry.json"), "utf8"));

let raw = "";
try {
  raw = await readFile(input, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const events = raw.split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch { throw new Error(`Invalid activity NDJSON on line ${index + 1}`); }
});
const decisions = events.filter((event) => event.event_name === "routing.decided");
const outcomes = events.filter((event) => event.event_name === "routing.completed");
const outcomeByRoute = new Map(outcomes.map((event) => [event.route_id, event]));
const latestDecision = [...decisions].sort((left, right) => String(right.event_time).localeCompare(String(left.event_time)))[0];

const modules = await Promise.all(registry.modules.map(async (module) => {
  const relevant = decisions.filter((event) => (event.skills_selected ?? []).includes(module.slug));
  const paired = relevant.flatMap((event) => {
    const outcome = outcomeByRoute.get(event.route_id);
    return outcome ? [outcome] : [];
  });
  let installed = true;
  try { await access(join(homedir(), ".agents", "skills", module.slug, "SKILL.md")); }
  catch { installed = false; }
  return {
    slug: module.slug,
    installed,
    selectedRoutes: relevant.length,
    completedRoutes: paired.length,
    qualityPassedRoutes: paired.filter((event) => event.quality_gate_passed === true).length,
    latestSelectedAt: relevant.map((event) => event.event_time).filter(Boolean).sort().at(-1) ?? null,
    latestOutcomeAt: paired.map((event) => event.event_time).filter(Boolean).sort().at(-1) ?? null,
  };
}));

const summary = {
  schemaVersion: 1,
  dataKind: "aggregated-local-activity",
  generatedAt: new Date().toISOString(),
  notice: "Privacy-minimal local routing counts captured at build time. They prove selection and completion, not causal efficiency gains.",
  installation: {
    installed: modules.filter((module) => module.installed).length,
    registered: modules.length,
  },
  routes: {
    decisions: decisions.length,
    outcomes: outcomes.length,
    open: decisions.filter((event) => !outcomeByRoute.has(event.route_id)).length,
    qualityPassed: outcomes.filter((event) => event.quality_gate_passed === true).length,
  },
  lastSelection: {
    selected: (latestDecision?.skills_selected ?? []).filter((slug) => registry.modules.some((module) => module.slug === slug)),
    taskShape: latestDecision?.task_shape || "unknown",
    routingMode: latestDecision?.routing_mode || "unknown",
    at: latestDecision?.event_time || null,
  },
  modules,
  missing: [
    "Unrecorded tasks are not counted.",
    "Tokens and billed cost are unavailable in current local route events.",
    "A completed route is not evidence that one selected skill caused the result.",
  ],
};

await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Exported ${events.length} privacy-minimal events across ${modules.length} registered modules.`);
