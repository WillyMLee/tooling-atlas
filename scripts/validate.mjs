import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const registry = JSON.parse(await readFile(join(root, "catalog", "module-registry.json"), "utf8"));
const sites = JSON.parse(await readFile(join(root, "catalog", "sites.json"), "utf8"));
const designSpecs = JSON.parse(await readFile(join(root, "catalog", "design-specs.json"), "utf8"));
const designCaptures = JSON.parse(await readFile(join(root, "catalog", "design-captures.json"), "utf8"));
const fieldTests = JSON.parse(await readFile(join(root, "observability", "field-tests.json"), "utf8"));
const evalSummary = JSON.parse(await readFile(join(root, "observability", "eval-summary.json"), "utf8"));
const policyEval = JSON.parse(await readFile(join(root, "observability", "strategic-ab-summary.json"), "utf8"));
const productRegistry = JSON.parse(await readFile(join(root, "catalog", "product-registry.json"), "utf8"));
const siteHealth = JSON.parse(await readFile(join(root, "observability", "site-health.json"), "utf8"));
const backlog = JSON.parse(await readFile(join(root, "catalog", "strategic-backlog.json"), "utf8"));
const appSource = await readFile(join(root, "app.js"), "utf8");
const slugs = new Set();

for (const module of registry.modules) {
  if (slugs.has(module.slug)) throw new Error(`Duplicate module slug: ${module.slug}`);
  slugs.add(module.slug);
  if (!appSource.includes(`slug: "${module.slug}"`)) throw new Error(`${module.slug}: missing Atlas interface entry`);
  if (!module.hypothesis || !module.primaryMetric || !module.events?.length || !module.evalCases?.length) throw new Error(`${module.slug}: incomplete evaluation contract`);
  if (!module.orchestration?.phase || !module.orchestration.role || !module.orchestration.receives || !module.orchestration.handsOff || !module.orchestration.partners?.length) throw new Error(`${module.slug}: incomplete orchestration contract`);

  const skillRoot = join(root, module.packagePath);
  const skillPath = join(skillRoot, "SKILL.md");
  const openaiPath = join(skillRoot, "agents", "openai.yaml");
  await access(skillPath);
  await access(openaiPath);
  const skill = await readFile(skillPath, "utf8");
  const openai = await readFile(openaiPath, "utf8");
  if (!skill.startsWith("---\n") || !skill.includes(`\nname: ${module.slug}\n`) || !skill.includes("\ndescription:")) throw new Error(`${module.slug}: invalid SKILL.md frontmatter`);
  if (!openai.includes("display_name:") || !openai.includes("short_description:") || !openai.includes(`$${module.slug}`)) throw new Error(`${module.slug}: stale agents/openai.yaml`);
  if (module.routingPolicy) {
    if (module.routingPolicy.mode !== "evidence-responsive" || !module.routingPolicy.currentDefault || !module.routingPolicy.activateWhen?.length || !module.routingPolicy.skipWhen?.length) throw new Error(`${module.slug}: incomplete evidence-responsive routing policy`);
    const revision = module.latestRevision;
    if (!revision?.id || revision.version !== module.version || revision.baseFile !== `${module.packagePath}/SKILL.md` || !revision.evidenceFile || !revision.change) throw new Error(`${module.slug}: incomplete or stale base-file revision record`);
    if (!skill.includes(`Policy revision: \`${revision.id}\``)) throw new Error(`${module.slug}: SKILL.md does not contain registered policy revision ${revision.id}`);
  }
}

const routingPolicy = JSON.parse(await readFile(join(root, "skills", "route-skills", "references", "routing-policy.json"), "utf8"));
if (routingPolicy.schemaVersion !== 1 || !routingPolicy.policyVersion || routingPolicy.defaultMode !== "direct") throw new Error("Invalid smart skills routing policy");
if (routingPolicy.thresholds?.broadSourceCount < 1 || routingPolicy.thresholds?.independentOperationCount < 1) throw new Error("Routing thresholds must be positive");
for (const rule of routingPolicy.rules ?? []) {
  if (!slugs.has(rule.module) || !rule.phase || !rule.activateWhen?.length || !rule.skipWhen?.length || !rule.reason) throw new Error(`Incomplete routing rule: ${rule.module || "unknown"}`);
}

const siteSlugs = new Set(sites.sites.map((site) => site.slug));
const specSlugs = new Set(Object.keys(designSpecs.profiles ?? {}));
const captureSlugs = new Set(Object.keys(designCaptures.profiles ?? {}));
if (designSpecs.schemaVersion !== 1 || specSlugs.size !== siteSlugs.size) throw new Error("Design specs must provide one versioned profile per site");
if (designCaptures.schemaVersion !== 1 || captureSlugs.size !== siteSlugs.size) throw new Error("Design captures must provide one versioned profile per site");
for (const slug of siteSlugs) {
  const spec = designSpecs.profiles[slug];
  if (!spec) throw new Error(`Missing design spec: ${slug}`);
  if (!spec.preview?.headline || !spec.frame?.desktop || !spec.hero?.composition) throw new Error(`${slug}: incomplete preview, frame, or hero spec`);
  await access(join(root, "assets", "designs", `${slug}-hero.png`));
  await access(join(root, "assets", "designs", `${slug}-mobile.png`));
  for (const region of ["01-header", "02-primary", "03-supporting", "04-transition"]) await access(join(root, "assets", "designs", "regions", slug, `${region}.png`));
  const capture = designCaptures.profiles[slug];
  if (!capture || !["page-sequence", "product-views"].includes(capture.mode) || capture.frames?.length !== 3) throw new Error(`${slug}: incomplete page capture set`);
  for (const frame of capture.frames) {
    if (!frame.file || !frame.label || !frame.role) throw new Error(`${slug}: incomplete page capture metadata`);
    await access(join(root, "assets", "designs", "sections", slug, `${frame.file}.png`));
  }
  for (const field of ["sections", "components", "responsive", "buildSteps", "sourceFiles"]) {
    if (!Array.isArray(spec[field]) || spec[field].length < 2) throw new Error(`${slug}: incomplete ${field}`);
  }
}
for (const slug of specSlugs) {
  if (!siteSlugs.has(slug)) throw new Error(`Design spec has no matching site: ${slug}`);
}
for (const slug of captureSlugs) if (!siteSlugs.has(slug)) throw new Error(`Design capture has no matching site: ${slug}`);

if (fieldTests.dataKind !== "field-observation" || !fieldTests.notice) throw new Error("Field tests must remain qualified as non-benchmark observations");
for (const observation of fieldTests.observations ?? []) {
  if (!slugs.has(observation.module)) throw new Error(`Unknown field-test module: ${observation.module}`);
  for (const field of ["status", "test", "result", "finding", "change", "confidence"]) {
    if (!observation[field]) throw new Error(`${observation.module}: incomplete field observation ${field}`);
  }
}
if (evalSummary.dataKind !== "measured" || evalSummary.runs.length < 12) throw new Error("Control Tower must load the measured pilot rather than synthetic preview results");
if (policyEval.dataKind !== "measured-policy-eval" || policyEval.runs.length !== 48 || policyEval.summaries.length !== 4) throw new Error("Strategic policy A/B results must contain 24 matched pairs across four modules");
for (const summary of policyEval.summaries) if (!summary.qualityGatePassed) throw new Error(`${summary.module}: policy candidate failed its quality gate`);

if (productRegistry.schemaVersion !== 1 || productRegistry.sites.length < 15) throw new Error("Product registry must contain the verified live-site inventory");
const productSlugs = new Set(productRegistry.sites.map((site) => site.slug));
if (productSlugs.size !== productRegistry.sites.length) throw new Error("Product registry contains duplicate slugs");
for (const site of productRegistry.sites) for (const field of ["name", "url", "category", "purpose", "hosting", "surface"]) if (!site[field]) throw new Error(`${site.slug}: incomplete product registry entry`);
if (siteHealth.dataKind !== "measured-health" || siteHealth.checks.length !== productRegistry.sites.length) throw new Error("Site health must cover every registered site");
for (const check of siteHealth.checks) if (!productSlugs.has(check.slug) || !["healthy", "degraded", "down"].includes(check.status)) throw new Error(`Invalid site health check: ${check.slug}`);
if (backlog.items.length !== 12 || backlog.items.filter((item) => item.status === "active").length !== 6 || backlog.items.filter((item) => item.status === "later").length !== 6) throw new Error("Strategic backlog must preserve six active and six later priorities");

const eventSchema = JSON.parse(await readFile(join(root, "observability", "events.schema.json"), "utf8"));
if (eventSchema.properties.schema_version.const !== 2) throw new Error("Agent event schema must use privacy-minimal routing schema v2");
for (const field of ["schema_version", "event_time", "event_name", "run_id", "status"]) {
  if (!eventSchema.required.includes(field)) throw new Error(`Event schema must require ${field}`);
}

const example = JSON.parse(await readFile(join(root, "observability", "example-runs.json"), "utf8"));
if (example.dataKind !== "example" || !example.notice || example.runs.length < registry.modules.length * 2) throw new Error("Example telemetry must remain clearly labeled and cover baseline/candidate runs");
for (const run of example.runs) {
  if (!slugs.has(run.module)) throw new Error(`Unknown example module: ${run.module}`);
  if (!["baseline", "candidate"].includes(run.variant)) throw new Error(`Invalid example variant: ${run.variant}`);
}

console.log(`Validated ${registry.modules.length} agent modules, ${sites.sites.length} design profiles with page frames and component crops, ${productRegistry.sites.length} live sites, ${policyEval.runs.length / 2} policy pairs, ${evalSummary.runs.length / 2} agent pairs, and ${example.runs.length} labeled examples.`);
