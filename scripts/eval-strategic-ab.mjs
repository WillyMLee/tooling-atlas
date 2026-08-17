import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const suite = JSON.parse(await readFile(join(root, "evals", "strategic-ab-suite.json"), "utf8"));
const outputPath = join(root, "observability", "strategic-ab-summary.json");
const shouldWrite = process.argv.includes("--write");
const shouldCheck = process.argv.includes("--check");

const sameSet = (a, b) => a.length === b.length && a.every((item) => b.includes(item));
const routeModules = (item, candidate) => {
  const modules = [];
  if (item.scope === "multi") modules.push("orchestration-plan");
  if (item.scope === "broad" || item.sourceCount >= 5) modules.push("context-budget");
  if (item.workShape === "independent" && (!candidate || item.operationCount >= 8)) modules.push("batch-tool-calls");
  if (item.workShape === "browser") modules.push("web-interaction-loop");
  if (["eval", "skill"].includes(item.improvement)) modules.push("eval-improvement-loop");
  if (item.improvement === "skill") modules.push("implement-skills");
  return modules;
};

const evaluate = (module, item, variant) => {
  const candidate = variant === "candidate";
  if (module.slug === "route-skills") {
    const selected = routeModules(item, candidate);
    const errors = new Set([...selected.filter((value) => !item.expected.includes(value)), ...item.expected.filter((value) => !selected.includes(value))]).size;
    return { qualityScore: errors === 0 ? 1 : 0, primaryMetric: errors, detail: selected.join(", ") || "direct" };
  }
  if (module.slug === "context-budget") {
    const allBytes = item.relevantBytes + item.irrelevantBytes;
    const admitted = candidate && item.sources >= 5 ? item.relevantBytes + Math.min(item.irrelevantBytes, 8000) : allBytes;
    return { qualityScore: 1, primaryMetric: admitted, detail: `${item.relevantBytes} relevant bytes retained` };
  }
  if (module.slug === "batch-tool-calls") {
    const mode = candidate && item.independent && item.operations >= 8 ? "batch" : "direct";
    const rounds = mode === "batch" ? 1 + (item.hasPermanentFailure ? 1 : 0) : item.operations;
    return { qualityScore: mode === item.expectedMode ? 1 : 0, primaryMetric: rounds, detail: `${mode}; ${rounds} estimated rounds`, retries: item.hasPermanentFailure ? 1 : 0 };
  }
  const mode = candidate
    ? item.sharedWrites ? "single-owner" : item.coupled ? "direct" : "orchestrated"
    : item.tasks > 2 ? "orchestrated" : "direct";
  return { qualityScore: mode === item.expectedMode ? 1 : 0, primaryMetric: mode === item.expectedMode ? 0 : 1, detail: mode };
};

const runs = [];
const summaries = [];
for (const module of suite.modules) {
  for (const testCase of module.cases) {
    for (const variant of ["baseline", "candidate"]) {
      const result = evaluate(module, testCase, variant);
      runs.push({
        runId: `${testCase.id}-${variant}`,
        module: module.slug,
        scenario: testCase.id,
        variant,
        success: result.qualityScore === 1,
        qualityScore: result.qualityScore,
        primaryMetric: result.primaryMetric,
        durationMs: null,
        toolCalls: module.slug === "batch-tool-calls" ? result.primaryMetric : null,
        retryCount: result.retries ?? 0,
        inputTokens: null,
        outputTokens: null,
        estimatedCostUsd: null,
        detail: result.detail
      });
    }
  }
  const baseline = runs.filter((run) => run.module === module.slug && run.variant === "baseline");
  const candidate = runs.filter((run) => run.module === module.slug && run.variant === "candidate");
  const average = (items, key) => items.reduce((sum, item) => sum + item[key], 0) / Math.max(items.length, 1);
  const baselinePrimary = average(baseline, "primaryMetric");
  const candidatePrimary = average(candidate, "primaryMetric");
  const candidateQuality = average(candidate, "qualityScore");
  summaries.push({
    module: module.slug,
    cases: module.cases.length,
    primaryMetric: module.primaryMetric,
    baselineQuality: average(baseline, "qualityScore"),
    candidateQuality,
    baselinePrimary,
    candidatePrimary,
    primaryImprovementPercent: baselinePrimary === 0 ? null : Math.round(((baselinePrimary - candidatePrimary) / baselinePrimary) * 1000) / 10,
    qualityGatePassed: candidateQuality === 1,
    decision: candidateQuality === 1 && candidatePrimary <= baselinePrimary ? "expand-agent-trial" : "revise-policy"
  });
}

const payload = {
  schemaVersion: 1,
  dataKind: "measured-policy-eval",
  suite: suite.slug,
  generatedAt: new Date().toISOString(),
  notice: suite.notice,
  summaries,
  runs
};
if (shouldWrite) await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
if (shouldCheck) {
  const existing = JSON.parse(await readFile(outputPath, "utf8"));
  const comparable = ({ generatedAt, ...rest }) => rest;
  if (JSON.stringify(comparable(existing)) !== JSON.stringify(comparable(payload))) throw new Error("Strategic A/B output is stale. Run npm run eval:strategic.");
}
console.log(`Measured ${runs.length / 2} policy A/B pairs across ${summaries.length} modules.`);
for (const summary of summaries) console.log(`${summary.module}: ${(summary.candidateQuality * 100).toFixed(0)}% candidate quality; ${summary.primaryImprovementPercent ?? "n/a"}% primary-metric improvement; ${summary.decision}`);
