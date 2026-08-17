import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const files = ["index.html", "control-tower.html", "control-tower.js", "styles.css", "app.js", "LICENSE", "README.md"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all(files.map((file) => cp(join(root, file), join(dist, file))));
await Promise.all(["assets", "modules", "catalog", "skills", "docs", "observability", "evals"].map((folder) => cp(join(root, folder), join(dist, folder), { recursive: true })));
console.log(`Built Tooling Atlas in ${dist}`);
