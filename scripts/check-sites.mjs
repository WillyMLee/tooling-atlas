import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const registryPath = join(root, "catalog", "product-registry.json");
const outputPath = join(root, "observability", "site-health.json");
const shouldWrite = process.argv.includes("--write");
const registry = JSON.parse(await readFile(registryPath, "utf8"));

const check = async (site) => {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    let response = await fetch(site.url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if ([403, 405].includes(response.status)) response = await fetch(site.url, { method: "GET", redirect: "follow", signal: controller.signal });
    const latencyMs = Math.round(performance.now() - started);
    return {
      slug: site.slug,
      status: response.ok ? "healthy" : response.status < 500 ? "degraded" : "down",
      httpStatus: response.status,
      latencyMs,
      finalUrl: response.url,
      checkedAt: new Date().toISOString(),
      errorCode: ""
    };
  } catch (error) {
    return {
      slug: site.slug,
      status: "down",
      httpStatus: null,
      latencyMs: Math.round(performance.now() - started),
      finalUrl: site.url,
      checkedAt: new Date().toISOString(),
      errorCode: error?.name === "AbortError" ? "timeout" : "request-failed"
    };
  } finally {
    clearTimeout(timer);
  }
};

const checks = [];
for (let index = 0; index < registry.sites.length; index += 5) {
  checks.push(...await Promise.all(registry.sites.slice(index, index + 5).map(check)));
}
const count = (status) => checks.filter((item) => item.status === status).length;
const payload = {
  schemaVersion: 1,
  dataKind: "measured-health",
  generatedAt: new Date().toISOString(),
  notice: "Live HTTP status and response latency. This does not prove authenticated workflows, scheduled jobs, or data freshness.",
  summary: { total: checks.length, healthy: count("healthy"), degraded: count("degraded"), down: count("down") },
  checks
};

if (shouldWrite) await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(JSON.stringify(payload, null, 2));
if (payload.summary.down > 0) process.exitCode = 1;
