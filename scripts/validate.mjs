import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const registry = JSON.parse(await readFile(join(root, "catalog", "module-registry.json"), "utf8"));
const sites = JSON.parse(await readFile(join(root, "catalog", "sites.json"), "utf8"));
const designSpecs = JSON.parse(await readFile(join(root, "catalog", "design-specs.json"), "utf8"));
const fieldTests = JSON.parse(await readFile(join(root, "observability", "field-tests.json"), "utf8"));
const slugs = new Set();

for (const module of registry.modules) {
  if (slugs.has(module.slug)) throw new Error(`Duplicate module slug: ${module.slug}`);
  slugs.add(module.slug);
  if (!module.hypothesis || !module.primaryMetric || !module.events?.length || !module.evalCases?.length) throw new Error(`${module.slug}: incomplete evaluation contract`);

  const skillRoot = join(root, module.packagePath);
  const skillPath = join(skillRoot, "SKILL.md");
  const openaiPath = join(skillRoot, "agents", "openai.yaml");
  await access(skillPath);
  await access(openaiPath);
  const skill = await readFile(skillPath, "utf8");
  const openai = await readFile(openaiPath, "utf8");
  if (!skill.startsWith("---\n") || !skill.includes(`\nname: ${module.slug}\n`) || !skill.includes("\ndescription:")) throw new Error(`${module.slug}: invalid SKILL.md frontmatter`);
  if (!openai.includes("display_name:") || !openai.includes("short_description:") || !openai.includes(`$${module.slug}`)) throw new Error(`${module.slug}: stale agents/openai.yaml`);
}

const siteSlugs = new Set(sites.sites.map((site) => site.slug));
const specSlugs = new Set(Object.keys(designSpecs.profiles ?? {}));
if (designSpecs.schemaVersion !== 1 || specSlugs.size !== siteSlugs.size) throw new Error("Design specs must provide one versioned profile per site");
for (const slug of siteSlugs) {
  const spec = designSpecs.profiles[slug];
  if (!spec) throw new Error(`Missing design spec: ${slug}`);
  if (!spec.preview?.headline || !spec.frame?.desktop || !spec.hero?.composition) throw new Error(`${slug}: incomplete preview, frame, or hero spec`);
  for (const field of ["sections", "components", "responsive", "buildSteps", "sourceFiles"]) {
    if (!Array.isArray(spec[field]) || spec[field].length < 2) throw new Error(`${slug}: incomplete ${field}`);
  }
}
for (const slug of specSlugs) {
  if (!siteSlugs.has(slug)) throw new Error(`Design spec has no matching site: ${slug}`);
}

if (fieldTests.dataKind !== "field-observation" || !fieldTests.notice) throw new Error("Field tests must remain qualified as non-benchmark observations");
for (const observation of fieldTests.observations ?? []) {
  if (!slugs.has(observation.module)) throw new Error(`Unknown field-test module: ${observation.module}`);
  for (const field of ["status", "test", "result", "finding", "change", "confidence"]) {
    if (!observation[field]) throw new Error(`${observation.module}: incomplete field observation ${field}`);
  }
}

const eventSchema = JSON.parse(await readFile(join(root, "observability", "events.schema.json"), "utf8"));
for (const field of ["schema_version", "event_time", "event_name", "run_id", "status"]) {
  if (!eventSchema.required.includes(field)) throw new Error(`Event schema must require ${field}`);
}

const example = JSON.parse(await readFile(join(root, "observability", "example-runs.json"), "utf8"));
if (example.dataKind !== "example" || !example.notice || example.runs.length < registry.modules.length * 2) throw new Error("Example telemetry must remain clearly labeled and cover baseline/candidate runs");
for (const run of example.runs) {
  if (!slugs.has(run.module)) throw new Error(`Unknown example module: ${run.module}`);
  if (!["baseline", "candidate"].includes(run.variant)) throw new Error(`Invalid example variant: ${run.variant}`);
}

console.log(`Validated ${registry.modules.length} agent modules, ${sites.sites.length} design specs, ${fieldTests.observations.length} field observations, and ${example.runs.length} example runs.`);
