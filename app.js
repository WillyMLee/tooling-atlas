import { renderDecisionFork, renderFlow, renderMetricBridge, renderSystemMap } from "./modules/diagram-kit.js";

const examples = {
  flow: `renderFlow(target, {\n  eyebrow: "How it works",\n  steps: [\n    { label: "Input", title: "Work traces", detail: "Observed activity" },\n    { label: "Product action", title: "Build context", detail: "Model paths and exceptions" },\n    { label: "Output", title: "Process evidence", detail: "A current operating view", tone: "accent" }\n  ]\n});`,
  system: `renderSystemMap(target, {\n  core: { label: "Control plane", title: "Context graph" },\n  nodes: [\n    { label: "Observe", title: "People" },\n    { label: "Connect", title: "Systems" },\n    { label: "Govern", title: "Policy" },\n    { label: "Execute", title: "Agents" }\n  ]\n});`,
  metric: `renderMetricBridge(target, {\n  metrics: [\n    { value: "−28%", label: "Friction", title: "Cycle time" },\n    { value: "+19%", label: "Capacity", title: "Throughput" },\n    { value: "$4.2M", label: "Outcome", title: "Annual value" }\n  ]\n});`,
  decision: `renderDecisionFork(target, {\n  question: "How should the team enter the market?",\n  paths: [\n    { label: "Path A", title: "Own the workflow", detail: "Higher product depth and implementation load.", recommended: true },\n    { label: "Path B", title: "Embed in the suite", detail: "Faster distribution with less control." }\n  ]\n});`,
};

renderFlow(document.querySelector("#flow-demo"), {
  eyebrow: "How the product works", title: "Observation becomes operating context", direction: "horizontal",
  steps: [
    { label: "Input", title: "Work traces", detail: "Privacy-conscious activity across applications." },
    { label: "Product action", title: "Build the model", detail: "Connect paths, roles, handoffs, and exceptions." },
    { label: "Output", title: "Process evidence", detail: "A current view teams and agents can use.", tone: "accent" },
  ],
});
renderSystemMap(document.querySelector("#system-demo"), {
  eyebrow: "Platform relationship", title: "The context graph coordinates the system",
  core: { label: "Control plane", title: "Context graph" },
  nodes: [
    { label: "Observe", title: "People", detail: "Work patterns" }, { label: "Connect", title: "Systems", detail: "Events and state" },
    { label: "Govern", title: "Policy", detail: "Rules and evidence" }, { label: "Execute", title: "Agents", detail: "Bounded action" },
  ],
});
renderMetricBridge(document.querySelector("#metric-demo"), {
  eyebrow: "Value chain", title: "From operating improvement to economic result",
  metrics: [
    { value: "−28%", label: "Friction", title: "Cycle time", detail: "Less waiting and rework." },
    { value: "+19%", label: "Capacity", title: "Throughput", detail: "More cases per team." },
    { value: "$4.2M", label: "Outcome", title: "Annual value", detail: "Measured contribution." },
  ],
});
renderDecisionFork(document.querySelector("#decision-demo"), {
  eyebrow: "Strategic choice", title: "Show the tradeoff before the recommendation", questionLabel: "Entry decision", question: "How should the team enter the market?",
  paths: [
    { label: "Path A", title: "Own the workflow", detail: "Build an end-to-end product around one painful operating process.", tradeoff: "More implementation · stronger position", recommended: true },
    { label: "Path B", title: "Embed in the suite", detail: "Integrate with an incumbent platform and inherit its distribution.", tradeoff: "Faster access · less control" },
  ],
});

const patternGrid = document.querySelector("#pattern-grid");
const filterRoot = document.querySelector("#pattern-filters");
const count = document.querySelector("#pattern-count");
let sites = [];
let activeType = "All";

const renderPatterns = () => {
  const visible = activeType === "All" ? sites : sites.filter((site) => site.type === activeType);
  count.textContent = `${visible.length} observed systems`;
  patternGrid.innerHTML = visible.map((site, index) => `<article class="pattern-card">
    <span>${String(index + 1).padStart(2, "0")} / ${site.type}</span>
    <h3>${site.name}</h3><p>${site.summary}</p>
    <dl><div><dt>Reusable pattern</dt><dd>${site.pattern}</dd></div><div><dt>Watch for</dt><dd>${site.caution}</dd></div></dl>
    <a href="${site.url}" target="_blank" rel="noreferrer">View live project ↗</a>
  </article>`).join("");
};

fetch("./catalog/sites.json").then((response) => response.json()).then((payload) => {
  sites = payload.sites;
  const types = ["All", ...new Set(sites.map((site) => site.type))];
  filterRoot.innerHTML = types.map((type) => `<button class="${type === activeType ? "is-active" : ""}" type="button" data-type="${type}">${type}</button>`).join("");
  renderPatterns();
}).catch(() => { count.textContent = "Catalog unavailable"; });

filterRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-type]");
  if (!button) return;
  activeType = button.dataset.type;
  filterRoot.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
  renderPatterns();
});

document.querySelectorAll("[data-density]").forEach((button) => button.addEventListener("click", () => {
  document.body.dataset.density = button.dataset.density;
  document.querySelectorAll("[data-density]").forEach((item) => item.classList.toggle("is-active", item === button));
}));

const toast = document.querySelector("#toast");
document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(examples[button.dataset.copy]);
  toast.textContent = "Example copied";
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1500);
}));

document.querySelector("#theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
});
