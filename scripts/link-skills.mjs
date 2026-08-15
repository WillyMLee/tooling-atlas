import { access, lstat, mkdir, readFile, readdir, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(root, "skills");
const dryRun = process.argv.includes("--dry-run");
const targetFlag = process.argv.indexOf("--target");
const targetRoot = resolve(targetFlag >= 0 ? process.argv[targetFlag + 1] : join(homedir(), ".agents", "skills"));

const names = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (!dryRun) await mkdir(targetRoot, { recursive: true });

for (const name of names) {
  const source = join(sourceRoot, name);
  const target = join(targetRoot, name);
  await access(join(source, "SKILL.md"));
  const skill = await readFile(join(source, "SKILL.md"), "utf8");
  if (!skill.includes(`name: ${name}`)) throw new Error(`${name}: SKILL.md name does not match its folder`);

  let existing = null;
  try { existing = await lstat(target); } catch {}
  if (existing) {
    console.log(`skip ${name}: target already exists at ${target}`);
    continue;
  }

  console.log(`${dryRun ? "would link" : "linked"} ${name} -> ${source}`);
  if (!dryRun) await symlink(source, target, process.platform === "win32" ? "junction" : "dir");
}

console.log(`${dryRun ? "Dry run" : "Skill links ready"}: ${targetRoot}`);
