import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const suitePath = join(root, "evals", "pilot-suite.json");
const registryPath = join(root, "catalog", "module-registry.json");
const defaultOutput = join(root, "observability", "eval-summary.json");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
};
const pathOption = (name, fallback = "") => {
  const value = option(name) || fallback;
  return value ? (isAbsolute(value) ? value : resolve(process.cwd(), value)) : "";
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const round = (value, digits = 3) => value === null ? null : Number(value.toFixed(digits));
const qualityFor = (run) => average(Object.values(run.scores));

function validateSuite(suite, registry) {
  assert(suite.schemaVersion === 1, "Pilot suite must use schemaVersion 1");
  assert(suite.dataKind === "evaluation-plan", "Pilot suite must be labeled evaluation-plan");
  assert(suite.variants?.map((variant) => variant.slug).join(",") === "baseline,candidate", "Suite must define baseline then candidate");
  const knownModules = new Set(registry.modules.map((module) => module.slug));
  const scenarioIds = new Set();
  for (const module of suite.modules || []) {
    assert(knownModules.has(module.slug), `Unknown pilot module: ${module.slug}`);
    assert(["lower", "higher"].includes(module.primaryMetric.direction), `${module.slug}: invalid metric direction`);
    assert(module.cases?.length >= 3, `${module.slug}: include common, edge, and known-failure cases`);
    const categories = new Set(module.cases.map((scenario) => scenario.category));
    for (const required of ["common", "edge", "known-failure"]) assert(categories.has(required), `${module.slug}: missing ${required} case`);
    for (const scenario of module.cases) {
      assert(!scenarioIds.has(scenario.id), `Duplicate scenario id: ${scenario.id}`);
      scenarioIds.add(scenario.id);
      assert(scenario.task && scenario.fixture && scenario.acceptance?.length, `${scenario.id}: incomplete scenario contract`);
    }
  }
  return scenarioIds;
}

function validateObservations(payload, suite, scenarioIds) {
  assert(["measured", "synthetic"].includes(payload.dataKind), "Observations must be explicitly labeled measured or synthetic");
  assert(payload.suite === suite.slug, `Observation suite must equal ${suite.slug}`);
  const modules = new Map(suite.modules.map((module) => [module.slug, module]));
  const keys = new Set();
  for (const run of payload.observations || []) {
    assert(modules.has(run.module), `Unknown observation module: ${run.module}`);
    assert(scenarioIds.has(run.scenario), `Unknown observation scenario: ${run.scenario}`);
    assert(modules.get(run.module).cases.some((scenario) => scenario.id === run.scenario), `${run.scenario} does not belong to ${run.module}`);
    assert(["baseline", "candidate"].includes(run.variant), `${run.runId}: invalid variant`);
    assert(Number.isInteger(run.replicate) && run.replicate > 0, `${run.runId}: replicate must be a positive integer`);
    const key = `${run.module}:${run.scenario}:${run.replicate}:${run.variant}`;
    assert(!keys.has(key), `Duplicate observation: ${key}`);
    keys.add(key);
    assert(typeof run.success === "boolean", `${run.runId}: success must be boolean`);
    for (const axis of suite.grading.axes) {
      assert(typeof run.scores?.[axis.key] === "number" && run.scores[axis.key] >= 0 && run.scores[axis.key] <= 1, `${run.runId}: ${axis.key} must be between 0 and 1`);
    }
    assert(typeof run.metrics?.primary === "number" && run.metrics.primary >= 0, `${run.runId}: metrics.primary must be non-negative`);
    for (const metric of ["toolCalls", "durationMs"]) assert(typeof run.metrics?.[metric] === "number" && run.metrics[metric] >= 0, `${run.runId}: ${metric} must be non-negative`);
    for (const optional of ["inputTokens", "outputTokens", "estimatedCostUsd"]) assert(run.metrics?.[optional] === null || (typeof run.metrics?.[optional] === "number" && run.metrics[optional] >= 0), `${run.runId}: ${optional} must be null or non-negative`);
  }
}

function score(payload, suite) {
  const byPair = new Map();
  for (const run of payload.observations) {
    const key = `${run.module}:${run.scenario}:${run.replicate}`;
    if (!byPair.has(key)) byPair.set(key, {});
    byPair.get(key)[run.variant] = run;
  }

  const completePairs = [...byPair.entries()].filter(([, pair]) => pair.baseline && pair.candidate);
  const summaries = suite.modules.map((module) => {
    const pairs = completePairs.filter(([key]) => key.startsWith(`${module.slug}:`)).map(([, pair]) => pair);
    const improvements = pairs.map(({ baseline, candidate }) => {
      const raw = module.primaryMetric.direction === "lower"
        ? ((baseline.metrics.primary - candidate.metrics.primary) / Math.max(baseline.metrics.primary, 1)) * 100
        : ((candidate.metrics.primary - baseline.metrics.primary) / Math.max(baseline.metrics.primary, 1)) * 100;
      return raw;
    });
    const candidateGates = pairs.map(({ baseline, candidate }) => {
      const candidateQuality = qualityFor(candidate);
      return candidate.success
        && Object.values(candidate.scores).every((value) => value >= suite.grading.qualityFloor)
        && candidateQuality >= qualityFor(baseline) - suite.grading.maxQualityRegression;
    });
    const requiredPairs = module.cases.length * suite.policy.minReplicatesPerCase;
    const qualityPassed = pairs.length > 0 && candidateGates.every(Boolean);
    const primaryImprovementPercent = average(improvements);
    let decision = "collect-more";
    if (pairs.length >= requiredPairs && !qualityPassed) decision = "revise";
    else if (pairs.length >= requiredPairs && primaryImprovementPercent <= 0) decision = "retire-or-redesign";
    else if (pairs.length >= requiredPairs) decision = "pilot-pass";
    return {
      module: module.slug,
      pairedRuns: pairs.length,
      requiredPairs,
      qualityPassed,
      baselineQuality: round(average(pairs.map((pair) => qualityFor(pair.baseline)))),
      candidateQuality: round(average(pairs.map((pair) => qualityFor(pair.candidate)))),
      primaryMetric: module.primaryMetric.label,
      primaryImprovementPercent: round(primaryImprovementPercent, 1),
      decision,
    };
  });

  return {
    schemaVersion: 1,
    dataKind: payload.dataKind,
    suite: suite.slug,
    generatedAt: new Date().toISOString(),
    notice: payload.dataKind === "measured"
      ? "Measured pilot observations. A pilot pass is evidence for another trial, not universal proof."
      : "Synthetic scorer test data. Never use this dataset as evidence that a module helps.",
    summaries,
    runs: completePairs.flatMap(([, pair]) => [pair.baseline, pair.candidate]).map((run) => ({
      runId: run.runId,
      module: run.module,
      scenario: run.scenario,
      replicate: run.replicate,
      variant: run.variant,
      success: run.success,
      qualityScore: round(qualityFor(run)),
      durationMs: run.metrics.durationMs,
      toolCalls: run.metrics.toolCalls,
      estimatedCostUsd: run.metrics.estimatedCostUsd,
      primaryMetric: run.metrics.primary,
    })),
  };
}

function printPlan(suite) {
  const lines = [`# ${suite.name}`, "", `Suite: ${suite.slug}`, "", "Run each scenario as a matched pair. Keep the model, reasoning effort, fixture, and success criteria fixed; change only the Atlas module instruction.", ""];
  for (const module of suite.modules) {
    lines.push(`## ${module.name}`, "", `Primary metric: ${module.primaryMetric.label} (${module.primaryMetric.direction} is better after quality passes).`, "");
    for (const scenario of module.cases) {
      lines.push(`### ${scenario.id} · ${scenario.category}`, "", scenario.task, "", `Fixture: ${scenario.fixture}`, "", `Acceptance: ${scenario.acceptance.join("; ")}`, "");
    }
  }
  process.stdout.write(`${lines.join("\n")}\n`);
}

const command = process.argv[2] || "check";
const suite = await readJson(suitePath);
const registry = await readJson(registryPath);
const scenarioIds = validateSuite(suite, registry);

if (command === "plan") {
  printPlan(suite);
} else if (command === "check") {
  const template = await readJson(join(root, "evals", "observations", "pilot.template.json"));
  assert(template.dataKind === "template" && template.suite === suite.slug && Array.isArray(template.observations), "Observation template is invalid");
  const measured = await readJson(join(root, "evals", "observations", "2026-08-15-measured.json"));
  validateObservations(measured, suite, scenarioIds);
  for (const module of suite.modules) for (const scenario of module.cases) await access(join(root, scenario.fixture));
  console.log(`Validated ${suite.modules.length} pilot modules, ${scenarioIds.size} agent scenarios, and ${measured.observations.length} measured runs.`);
} else if (command === "score") {
  const positionalInput = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "";
  const inputPath = pathOption("input", positionalInput);
  assert(inputPath, "Usage: npm run eval:score -- <observations.json> (or: node scripts/eval.mjs score --input <file> [--output <file> | --stdout])");
  const payload = await readJson(inputPath);
  validateObservations(payload, suite, scenarioIds);
  const result = score(payload, suite);
  if (process.argv.includes("--stdout")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    const outputPath = pathOption("output", defaultOutput);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.log(`Wrote ${result.runs.length} paired run records to ${outputPath}`);
  }
} else {
  throw new Error(`Unknown eval command: ${command}`);
}
