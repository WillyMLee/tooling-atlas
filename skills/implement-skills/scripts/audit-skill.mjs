import { access, readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const target = resolve(process.argv[2] || "");
if (!process.argv[2]) throw new Error("Usage: node audit-skill.mjs <skill-directory>");

const name = basename(target);
const issues = [];
const skillPath = join(target, "SKILL.md");
const metadataPath = join(target, "agents", "openai.yaml");
await access(skillPath);
await access(metadataPath);
const skill = await readFile(skillPath, "utf8");
const metadata = await readFile(metadataPath, "utf8");
const entries = await readdir(target, { withFileTypes: true });
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);

if (!frontmatter) issues.push("missing YAML frontmatter");
else {
  const fields = frontmatter[1].split("\n").filter(Boolean).map((line) => line.split(":")[0].trim());
  if (fields.join(",") !== "name,description") issues.push("frontmatter must contain only name and description");
  if (!frontmatter[1].includes(`name: ${name}`)) issues.push("name does not match the folder");
}
if (/TODO|\[TODO/i.test(skill)) issues.push("unresolved TODO marker");
if (skill.split("\n").length > 500) issues.push("SKILL.md exceeds 500 lines");
if (!metadata.includes(`$${name}`)) issues.push("default prompt does not mention the skill");
for (const forbidden of ["README.md", "CHANGELOG.md", "INSTALLATION_GUIDE.md", "QUICK_REFERENCE.md"]) {
  if (entries.some((entry) => entry.name.toUpperCase() === forbidden)) issues.push(`extraneous ${forbidden}`);
}

const result = { skill: name, path: target, valid: issues.length === 0, issues };
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exitCode = 1;

