import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
};
const requested = option("input");
const input = requested
  ? (isAbsolute(requested) ? requested : resolve(process.cwd(), requested))
  : join(homedir(), ".codex", "telemetry", "tooling-atlas-events.ndjson");

let content;
try {
  content = await readFile(input, "utf8");
} catch (error) {
  if (error.code === "ENOENT") {
    console.log(`No activity events found at ${input}`);
    console.log("Codex may still need to reload and trust the new hook configuration.");
    process.exit(0);
  }
  throw error;
}

const events = content.split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch { throw new Error(`Invalid NDJSON on line ${index + 1}`); }
});
const countBy = (key) => Object.entries(events.reduce((counts, event) => {
  const value = event[key] || "unassigned";
  counts[value] = (counts[value] || 0) + 1;
  return counts;
}, {})).sort((a, b) => b[1] - a[1]);
const sessions = new Set(events.map((event) => event.run_id).filter(Boolean));
const toolEvents = events.filter((event) => event.event_name === "tool.completed");
const tagged = events.filter((event) => event.module_slug);

console.log(`Activity file: ${input}`);
console.log(`Events: ${events.length} · sessions: ${sessions.size} · completed tools: ${toolEvents.length}`);
console.log(`Module-tagged events: ${tagged.length} · unassigned activity: ${events.length - tagged.length}`);
console.log("\nEvents");
for (const [name, count] of countBy("event_name")) console.log(`  ${String(count).padStart(5)}  ${name}`);
console.log("\nTools");
for (const [name, count] of Object.entries(toolEvents.reduce((counts, event) => {
  const value = event.tool_name || "unassigned";
  counts[value] = (counts[value] || 0) + 1;
  return counts;
}, {})).sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`  ${String(count).padStart(5)}  ${name}`);
console.log("\nProjects");
for (const [name, count] of countBy("project").slice(0, 12)) console.log(`  ${String(count).padStart(5)}  ${name}`);
console.log("\nActivity proves what ran. Use scored eval pairs to decide whether a module helped.");
