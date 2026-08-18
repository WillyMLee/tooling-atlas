import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const fixtureRoot = await mkdtemp(join(tmpdir(), "tooling-atlas-system-"));
const home = join(fixtureRoot, "home");
const codexHome = join(home, ".codex");
const script = fileURLToPath(new URL("./install-system.mjs", import.meta.url));

try {
  await mkdir(codexHome, { recursive: true });
  await writeFile(join(codexHome, "AGENTS.md"), "# Personal defaults\n\n- Preserve this line.\n", "utf8");
  await writeFile(join(codexHome, "hooks.json"), JSON.stringify({
    description: "Fixture hooks",
    hooks: {
      Stop: [{ hooks: [{ type: "command", command: "node custom-hook.mjs", timeout: 2 }] }],
    },
  }, null, 2), "utf8");

  const args = [script, "--home", home, "--codex-home", codexHome];
  await execFileAsync(process.execPath, args);
  await execFileAsync(process.execPath, args);
  const checked = await execFileAsync(process.execPath, [...args, "--check", "--json"]);
  const state = JSON.parse(checked.stdout);
  if (!state.ready || state.skills.length !== 8 || state.skills.some((skill) => skill.status !== "linked")) throw new Error("System doctor did not report eight linked skills");

  const agents = await readFile(join(codexHome, "AGENTS.md"), "utf8");
  if (!agents.includes("Preserve this line") || (agents.match(/tooling-atlas:system-routing:start/g) ?? []).length !== 1) throw new Error("Managed AGENTS block was not preserved idempotently");
  const hooks = JSON.parse(await readFile(join(codexHome, "hooks.json"), "utf8"));
  if (!hooks.hooks.Stop.some((group) => group.hooks.some((hook) => hook.command === "node custom-hook.mjs"))) throw new Error("Existing hook was not preserved");
  if (Object.keys(hooks.hooks).length !== 9) throw new Error("Atlas lifecycle events were not installed");
  for (const skill of state.skills) {
    if ((await realpath(skill.source)) !== (await realpath(skill.target))) throw new Error(`${skill.name} does not resolve to its canonical source`);
  }
  console.log("System installer is idempotent, preserves personal config, and links all eight Atlas skills.");
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}
