import {
  renderLiveProcess, renderProductWorkflow, renderProblemNarrative, renderCompetitiveRadar,
  renderHeroLedger, renderStepDetail, renderPlannerRail,
} from "./modules/diagram-kit.js";

const view = document.querySelector("#view");
const toast = document.querySelector("#toast");
const designLinks = document.querySelector("#design-links");
const skillLinks = document.querySelector("#skill-links");
const menuButton = document.querySelector("#menu-button");
const directory = document.querySelector("#directory");

const skills = [
  {
    slug: "context-budget", name: "Context Budget", status: "Experimental · measured",
    summary: "Keep large tool output outside the active conversation, retrieve evidence narrowly, and preserve a compact project state for genuinely broad tasks.",
    trigger: "Long-running repository work, heavy logs, many-source research, or repeated output where a resume packet materially reduces rereading.",
    avoid: "Routine tasks with roughly four or fewer short sources; the measured pilot showed module overhead can dominate.",
    outcome: "A smaller working set that remains traceable and resumable.",
    steps: [
      ["Set the working set", "Name the task, exact files, open decisions, and required evidence before collecting more context."],
      ["Reduce at the source", "Filter, query, or sandbox large outputs before they enter the model context; keep provenance back to the original source."],
      ["Re-open for proof", "Pull exact lines or records only when a decision or final claim needs direct support."],
      ["Leave a resume packet", "Record completed work, active files, decisions, verification state, and the next safe action."],
    ],
    safeguards: ["Never discard source locations", "Do not compress approvals or user intent", "Measure usefulness, not token reduction alone"],
    example: { scenario: "A repository audit returns hundreds of files, several long logs, and multiple documentation pages.", pattern: "Keep a compact working set, search the large sources in place, and reopen only the exact files or lines needed for a decision.", deliverable: "A resume packet with active files, decisions, verification state, and source pointers." },
    measures: ["Relevant evidence retained", "Repeated reads avoided", "Another run can resume cleanly"],
    sourcePath: "skills/context-budget/SKILL.md",
    sources: [["Context Mode — local MCP context optimization", "https://github.com/mksglu/context-mode"], ["Anthropic — effective context engineering", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"], ["OpenAI Agent Skills guide", "https://developers.openai.com/api/docs/guides/tools-skills"]],
  },
  {
    slug: "batch-tool-calls", name: "Batch Tool Calls", status: "Experimental · measured regression",
    summary: "Group a substantial set of independent reads into bounded batches only when the saved round trips exceed setup overhead.",
    trigger: "Roughly eight or more independent queries, reads, or lookups with a strict compact return shape and material round-trip latency.",
    avoid: "Small three-to-four item reads, dependent calls, oversized combined results, or any batch of consequential writes.",
    outcome: "Fewer round trips without losing evidence, judgment, or control.",
    steps: [
      ["Partition the work", "Separate independent operations from steps that require fresh judgment or depend on prior results."],
      ["Define the return shape", "Request only the fields needed for the next decision and set explicit call and retry limits."],
      ["Run safe calls together", "Batch read-only operations; keep side effects, approvals, and destructive actions direct."],
      ["Reduce once", "Combine duplicates, surface missing evidence, and feed a compact result into the next judgment."],
    ],
    safeguards: ["No parallel side effects", "Bound concurrency and retries", "Do not repeat completed calls"],
    example: { scenario: "A company profile needs six independent source checks and five local logo-file inspections.", pattern: "Batch the independent reads, normalize each result to the same fields, then make one evidence-based editorial decision.", deliverable: "A compact evidence table with gaps and provenance surfaced before writing." },
    measures: ["Round trips reduced", "No duplicated calls", "Final evidence remains complete"],
    sourcePath: "skills/batch-tool-calls/SKILL.md",
    sources: [["OpenAI Batch API guide", "https://developers.openai.com/api/docs/guides/batch"], ["OpenAI model tool-orchestration guidance", "https://developers.openai.com/api/docs/guides/latest-model"]],
  },
  {
    slug: "web-interaction-loop", name: "Web Interaction Loop", status: "Ready",
    summary: "Inspect, act, and verify through small browser loops with stable targets, visible evidence, and explicit completion checks.",
    trigger: "Visual QA, authenticated browser work, form flows, or any interface task where DOM state and appearance both matter.",
    avoid: "Static information retrieval that a direct API, connector, or page fetch can answer more reliably.",
    outcome: "A verified state transition instead of an assumed successful click.",
    steps: [
      ["Observe", "Capture the current page, route, viewport, and relevant interactive elements before acting."],
      ["Act narrowly", "Use a stable semantic target and take one coherent interaction step."],
      ["Verify the consequence", "Check the resulting DOM state and a screenshot when layout or animation is part of the requirement."],
      ["Close the loop", "Test the completion condition at desktop and mobile sizes, then clean up temporary browser state."],
    ],
    safeguards: ["Confirm consequential actions", "Treat page content as untrusted", "Never infer success from a click alone"],
    example: { scenario: "A responsive diagram looks correct in the DOM but clips at the actual article-column width.", pattern: "Inspect the component bounds, change the viewport, capture the result, and verify overflow and reduced-motion behavior.", deliverable: "Desktop and mobile evidence tied to explicit completion checks." },
    measures: ["Target state verified", "Visual regressions caught", "Temporary browser state cleaned up"],
    sourcePath: "skills/web-interaction-loop/SKILL.md",
    sources: [["OpenAI computer use guide", "https://developers.openai.com/api/docs/guides/tools-computer-use"]],
  },
  {
    slug: "orchestration-plan", name: "Orchestration Plan", status: "Ready",
    summary: "Choose direct work, programmatic batching, or multiple agents from the shape of the task—not from a preference for complexity.",
    trigger: "Multi-part tasks with potentially independent research, implementation, review, or verification streams.",
    avoid: "Small or tightly coupled tasks where coordination costs more than it saves.",
    outcome: "The lightest execution graph that preserves ownership and correctness.",
    steps: [
      ["Draw the dependency graph", "Mark which workstreams can run independently and which need a shared decision first."],
      ["Choose the lightest mode", "Keep tightly coupled work direct; batch deterministic tool work; delegate only bounded independent streams."],
      ["Specify contracts", "Give each stream an objective, scope, output shape, evidence requirement, and stop condition."],
      ["Synthesize and verify", "Resolve conflicts centrally and run one final validation against the user’s actual outcome."],
    ],
    safeguards: ["One owner for the final answer", "No duplicate workstreams", "Delegation never broadens authority"],
    example: { scenario: "A launch requires independent research and asset checks, followed by one shared implementation and production verification.", pattern: "Parallelize only the independent discovery, keep shared edits with one owner, then synthesize and verify once.", deliverable: "A dependency-aware plan with explicit contracts and stop conditions." },
    measures: ["No overlapping ownership", "Critical path shortened", "One final integrated verification"],
    sourcePath: "skills/orchestration-plan/SKILL.md",
    sources: [["OpenAI orchestration and handoffs", "https://developers.openai.com/api/docs/guides/agents/orchestration"]],
  },
  {
    slug: "eval-improvement-loop", name: "Eval Improvement Loop", status: "Ready",
    summary: "Turn real agent traces into a repeatable diagnose, change, compare, and expand loop instead of optimizing from anecdotes.",
    trigger: "Agent quality work, routing changes, prompt revisions, tool failures, regressions, or model and reasoning-effort comparisons.",
    avoid: "One-off stylistic edits with no stable task definition or observable success criterion.",
    outcome: "A measured improvement tied to a representative dataset and a named failure mode.",
    steps: [["Define success", "Translate the user outcome into task-success, evidence, safety, latency, and cost checks."], ["Read the trace", "Locate the earliest material failure across model decisions, tool selection, arguments, handoffs, and final synthesis."], ["Change one lever", "Adjust the smallest relevant prompt, tool, route, model, or guardrail so the causal effect stays legible."], ["Compare and expand", "Rerun the same cases, compare the baseline, and add the discovered edge case to the permanent set."]],
    safeguards: ["Do not tune only to one happy path", "Change one major variable at a time", "Quality gates come before token savings"],
    example: { scenario: "A research agent finds the right sources but omits citations in its final answer.", pattern: "Grade the trace and final message separately, fix the synthesis contract, then rerun the same source-backed cases.", deliverable: "A baseline/candidate comparison plus a new regression case for citation completeness." },
    measures: ["Task success rate", "Tool and route correctness", "Evidence completeness", "Latency and cost after quality passes"],
    sourcePath: "skills/eval-improvement-loop/SKILL.md",
    sources: [["OpenAI — evaluate agent workflows", "https://developers.openai.com/api/docs/guides/agent-evals"], ["OpenAI — trace grading", "https://developers.openai.com/api/docs/guides/trace-grading"], ["Google Agents CLI — evaluation loop", "https://google.github.io/agents-cli/guide/evaluation/"]],
  },
  {
    slug: "design-tool-surface", name: "Design Tool Surface", status: "Ready",
    summary: "Reduce tool confusion by giving each tool one clear job, a predictable return shape, and explicit routing boundaries.",
    trigger: "Agents choose the wrong tool, receive bloated outputs, retry unnecessarily, or face overlapping tools and ambiguous parameters.",
    avoid: "A small, stable tool set already producing reliable selections and compact results.",
    outcome: "A smaller and more legible action space for the agent.",
    steps: [["Inventory decisions", "List the user intents the agent must route and the evidence or action each intent requires."], ["Remove overlap", "Give each tool a distinct semantic job; merge or hide tools that create indistinguishable choices."], ["Tighten contracts", "Document inputs, returns, error behavior, side effects, and when a different tool should be used."], ["Test selection", "Run representative and adversarial requests, inspect traces, and simplify again where routing remains ambiguous."]],
    safeguards: ["Keep side effects unmistakable", "Return only decision-relevant fields", "Preserve errors and provenance"],
    example: { scenario: "An agent can search, browse, fetch, and scrape, but cannot tell which one should answer a static documentation question.", pattern: "Route semantic retrieval to search or fetch, reserve browser control for visible interaction, and state the fallback boundary once.", deliverable: "A routing table plus concise tool descriptions with non-overlapping triggers." },
    measures: ["Correct tool selected", "Unnecessary calls reduced", "Output size reduced", "Error recovery improves"],
    sourcePath: "skills/design-tool-surface/SKILL.md",
    sources: [["Anthropic — effective context engineering", "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"], ["OpenAI — model and tool guidance", "https://developers.openai.com/api/docs/guides/latest-model"]],
  },
];

const packets = [
  { slug: "live", name: "Live Process", source: "WillyMLee.com", sourceUrl: "https://willymlee.com/", family: "Hero motion", use: "Animate a short, human-readable activity chain inside a hero without turning the whole page into a product demo.", shows: "A process unfolding in real time", avoid: "Long workflows or steps that require paragraphs" },
  { slug: "workflow", name: "Product Workflow", source: "Signal Notes", sourceUrl: "https://signal-notes.pages.dev/", family: "Product explainer", use: "Let readers switch between product capabilities, then see the input, product action, and usable output for each one.", shows: "What the product actually does", avoid: "A company overview with no concrete action" },
  { slug: "problem", name: "Problem Narrative", source: "Signal Notes", sourceUrl: "https://signal-notes.pages.dev/", family: "Research narrative", use: "Give a structural problem, a concrete example, and the category response enough room to be understood in sequence.", shows: "Why the category needs to exist", avoid: "Tiny summary cards or unrelated observations" },
  { slug: "radar", name: "Competitive Radar", source: "Signal Notes", sourceUrl: "https://signal-notes.pages.dev/", family: "Market map", use: "Place a small competitive set across two meaningful axes, with hover detail and a centered live-state marker.", shows: "Relative market positioning", avoid: "Precise quantitative comparisons" },
  { slug: "ledger", name: "Hero Ledger", source: "Crumb", sourceUrl: "https://crumb-recipe-journal.willymlee.workers.dev/", family: "Hero utility", use: "Pair an expressive hero with one tactile summary card containing a headline metric, supporting facts, and one next action.", shows: "The useful state behind the headline", avoid: "Full analytics dashboards" },
  { slug: "step", name: "Step Detail", source: "Crumb", sourceUrl: "https://crumb-recipe-journal.willymlee.workers.dev/", family: "Instructional UI", use: "Keep the main instruction readable while a compact companion panel exposes ingredients, tools, or process details needed right now.", shows: "Action plus just-in-time context", avoid: "High-level journeys without operational detail" },
  { slug: "planner", name: "Planning Rail", source: "Crumb", sourceUrl: "https://crumb-recipe-journal.willymlee.workers.dev/", family: "Interactive planning", use: "Use a selectable time rail above structured slots so the user always knows the active planning context.", shows: "Time selection and resource allocation", avoid: "Static editorial content" },
];

const packetOptions = {
  live: { source: "WillyMLee.com", title: "Live process", label: "Weekend baking", status: "Active", steps: ["Feed the starter", "Shape the dough", "Wait for the rise"] },
  workflow: { source: "Signal Notes", title: "How the product works", workflows: [
    { label: "Observe", title: "Capture the work", detail: "Collect interaction signals across applications without waiting for a bespoke integration.", input: "Work traces", action: "Model the operating process", output: "Process evidence" },
    { label: "Understand", title: "Find the pattern", detail: "Connect events, participants, handoffs, and exceptions into a shared operating view.", input: "Process evidence", action: "Build the process model", output: "Verified bottleneck" },
    { label: "Improve", title: "Guide the next action", detail: "Turn the operating model into a prioritized intervention a team can test and measure.", input: "Verified bottleneck", action: "Recommend an intervention", output: "Measured improvement" },
  ] },
  problem: { source: "Signal Notes", title: "From structural gap to category response", steps: [
    { label: "Problem overview", title: "The work is visible only in fragments", detail: "Teams see tickets, dashboards, and outcomes, but not the full sequence of decisions and handoffs that created them." },
    { label: "Example issue", title: "The delay hides between systems", detail: "A case appears to take three days. The actual work takes two hours; queues, re-entry, and unclear ownership consume the rest.", note: "The useful diagram explains the concrete failure before introducing the product." },
    { label: "Solution approach", title: "Create evidence of how work really moves", detail: "The category reconstructs the operating process, identifies avoidable friction, and gives teams a shared view for redesign." },
  ] },
  radar: { source: "Signal Notes", title: "Competitive field", nodes: [
    { name: "Platform", initial: "P", x: 50, y: 24, note: "Broad system of record" }, { name: "Specialist", initial: "S", x: 72, y: 40, note: "Deep vertical workflow" },
    { name: "Open source", initial: "O", x: 31, y: 45, note: "Developer-led control" }, { name: "Agent layer", initial: "A", x: 62, y: 70, note: "Action and orchestration" },
    { name: "Incumbent", initial: "I", x: 33, y: 73, note: "Distribution and bundling" },
  ] },
  ledger: { source: "Crumb", title: "Hero summary ledger", eyebrow: "Library summary", period: "2026", value: "24", unit: "recipes", rows: [{ label: "Made", value: "16" }, { label: "Revisions", value: "31" }], action: "Open weekly plan", note: "The object feels useful, not decorative: it summarizes the library and carries the hero into a concrete workflow." },
  step: { source: "Crumb", title: "Instruction with working context", number: "03", stepTitle: "Build the sauce", time: "12 min", detail: "Toast the aromatics until fragrant, then add the liquids slowly and simmer until the sauce coats the back of a spoon.", tip: "Keep the heat moderate after the liquid goes in; a hard boil can flatten the aromatics.", ingredients: [{ amount: "2 tbsp", name: "olive oil" }, { amount: "3 cloves", name: "garlic" }, { amount: "1 cup", name: "stock" }], process: ["Toast aromatics", "Deglaze", "Reduce until glossy"] },
  planner: { source: "Crumb", title: "Selectable planning rail", days: [{ label: "Monday", count: "3" }, { label: "Tuesday", count: "2" }, { label: "Wednesday", count: "4" }, { label: "Thursday", count: "2" }, { label: "Friday", count: "3" }], meals: [
    { icon: "P", label: "Protein", hint: "The main anchor", items: [{ title: "Miso ginger salmon", meta: "35 min" }] },
    { icon: "V", label: "Vegetable", hint: "One or more sides", items: [{ title: "Sesame broccoli", meta: "20 min" }, { title: "Cucumber salad", meta: "15 min" }] },
    { icon: "B", label: "Base", hint: "Grain, noodle, or bread", items: [{ title: "Ginger scallion rice", meta: "30 min" }] },
  ] },
};

const renderers = { live: renderLiveProcess, workflow: renderProductWorkflow, problem: renderProblemNarrative, radar: renderCompetitiveRadar, ledger: renderHeroLedger, step: renderStepDetail, planner: renderPlannerRail };
let sites = [];
let moduleRegistry = [];
let telemetryRuns = [];
let telemetryNotice = "No telemetry dataset loaded.";
let telemetryKind = "pending";
let evalSummaries = [];
let pilotSuite = { modules: [], grading: {} };
let designSpecs = {};
let fieldTests = [];
let currentPacket = "live";
let packetAccent = "#b44c36";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const showToast = (message) => { toast.textContent = message; toast.classList.add("is-visible"); window.setTimeout(() => toast.classList.remove("is-visible"), 1600); };
const routeTo = (hash) => { window.location.hash = hash; };
const pageHead = (kicker, title, description) => `<header class="page-head"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${description}</p></header>`;
const moduleFor = (slug) => moduleRegistry.find((module) => module.slug === slug) || {};
const specFor = (slug) => designSpecs[slug] || {};
const fieldTestFor = (slug) => fieldTests.filter((observation) => observation.module === slug);
const repoUrl = (path) => `https://github.com/WillyMLee/tooling-atlas/blob/main/${path}`;
const pairedStatsFor = (slug) => {
  const grouped = new Map();
  telemetryRuns.filter((run) => run.module === slug).forEach((run) => {
    const key = `${run.scenario}:${run.replicate}`;
    grouped.set(key, { ...(grouped.get(key) || {}), [run.variant]: run });
  });
  const pairs = [...grouped.values()].filter((pair) => pair.baseline && pair.candidate);
  const leaner = pairs.filter((pair) => pair.candidate.success && pair.candidate.qualityScore >= pair.baseline.qualityScore && pair.candidate.toolCalls < pair.baseline.toolCalls && pair.candidate.durationMs < pair.baseline.durationMs).length;
  const regressed = pairs.filter((pair) => pair.candidate.toolCalls > pair.baseline.toolCalls && pair.candidate.durationMs > pair.baseline.durationMs).length;
  return { total: pairs.length, leaner, regressed, neutral: pairs.length - leaner - regressed };
};
const dynamicRoutingSignal = (slug) => {
  const stats = pairedStatsFor(slug);
  if (!stats.total) return { label: "Benchmark before routing", detail: "No matched run can adjust the default yet.", stats };
  if (stats.leaner && stats.regressed) return { label: "Route by workload shape", detail: `${stats.leaner} pair${stats.leaner === 1 ? "" : "s"} favored the module and ${stats.regressed} added overhead.`, stats };
  if (stats.regressed === stats.total) return { label: "Default off for tested shape", detail: `All ${stats.total} measured pairs added calls and elapsed time.`, stats };
  if (stats.leaner === stats.total) return { label: "Candidate preferred in tested shape", detail: `All ${stats.total} measured pairs preserved quality while reducing calls and elapsed time.`, stats };
  return { label: "Keep collecting evidence", detail: `${stats.total} measured pair${stats.total === 1 ? "" : "s"} do not yet support a stable routing change.`, stats };
};
const percentDelta = (candidate, baseline) => baseline ? ((candidate - baseline) / baseline) * 100 : 0;
const signed = (value, suffix = "%") => `${value > 0 ? "+" : ""}${value.toFixed(0)}${suffix}`;
const averageKnown = (values) => { const known = values.filter((value) => typeof value === "number"); return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null; };
const formatDuration = (milliseconds) => milliseconds === null || milliseconds === undefined ? "—" : `${(milliseconds / 1000).toFixed(1)}s`;
const aggregateRun = (module, variant) => {
  const runs = telemetryRuns.filter((run) => run.module === module && run.variant === variant);
  if (!runs.length) return null;
  return {
    success: runs.filter((run) => run.success).length / runs.length,
    qualityScore: averageKnown(runs.map((run) => run.qualityScore)),
    durationMs: averageKnown(runs.map((run) => run.durationMs)),
    toolCalls: averageKnown(runs.map((run) => run.toolCalls)),
    estimatedCostUsd: averageKnown(runs.map((run) => run.estimatedCostUsd)),
  };
};
const deltaCell = (candidate, baseline, key, lowerIsBetter = true) => {
  if (candidate?.[key] === null || baseline?.[key] === null || candidate?.[key] === undefined || baseline?.[key] === undefined) return { value: "—", className: "" };
  const delta = percentDelta(candidate[key], baseline[key]);
  const better = lowerIsBetter ? delta <= 0 : delta >= 0;
  return { value: signed(delta), className: better ? "is-better" : "is-worse" };
};
const capturePath = (site) => `./assets/designs/${site.slug}-hero.png`;
const mobileCapturePath = (site) => `./assets/designs/${site.slug}-mobile.png`;
const captureFragments = (site, spec) => [
  { label: "Header + wayfinding", detail: spec.sections?.[0] || spec.components?.[0] || "Primary navigation", position: "center top" },
  { label: "Primary hero move", detail: spec.hero?.primary || site.layout, position: "left center" },
  { label: "Supporting system", detail: spec.hero?.secondary || site.interactions, position: "right center" },
  { label: "Lower-frame behavior", detail: spec.hero?.visual || site.designSummary, position: "center bottom" },
];
const renderSourceCapture = (site, spec, compact = false) => `<figure class="source-capture ${compact ? "is-compact" : "is-large"}">
  <img src="${capturePath(site)}" alt="Actual ${escapeHtml(site.name)} opening frame at 1280 by 720 pixels" ${compact ? "loading=\"lazy\"" : ""}>
  ${compact ? `<span class="capture-badge">Actual source frame</span>` : `<div class="capture-markers" aria-hidden="true"><i style="--x:8%;--y:8%">01</i><i style="--x:24%;--y:45%">02</i><i style="--x:78%;--y:48%">03</i><i style="--x:50%;--y:88%">04</i></div>`}
  <figcaption><span>Live source capture</span><span>1280 × 720 · 2026-08-15</span></figcaption>
</figure>`;

function renderSidebar() {
  designLinks.innerHTML = sites.map((site, index) => `<a href="#design/${site.slug}" data-route-link data-search-item="${escapeHtml(`${site.name} ${site.type} ${site.theme}`)}">D${String(index + 1).padStart(2, "0")} <strong>${escapeHtml(site.name)}</strong></a>`).join("");
  skillLinks.innerHTML = `<a href="#skills" data-route-link data-search-item="all agent modules optimization skills">A00 <strong>All modules</strong></a>${skills.map((skill, index) => `<a href="#skill/${skill.slug}" data-route-link data-search-item="${escapeHtml(`${skill.name} ${skill.summary}`)}">A${String(index + 1).padStart(2, "0")} <strong>${escapeHtml(skill.name)}</strong></a>`).join("")}`;
  document.querySelector("#atlas-count").textContent = `${sites.length + packets.length + skills.length + 4} entries`;
}

function renderOverview() {
  const recent = sites;
  view.innerHTML = `<div class="page">
    <section class="overview-hero">
      <div class="overview-copy">
        <span class="eyebrow">A WORKING LIBRARY / OPEN SOURCE</span>
        <h1>Useful things,<br><em>kept within reach.</em></h1>
        <p>Design systems, visual explanations, interactions, and agent workflows—cataloged as reusable parts instead of rediscovered each time.</p>
        <div class="overview-actions"><a class="text-link" href="#design/${recent[0]?.slug || "mumblings"}">Browse the gallery →</a><a class="text-link secondary" href="#packets">Build a diagram</a></div>
      </div>
      <div class="overview-field" aria-hidden="true">
        <div class="atlas-orbit"></div><span class="orbit-label one">Designs</span><span class="orbit-label two">Diagrams</span><span class="orbit-label three">Skills</span><span class="orbit-label four">Interactions</span>
        <p class="field-caption">A field guide should shorten the distance between an idea and a dependable implementation.</p>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading"><div><span class="section-index">01 / Verified source frames</span><h2>Design gallery</h2></div><p>Every card starts with the actual rendered opening frame. Open it to inspect component crops, hero anatomy, palette, type, layout, breakpoints, and source provenance.</p></div>
      <div class="design-gallery-grid">${recent.map((site, index) => { const spec = specFor(site.slug); return `<a class="design-gallery-card" href="#design/${site.slug}">${renderSourceCapture(site, spec, true)}<div class="design-gallery-copy"><span>D${String(index + 1).padStart(2,"0")} / ${escapeHtml(site.type)}</span><h3>${escapeHtml(site.name)}</h3><p>${escapeHtml(spec.hero?.composition || site.layout)}</p><small>Inspect source frame + components →</small></div></a>`; }).join("")}</div>
    </section>
    <section class="content-section">
      <div class="section-heading"><div><span class="section-index">02 / Working packets</span><h2>Start from a proven shape</h2></div><p>Packets keep recurring interface work consistent while leaving the content, tone, and final judgment open.</p></div>
      <div class="overview-grid overview-grid-four">
        <a class="overview-card" href="#packets"><span>P / 07</span><h3>Pattern packets</h3><p>Seven code-native modules extracted from interfaces already proven across your sites.</p><small>Open library →</small></a>
        <a class="overview-card" href="#interactions"><span>I / 03</span><h3>Interaction packets</h3><p>Quiet motion patterns with timing, purpose, and reduced-motion behavior.</p><small>Inspect motion →</small></a>
        <a class="overview-card" href="#skills"><span>A / 06</span><h3>Agent modules</h3><p>Installable operating playbooks for context, tools, browsing, orchestration, and evals.</p><small>Review modules →</small></a>
        <a class="overview-card" href="./control-tower.html"><span>C / 01</span><h3>Control Tower</h3><p>A separate measurement site for quality, activity, latency, tokens, and cost comparisons.</p><small>Open measurement site ↗</small></a>
      </div>
    </section>
  </div>`;
}

function renderDesign(site) {
  if (!site) return renderNotFound();
  const spec = specFor(site.slug);
  view.innerHTML = `<article class="page">
    <header class="design-hero design-profile-hero">
      <div><span class="eyebrow">DESIGN PROFILE / ${escapeHtml(site.type)}</span><h1>${escapeHtml(site.name)}</h1><p class="lede">${escapeHtml(site.summary)}</p></div>
      <dl class="design-meta"><div><dt>Archetype</dt><dd>${escapeHtml(spec.hero?.composition || site.layout)}</dd></div><div><dt>Frame</dt><dd>${escapeHtml(spec.frame?.desktop || "Not recorded")}</dd></div><div><dt>Breakpoint</dt><dd>${escapeHtml(spec.frame?.breakpoint || "Not recorded")}</dd></div><div><dt>Source</dt><dd><a href="${site.url}" target="_blank" rel="noreferrer">Open live site ↗</a></dd></div></dl>
    </header>
    <section class="reconstruction-preview"><div class="preview-heading"><div><span class="field-label">Verified source frame</span><h2>Start with what the site actually renders.</h2></div><p>This is a captured 1280 × 720 opening frame from the live source—not an Atlas approximation. The fragments below isolate the systems an agent should inspect before rebuilding.</p></div>${renderSourceCapture(site, spec)}<div class="capture-fragment-grid">${captureFragments(site, spec).map((fragment,index) => `<article><div class="capture-fragment"><img src="${capturePath(site)}" alt="${escapeHtml(fragment.label)} crop from ${escapeHtml(site.name)}" style="object-position:${fragment.position}"></div><span>0${index + 1} / ${escapeHtml(fragment.label)}</span><h3>${escapeHtml(fragment.detail)}</h3></article>`).join("")}</div><ol class="preview-callouts"><li><span>01</span><strong>Primary move</strong><p>${escapeHtml(spec.hero?.primary || site.layout)}</p></li><li><span>02</span><strong>Supporting move</strong><p>${escapeHtml(spec.hero?.secondary || site.interactions)}</p></li><li><span>03</span><strong>Visual language</strong><p>${escapeHtml(spec.hero?.visual || site.designSummary)}</p></li></ol></section>
    <div class="reconstruction-layout">
      <main>
        <section class="profile-block"><span class="field-label">Design character</span><h2>What makes it recognizable</h2><p>${escapeHtml(site.designSummary)}</p></section>
        <section class="profile-block"><span class="field-label">Hero anatomy</span><h2>Rebuild the opening frame</h2><dl class="spec-ledger"><div><dt>Composition</dt><dd>${escapeHtml(spec.hero?.composition || site.layout)}</dd></div><div><dt>Primary module</dt><dd>${escapeHtml(spec.hero?.primary || "Not recorded")}</dd></div><div><dt>Secondary module</dt><dd>${escapeHtml(spec.hero?.secondary || "Not recorded")}</dd></div><div><dt>Minimum height</dt><dd>${escapeHtml(spec.frame?.heroHeight || "Content-led")}</dd></div></dl></section>
        <section class="profile-block"><span class="field-label">Page sequence</span><h2>Section order and rhythm</h2><ol class="section-sequence">${(spec.sections || []).map((item,index) => `<li><span>${String(index + 1).padStart(2,"0")}</span><strong>${escapeHtml(item)}</strong></li>`).join("")}</ol></section>
        <section class="profile-block"><span class="field-label">Agent build order</span><h2>Recreate it without copying blindly</h2><ol class="build-sequence">${(spec.buildSteps || []).map((item,index) => `<li><span>${String(index + 1).padStart(2,"0")}</span><p>${escapeHtml(item)}</p></li>`).join("")}</ol></section>
      </main>
      <aside class="reconstruction-side">
        <section><span class="field-label">Frame specification</span><dl class="frame-spec"><div><dt>Desktop shell</dt><dd>${escapeHtml(spec.frame?.desktop || "Not recorded")}</dd></div><div><dt>Content width</dt><dd>${escapeHtml(spec.frame?.content || "Not recorded")}</dd></div><div><dt>Responsive change</dt><dd>${escapeHtml(spec.frame?.breakpoint || "Not recorded")}</dd></div></dl></section>
        <section><span class="field-label">Color system</span><h2>${escapeHtml(site.theme)}</h2><div class="palette">${site.colors.map((color) => `<div class="swatch" style="background:${color.hex};color:${color.text || "#20211e"}"><span>${escapeHtml(color.name)}</span><code>${escapeHtml(color.hex)}</code></div>`).join("")}</div></section>
        <section><span class="field-label">Type roles</span><p class="type-role">${escapeHtml(site.typeface)}</p></section>
        <section><span class="field-label">Core components</span><ul class="component-list">${(spec.components || site.brandElements).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
        <section><span class="field-label">Source provenance</span><ul class="source-file-list">${(spec.sourceFiles || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      </aside>
    </div>
    <section class="responsive-spec"><div><span class="field-label">Verified mobile frame</span><h2>See what actually changes.</h2><p>${escapeHtml(site.caution)}</p><figure class="mobile-source-capture"><img src="${mobileCapturePath(site)}" alt="Actual mobile opening frame from ${escapeHtml(site.name)} at 390 by 844 pixels"><figcaption>Live source capture · 390 × 844</figcaption></figure></div><ol>${(spec.responsive || []).map((item,index) => `<li><span>${String(index + 1).padStart(2,"0")}</span><p>${escapeHtml(item)}</p></li>`).join("")}</ol></section>
  </article>`;
}

function renderPackets() {
  const activePacket = packets.find((packet) => packet.slug === currentPacket) || packets[0];
  view.innerHTML = `<div class="page">
    ${pageHead("02 / PATTERN PACKETS", "Reuse what already<br><em>worked.</em>", "A source-derived shelf of diagrams, hero utilities, and interactive modules lifted from WillyMLee.com, Signal Notes, and Crumb—then normalized for reuse.")}
    <section class="content-section">
      <div class="packet-grid">${packets.map((packet, index) => `<article class="packet-card ${packet.slug === currentPacket ? "is-active" : ""}" data-packet="${packet.slug}" tabindex="0"><div class="packet-card-top"><span>${String(index + 1).padStart(2,"0")}</span><small>${packet.family}</small></div><span class="packet-source">From ${packet.source}</span><h3>${packet.name}</h3><p>${packet.use}</p><dl><div><dt>Shows</dt><dd>${packet.shows}</dd></div><div><dt>Avoid for</dt><dd>${packet.avoid}</dd></div></dl></article>`).join("")}</div>
    </section>
    <section class="packet-layout">
      <div class="packet-stage" style="--packet-accent:${packetAccent}"><div class="packet-stage-head"><span class="field-label">Live module / ${activePacket.source}</span><strong>${activePacket.name}</strong><p>${activePacket.use}</p></div><div id="packet-preview"></div></div>
      <aside class="packet-controls">
        <span class="field-label">Module notes</span>
        <div class="control-group"><label>Pattern<select id="packet-type">${packets.map((packet) => `<option value="${packet.slug}" ${packet.slug === currentPacket ? "selected" : ""}>${packet.name}</option>`).join("")}</select></label></div>
        <div class="packet-origin"><span class="field-label">Observed in</span><a href="${activePacket.sourceUrl}" target="_blank" rel="noreferrer">${activePacket.source} ↗</a><p>This is a normalized implementation of a real pattern in the source site, not a fresh diagram invented for the Atlas.</p></div>
        <div class="packet-purpose"><span class="field-label">Communicates</span><p>${activePacket.shows}</p><span class="field-label">Do not use it for</span><p>${activePacket.avoid}</p></div>
        <div class="control-group"><span class="field-label">Accent</span><div class="color-options">${["#b44c36","#35697b","#5f7056","#d2a12a"].map((color) => `<button type="button" data-accent="${color}" class="${color === packetAccent ? "is-active" : ""}" style="--choice:${color}" aria-label="Use ${color}"></button>`).join("")}</div></div>
        <button class="button" id="copy-packet" type="button">Copy configuration</button>
        <a class="button secondary" href="https://github.com/WillyMLee/tooling-atlas/tree/main/modules" target="_blank" rel="noreferrer">View source ↗</a>
      </aside>
    </section>
  </div>`;
  renderPacketPreview();
}

function renderPacketPreview() {
  const target = document.querySelector("#packet-preview");
  if (!target) return;
  const options = structuredClone(packetOptions[currentPacket]);
  renderers[currentPacket](target, options);
}

function renderInteractions() {
  view.innerHTML = `<div class="page">
    ${pageHead("03 / INTERACTION PACKETS", "Motion with a job<br><em>to do.</em>", "Small interaction patterns that signal hierarchy, progress, or attention without turning a reference site into a demo reel.")}
    <section class="content-section">
      <div class="interaction-list">
        <article class="interaction-row" style="--preview:#ddd5ca"><span>01</span><div><h3>Center reveal</h3><p>A highlight expands from the middle of a row so discovery feels deliberate instead of directional.</p></div><div class="interaction-demo"><span class="field-label">Hover this row</span></div></article>
        <article class="interaction-row" style="--preview:#dce3dd"><span>02</span><div><h3>Progress rail</h3><p>A quiet line communicates reading or process progress while preserving the editorial rhythm.</p></div><div class="interaction-demo"><span class="demo-rail"></span></div></article>
        <article class="interaction-row" style="--preview:#ded8cb"><span>03</span><div><h3>Progressive stack</h3><p>Related items move by small offsets to expose sequence without relying on arrows or dense connectors.</p></div><div class="interaction-demo"><span class="demo-stack"><i></i><i></i><i></i></span></div></article>
        <article class="interaction-row" style="--preview:#e5ddd4"><span>04</span><div><h3>Semantic pulse</h3><p>A centered, slow pulse marks a live or detected object. Use it only when the state is genuinely active.</p></div><div class="interaction-demo"><span class="demo-pulse"></span></div></article>
      </div>
    </section>
  </div>`;
}

function renderSkillsIndex() {
  const phaseOrder = ["Route", "Prepare", "Execute", "Improve"];
  const phaseDescriptions = { Route: "Choose the lightest execution shape.", Prepare: "Bound context and define evidence.", Execute: "Run only the specialist method the task needs.", Improve: "Measure the result and revise the system." };
  const taskShapes = [
    ["Small + coupled", "Work directly", "No module is required when setup costs more than it saves."],
    ["Broad + many-source", "Orchestration + Context Budget", "Route first, then preserve a compact working set."],
    ["Large independent read set", "Orchestration + Batch Tool Calls", "Use batching only after independence and threshold checks pass."],
    ["Visible browser state", "Orchestration + Web Interaction Loop", "Give the browser module a target state and verification contract."],
  ];
  view.innerHTML = `<div class="page module-index-page">${pageHead("AGENT MODULES / ORCHESTRATION", "Start with the task shape.<br><em>Add only what helps.</em>", "Orchestration is the coordinator. Skills are optional specialists with explicit inputs, outputs, and evidence—not a stack that runs on every task.")}
    <section class="skill-flow"><div class="compact-section-head"><span class="field-label">How incorporation works</span><h2>One coordinator, optional specialists.</h2><p>Orchestration chooses the mode and keeps shared decisions. A specialist receives a bounded contract, returns one evidence packet, and hands control back for synthesis.</p></div><ol>${phaseOrder.map((phase,index) => `<li><span>0${index + 1}</span><div><strong>${phase}</strong><p>${phaseDescriptions[phase]}</p></div><div class="skill-flow-tags">${skills.filter((skill) => moduleFor(skill.slug).orchestration?.phase === phase).map((skill) => `<a href="#skill/${skill.slug}">${skill.name}</a>`).join("")}</div></li>`).join("")}</ol></section>
    <section class="task-shape-guide"><div class="compact-section-head"><span class="field-label">Choose by task shape</span><h2>Most tasks need zero to two modules.</h2></div><div>${taskShapes.map(([shape,choice,reason]) => `<article><span>${shape}</span><strong>${choice}</strong><p>${reason}</p></article>`).join("")}</div></section>
    <section class="module-truth is-compact"><strong>Evidence changes routing.</strong><span>Measured results can update the recommendation; reviewed, versioned edits update the reusable open-source skill.</span><a href="./control-tower.html">See decisions + evidence ↗</a></section>
    <section class="skill-phase-groups">${phaseOrder.map((phase) => `<section><header><span>${phase}</span><p>${phaseDescriptions[phase]}</p></header><div>${skills.filter((skill) => moduleFor(skill.slug).orchestration?.phase === phase).map((skill) => { const meta = moduleFor(skill.slug); return `<a class="skill-card is-compact" href="#skill/${skill.slug}"><div class="skill-card-top"><span>${meta.evidenceStatus || "Unmeasured"}</span><span>v${meta.version || "—"}</span></div><h2>${skill.name}</h2><p>${meta.orchestration?.role || skill.summary}</p><small>Open role + handoff →</small></a>`; }).join("")}</div></section>`).join("")}</section></div>`;
}

function renderSkillLegacy(skill) {
  if (!skill) return renderNotFound();
  const meta = moduleFor(skill.slug);
  const pilot = pilotSuite.modules.find((module) => module.slug === skill.slug);
  const summary = evalSummaries.find((item) => item.module === skill.slug);
  const observations = fieldTestFor(skill.slug);
  const routingSignal = dynamicRoutingSignal(skill.slug);
  const routingPolicy = meta.routingPolicy;
  const revision = meta.latestRevision;
  const cases = pilot?.cases || (meta.evalCases || []).map((item,index) => ({ id: `${skill.slug}-${index + 1}`, category: "planned", task: item, acceptance: [] }));
  view.innerHTML = `<article class="page">
    <header class="module-hero"><div><span class="eyebrow">AGENT MODULE / ${skill.status}</span><h1>${skill.name}</h1><p>${skill.summary}</p></div><aside><span class="field-label">One-line contract</span><strong>${skill.trigger}</strong><a href="https://github.com/WillyMLee/tooling-atlas/blob/main/${skill.sourcePath}" target="_blank" rel="noreferrer">Open source playbook ↗</a></aside></header>
    <section class="module-status-strip"><article><span>Package</span><strong>v${meta.version || "—"}</strong><small>${skill.status}</small></article><article><span>Evidence</span><strong>${meta.evidenceStatus || "Unmeasured"}</strong><small>${summary ? `${summary.pairedRuns}/${summary.requiredPairs} pairs · ${summary.decision}` : "No matched pairs"}</small></article><article><span>Primary metric</span><strong>${escapeHtml(meta.primaryMetric || "Not defined")}</strong><small>Quality must pass first</small></article><article><span>Field observations</span><strong>${observations.length}</strong><small>Qualified dogfood findings</small></article></section>
    ${routingPolicy ? `<section class="module-adaptive"><div><span class="field-label">Evidence-responsive routing</span><h2>${escapeHtml(routingSignal.label)}</h2><p>${escapeHtml(routingSignal.detail)} Atlas computes this signal from the currently loaded matched runs; it does not silently rewrite the skill.</p><div class="routing-rule-grid"><article><span>Current default</span><strong>${escapeHtml(routingPolicy.currentDefault)}</strong></article><article><span>Activate when</span><ul>${routingPolicy.activateWhen.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article><article><span>Stay direct when</span><ul>${routingPolicy.skipWhen.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article></div></div>${revision ? `<aside class="revision-note"><span>Open-source base updated</span><strong>v${escapeHtml(revision.version)} / ${escapeHtml(revision.date)}</strong><p>${escapeHtml(revision.change)}</p><code>${escapeHtml(revision.id)}</code><a href="${repoUrl(revision.baseFile)}" target="_blank" rel="noreferrer">Open canonical SKILL.md ↗</a><a href="${repoUrl(revision.evidenceFile)}" target="_blank" rel="noreferrer">Open evidence that caused it ↗</a></aside>` : ""}</section>` : ""}
    <section class="module-operating"><div><span class="field-label">Operating sequence</span><h2>What Codex actually does differently</h2><ol class="skill-sequence">${skill.steps.map(([title, detail]) => `<li><strong>${title}</strong><span>${detail}</span></li>`).join("")}</ol></div><aside><div><span class="field-label">Use when</span><p>${skill.trigger}</p></div><div><span class="field-label">Avoid when</span><p>${skill.avoid}</p></div><div><span class="field-label">Expected output</span><p>${skill.outcome}</p></div></aside></section>
    <section class="worked-example"><div><span class="field-label">Worked example</span><h2>Situation → method → useful output</h2></div><div class="worked-example-grid"><article><span>01 / Situation</span><p>${skill.example.scenario}</p></article><article><span>02 / Operating pattern</span><p>${skill.example.pattern}</p></article><article><span>03 / Useful output</span><p>${skill.example.deliverable}</p></article></div></section>
    <section class="module-test-lab"><div class="test-lab-heading"><div><span class="field-label">Test bench</span><h2>How this module can fail—and how we check it.</h2></div><p>${escapeHtml(meta.hypothesis || "A representative baseline and candidate still need to be defined.")}</p></div><div class="test-case-grid">${cases.map((test,index) => `<article><div><span>${String(index + 1).padStart(2,"0")}</span><em>${escapeHtml(test.category)}</em></div><h3>${escapeHtml(test.id.replaceAll("-", " "))}</h3><p>${escapeHtml(test.task)}</p>${test.acceptance?.length ? `<ul>${test.acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</article>`).join("")}</div></section>
    <section class="module-findings"><div class="findings-heading"><div><span class="field-label">Findings ledger</span><h2>What we have actually learned so far</h2></div><p>Field observations are direct dogfood evidence, but they are not matched performance comparisons. The distinction stays visible.</p></div>${observations.length ? `<div class="finding-grid">${observations.map((item) => `<article><div><span>${escapeHtml(item.status)}</span><em>${escapeHtml(item.confidence)}</em></div><h3>${escapeHtml(item.test)}</h3><dl><div><dt>Result</dt><dd>${escapeHtml(item.result)}</dd></div><div><dt>Finding</dt><dd>${escapeHtml(item.finding)}</dd></div><div><dt>Change</dt><dd>${escapeHtml(item.change)}</dd></div></dl></article>`).join("")}</div>` : `<div class="empty-finding"><strong>No field observation yet.</strong><p>This module still needs a real task trace before the Atlas can show a finding.</p></div>`}</section>
    <section class="module-evidence-board"><div><span class="field-label">Evaluation contract</span><h2>What would justify keeping it</h2><p>${escapeHtml(meta.hypothesis || "Not defined")}</p></div><dl><div><dt>Primary metric</dt><dd>${escapeHtml(meta.primaryMetric || "Not defined")}</dd></div><div><dt>Guardrails</dt><dd>${escapeHtml((meta.guardrailMetrics || []).join(" · "))}</dd></div><div><dt>Measured pairs</dt><dd>${summary ? `${summary.pairedRuns} of ${summary.requiredPairs}` : "0"}</dd></div><div><dt>Current decision</dt><dd>${escapeHtml(summary?.decision || "collect-more")}</dd></div>${summary?.pairedRuns ? `<div><dt>Run evidence</dt><dd><a href="https://github.com/WillyMLee/tooling-atlas/blob/main/evals/results/2026-08-15-agent-ab.md" target="_blank" rel="noreferrer">Open actual outputs + grading ↗</a></dd></div>` : ""}</dl></section>
    <section class="module-reference-grid"><article><span class="field-label">Safety boundaries</span><h2>Keep intact</h2><ul class="guardrail-list">${skill.safeguards.map((item) => `<li>${item}</li>`).join("")}</ul></article><article><span class="field-label">Success checks</span><h2>Measure the result</h2><ol class="measure-list">${skill.measures.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${item}</li>`).join("")}</ol></article><article><span class="field-label">Primary sources</span><h2>Read further</h2><ul class="source-list">${skill.sources.map(([label,url]) => `<li><a href="${url}" target="_blank" rel="noreferrer"><span>${label}</span><span>↗</span></a></li>`).join("")}</ul></article></section>
  </article>`;
}

function renderSkill(skill) {
  if (!skill) return renderNotFound();
  const meta = moduleFor(skill.slug);
  const pilot = pilotSuite.modules.find((module) => module.slug === skill.slug);
  const summary = evalSummaries.find((item) => item.module === skill.slug);
  const observations = fieldTestFor(skill.slug);
  const routingSignal = dynamicRoutingSignal(skill.slug);
  const routingPolicy = meta.routingPolicy;
  const revision = meta.latestRevision;
  const orchestration = meta.orchestration || {};
  const phaseOrder = ["Route", "Prepare", "Execute", "Improve"];
  const phaseDescriptions = { Route: "Choose mode", Prepare: "Bound the work", Execute: "Run specialist", Improve: "Measure + revise" };
  const cases = pilot?.cases || (meta.evalCases || []).map((item,index) => ({ id: `${skill.slug}-${index + 1}`, category: "planned", task: item, acceptance: [] }));
  const partnerLinks = (orchestration.partners || []).map((slug) => { const partner = skills.find((item) => item.slug === slug); return partner ? `<a href="#skill/${slug}">${escapeHtml(partner.name)}</a>` : ""; }).join("");
  const quickTitle = routingPolicy ? routingSignal.label : `Use it for ${orchestration.phase?.toLowerCase() || "specialist"} work`;
  const quickDetail = routingPolicy ? `${routingSignal.detail} The source guidance remains reviewed and versioned.` : orchestration.role;

  view.innerHTML = `<article class="page module-page is-simplified">
    <header class="module-brief"><div><span class="eyebrow">AGENT MODULE / ${escapeHtml(orchestration.phase || "Specialist")}</span><h1>${escapeHtml(skill.name)}</h1><p>${escapeHtml(skill.summary)}</p><a href="${repoUrl(skill.sourcePath)}" target="_blank" rel="noreferrer">Open canonical SKILL.md ↗</a></div><dl><div><dt>Package</dt><dd>v${escapeHtml(meta.version || "—")}</dd></div><div><dt>Evidence</dt><dd>${escapeHtml(meta.evidenceStatus || "Unmeasured")}</dd></div><div><dt>Matched pairs</dt><dd>${summary ? `${summary.pairedRuns}/${summary.requiredPairs}` : "0"}</dd></div></dl></header>
    <section class="module-decision-grid"><div><span class="field-label">Quick decision</span><h2>${escapeHtml(quickTitle)}</h2><p>${escapeHtml(quickDetail)}</p></div><dl><div><dt>Use when</dt><dd>${escapeHtml(skill.trigger)}</dd></div><div><dt>Skip when</dt><dd>${escapeHtml(skill.avoid)}</dd></div><div><dt>Returns</dt><dd>${escapeHtml(orchestration.handsOff || skill.outcome)}</dd></div></dl></section>
    <section class="module-orchestration"><div class="compact-section-head"><span class="field-label">Skill incorporation</span><h2>Where it enters the orchestration.</h2><p>The coordinator owns shared decisions and synthesis. This module receives one bounded contract, performs one role, and returns control.</p></div><ol class="orchestration-rail">${phaseOrder.map((phase,index) => `<li class="${orchestration.phase === phase ? "is-active" : ""}"><span>0${index + 1}</span><strong>${phase}</strong><small>${phaseDescriptions[phase]}</small>${orchestration.phase === phase ? `<em>${escapeHtml(skill.name)}</em>` : ""}</li>`).join("")}</ol><aside class="orchestration-contract"><div><span>Role</span><p>${escapeHtml(orchestration.role || skill.summary)}</p></div><div><span>Receives</span><p>${escapeHtml(orchestration.receives || skill.trigger)}</p></div><div><span>Hands back</span><p>${escapeHtml(orchestration.handsOff || skill.outcome)}</p></div><div><span>Usually paired with</span><p class="partner-links">${partnerLinks || "No required partner"}</p></div></aside></section>
    ${revision ? `<section class="module-revision-summary"><div><span class="field-label">Applied learning</span><h2>The open-source guidance changed.</h2><p>${escapeHtml(revision.change)}</p></div><dl><div><dt>Revision</dt><dd>${escapeHtml(revision.id)}</dd></div><div><dt>Version</dt><dd>v${escapeHtml(revision.version)} / ${escapeHtml(revision.date)}</dd></div><div><dt>Traceability</dt><dd><a href="${repoUrl(revision.baseFile)}" target="_blank" rel="noreferrer">Base file ↗</a><a href="${repoUrl(revision.evidenceFile)}" target="_blank" rel="noreferrer">Causing evidence ↗</a></dd></div></dl></section>` : ""}
    <section class="module-drawers">
      <details><summary><span>01</span><strong>Operating steps</strong><small>${skill.steps.length} steps</small></summary><ol class="drawer-steps">${skill.steps.map(([title,detail]) => `<li><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></li>`).join("")}</ol></details>
      <details><summary><span>02</span><strong>Tests + evidence</strong><small>${cases.length} cases · ${observations.length} field notes</small></summary><div class="drawer-evidence"><div><span class="field-label">Hypothesis</span><p>${escapeHtml(meta.hypothesis || "Not defined")}</p><dl><div><dt>Primary metric</dt><dd>${escapeHtml(meta.primaryMetric || "Not defined")}</dd></div><div><dt>Decision</dt><dd>${escapeHtml(summary?.decision || "collect-more")}</dd></div></dl></div><ol>${cases.map((test,index) => `<li><span>0${index + 1}</span><div><strong>${escapeHtml(test.id.replaceAll("-", " "))}</strong><p>${escapeHtml(test.task)}</p></div></li>`).join("")}</ol></div></details>
      <details><summary><span>03</span><strong>Safety + sources</strong><small>${skill.safeguards.length} guardrails · ${skill.sources.length} sources</small></summary><div class="drawer-safety"><ul>${skill.safeguards.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><ul>${skill.sources.map(([label,url]) => `<li><a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a></li>`).join("")}</ul></div></details>
    </section>
  </article>`;
}

function renderControlTowerLegacy() {
  const comparisons = moduleRegistry.map((module) => {
    const baseline = aggregateRun(module.slug, "baseline");
    const candidate = aggregateRun(module.slug, "candidate");
    return { module, baseline, candidate };
  }).filter((item) => item.baseline && item.candidate);
  const candidates = comparisons.map((item) => item.candidate);
  const successRate = averageKnown(candidates.map((run) => run.success)) || 0;
  const averageQuality = averageKnown(candidates.map((run) => run.qualityScore)) || 0;
  const averageCalls = averageKnown(candidates.map((run) => run.toolCalls));
  const totalCost = candidates.some((run) => run.estimatedCostUsd !== null) ? candidates.reduce((sum, run) => sum + (run.estimatedCostUsd || 0), 0) : null;
  const isMeasured = telemetryKind === "measured";
  const pilotCases = pilotSuite.modules.reduce((sum, module) => sum + module.cases.length, 0);
  const pairedRuns = evalSummaries.reduce((sum, summary) => sum + summary.pairedRuns, 0);
  const pairedExamples = [...new Set(telemetryRuns.map((run) => `${run.module}:${run.scenario}`))].map((key) => {
    const [module, scenario] = key.split(":");
    const runs = telemetryRuns.filter((run) => run.module === module && run.scenario === scenario);
    return { module, scenario, baseline: runs.find((run) => run.variant === "baseline"), candidate: runs.find((run) => run.variant === "candidate") };
  }).filter((pair) => pair.baseline && pair.candidate);

  view.innerHTML = `<div class="page control-tower-page">
    ${pageHead("CONTROL TOWER / EVIDENCE LAYER", "See what helps.<br><em>Retire what does not.</em>", "A quality-first measurement layer for agent modules, tool activity, latency, tokens, and estimated cost. The event contract is backend-neutral; ClickHouse is the durable analytics path.")}
    <section class="telemetry-notice ${isMeasured ? "is-measured" : ""}"><strong>${isMeasured ? "Measured pilot" : "Preview data only"}</strong><p>${escapeHtml(telemetryNotice)} ${isMeasured ? "These results come from scored pairs." : "The table below demonstrates the reading model; it is not performance evidence."} No ClickHouse connection is active.</p></section>
    <section class="control-summary">
      <article><span>Candidate success</span><strong>${(successRate * 100).toFixed(0)}%</strong><small>${isMeasured ? "Scored candidate runs" : "Example quality gate"}</small></article>
      <article><span>Average quality</span><strong>${averageQuality.toFixed(2)}</strong><small>Correctness · evidence · instruction · safety</small></article>
      <article><span>Average tool calls</span><strong>${averageCalls === null ? "—" : averageCalls.toFixed(1)}</strong><small>${isMeasured ? "Measured candidate runs" : "Example candidate runs"}</small></article>
      <article><span>Estimated cost</span><strong>${totalCost === null ? "—" : `$${totalCost.toFixed(2)}`}</strong><small>Unknown stays unknown—not $0</small></article>
    </section>
    ${isMeasured ? `<section class="measured-examples"><div class="section-heading"><div><span class="section-index">Measured run examples</span><h2>Open the actual A/B pairs</h2></div><p>Each card is one fresh baseline/candidate agent pair. The task and model class stayed fixed; only the named Atlas module instruction changed. Tokens and cost remain unknown when the runtime does not expose them.</p></div><div class="measured-example-grid">${pairedExamples.map((pair) => { const module = moduleFor(pair.module); const test = pilotSuite.modules.find((item) => item.slug === pair.module)?.cases.find((item) => item.id === pair.scenario); const callDelta = pair.candidate.toolCalls - pair.baseline.toolCalls; const timeDelta = pair.candidate.durationMs - pair.baseline.durationMs; const improved = pair.candidate.qualityScore >= pair.baseline.qualityScore && callDelta < 0; return `<article><div class="measured-example-head"><span>${escapeHtml(skills.find((skill) => skill.slug === pair.module)?.name || pair.module)}</span><em class="${improved ? "is-positive" : "is-negative"}">${improved ? "candidate leaner" : "no efficiency gain"}</em></div><h3>${escapeHtml(pair.scenario.replaceAll("-", " "))}</h3><p>${escapeHtml(test?.task || "Matched task")}</p><div class="ab-columns"><dl><div><dt>Baseline</dt><dd>${pair.baseline.toolCalls} calls · ${formatDuration(pair.baseline.durationMs)}</dd></div><div><dt>Candidate</dt><dd>${pair.candidate.toolCalls} calls · ${formatDuration(pair.candidate.durationMs)}</dd></div></dl><dl><div><dt>Call delta</dt><dd class="${callDelta < 0 ? "is-better" : callDelta > 0 ? "is-worse" : ""}">${callDelta > 0 ? "+" : ""}${callDelta}</dd></div><div><dt>Time delta</dt><dd class="${timeDelta < 0 ? "is-better" : timeDelta > 0 ? "is-worse" : ""}">${timeDelta > 0 ? "+" : ""}${formatDuration(timeDelta)}</dd></div></dl></div>${module.latestRevision ? `<p class="pair-policy-note"><strong>Base module updated in v${escapeHtml(module.latestRevision.version)}</strong><span>${escapeHtml(module.latestRevision.change)}</span><a href="${repoUrl(module.latestRevision.baseFile)}" target="_blank" rel="noreferrer">Inspect the applied guidance ↗</a></p>` : ""}<a href="https://github.com/WillyMLee/tooling-atlas/blob/main/evals/results/2026-08-15-agent-ab.md" target="_blank" rel="noreferrer">Read outputs + grading ↗</a></article>`; }).join("")}</div></section>` : ""}
    <section class="content-section">
      <div class="section-heading"><div><span class="section-index">01 / Module evidence</span><h2>Claims with a test attached</h2></div><p>Each module has a falsifiable hypothesis, one primary metric, quality guardrails, and representative cases.</p></div>
      <div class="tower-table-wrap"><table class="tower-table"><thead><tr><th>Module</th><th>Decision</th><th>Quality</th><th>Time</th><th>Tool calls</th><th>Cost</th></tr></thead><tbody>${comparisons.map(({ module, baseline, candidate }) => { const time = deltaCell(candidate, baseline, "durationMs"); const calls = deltaCell(candidate, baseline, "toolCalls"); const cost = deltaCell(candidate, baseline, "estimatedCostUsd"); const summary = evalSummaries.find((item) => item.module === module.slug); return `<tr><td><a href="./index.html#skill/${module.slug}"><strong>${escapeHtml(skills.find((skill) => skill.slug === module.slug)?.name || module.slug)}</strong><small>${escapeHtml(module.primaryMetric)}</small></a></td><td><span class="evidence-chip">${escapeHtml(summary?.decision || module.evidenceStatus)}</span></td><td>${signed((candidate.qualityScore - baseline.qualityScore) * 100, " pts")}</td><td class="${time.className}">${time.value}</td><td class="${calls.className}">${calls.value}</td><td class="${cost.className}">${cost.value}</td></tr>`; }).join("")}</tbody></table></div>
      <p class="tower-footnote">${isMeasured ? "Measured comparisons" : "Example comparisons"} use the same reading rule: positive quality is good; negative time, calls, and cost are good only after every quality gate passes.</p>
    </section>
    <section class="pilot-status">
      <div><span class="section-index">02 / Pilot readiness</span><h2>Nine stable situations.<br>Three modules first.</h2><p>The fixtures make repeat runs comparable. Each module has a common case, an edge case, and a known failure, with two replications required per case.</p></div>
      <dl><div><dt>Pilot modules</dt><dd>${pilotSuite.modules.length}</dd></div><div><dt>Stable scenarios</dt><dd>${pilotCases}</dd></div><div><dt>Measured pairs</dt><dd>${pairedRuns}</dd></div><div><dt>Quality floor</dt><dd>${pilotSuite.grading.qualityFloor ? `${Math.round(pilotSuite.grading.qualityFloor * 100)}%` : "—"}</dd></div></dl>
    </section>
    <section class="tower-architecture">
      <div><span class="section-index">03 / Event flow</span><h2>One contract, optional backends</h2><p>Codex hooks provide lifecycle and tool activity. API agents add usage and trace fields. Eval runners add deliberate attribution and grader results. Every source normalizes to the same versioned event before storage.</p><a class="text-link" href="https://github.com/WillyMLee/tooling-atlas/blob/main/docs/CONTROL_TOWER.md" target="_blank" rel="noreferrer">Read the architecture ↗</a></div>
      <ol class="tower-flow"><li><span>01</span><strong>Capture</strong><small>Hooks, traces, evals</small></li><li><span>02</span><strong>Normalize</strong><small>Privacy-minimal v1 event</small></li><li><span>03</span><strong>Store</strong><small>Local NDJSON or ClickHouse</small></li><li><span>04</span><strong>Compare</strong><small>Baseline vs candidate</small></li><li><span>05</span><strong>Decide</strong><small>Promote, revise, retire</small></li></ol>
    </section>
    <section class="content-section">
      <div class="section-heading"><div><span class="section-index">04 / Rollout</span><h2>Earn complexity gradually</h2></div><p>Start with two representative modules and local events. Add ClickHouse when retention and cross-project slicing justify operating a database.</p></div>
      <ol class="rollout-list"><li><span>Done</span><strong>Skills + registry</strong><p>Codex can discover six modules; every claim has a test contract.</p></li><li><span>Ready</span><strong>Privacy-minimal hooks</strong><p>Capture session, turn, workstream, and tool activity without storing content.</p></li><li><span>Measured</span><strong>Agent eval pilot</strong><p>Six real pairs now cover Batch Tool Calls and Context Budget; replicate 2 and the browser module remain.</p></li><li><span>Later</span><strong>ClickHouse</strong><p>Add durable analytics only when real event volume and cross-project questions justify it.</p></li></ol>
    </section>
  </div>`;
}

function renderControlTower() {
  const comparisons = moduleRegistry.map((module) => {
    const baseline = aggregateRun(module.slug, "baseline");
    const candidate = aggregateRun(module.slug, "candidate");
    return { module, baseline, candidate };
  }).filter((item) => item.baseline && item.candidate);
  const isMeasured = telemetryKind === "measured";
  const pairedExamples = [...new Set(telemetryRuns.map((run) => `${run.module}:${run.scenario}`))].map((key) => {
    const [module, scenario] = key.split(":");
    const runs = telemetryRuns.filter((run) => run.module === module && run.scenario === scenario);
    return { module, scenario, baseline: runs.find((run) => run.variant === "baseline"), candidate: runs.find((run) => run.variant === "candidate") };
  }).filter((pair) => pair.baseline && pair.candidate);
  const moduleGroups = comparisons.map(({ module }) => ({ module, pairs: pairedExamples.filter((pair) => pair.module === module.slug) }));
  const revisedCount = moduleRegistry.filter((module) => module.latestRevision).length;

  const pairCard = (pair) => {
    const test = pilotSuite.modules.find((item) => item.slug === pair.module)?.cases.find((item) => item.id === pair.scenario);
    const callDelta = pair.candidate.toolCalls - pair.baseline.toolCalls;
    const timeDelta = pair.candidate.durationMs - pair.baseline.durationMs;
    const improved = pair.candidate.qualityScore >= pair.baseline.qualityScore && callDelta < 0 && timeDelta < 0;
    return `<article class="pair-card-compact"><div><span>${escapeHtml(pair.scenario.replaceAll("-", " "))}</span><em class="${improved ? "is-positive" : "is-negative"}">${improved ? "leaner" : "overhead"}</em></div><p>${escapeHtml(test?.task || "Matched task")}</p><dl><div><dt>Baseline</dt><dd>${pair.baseline.toolCalls} calls / ${formatDuration(pair.baseline.durationMs)}</dd></div><div><dt>With skill</dt><dd>${pair.candidate.toolCalls} calls / ${formatDuration(pair.candidate.durationMs)}</dd></div><div><dt>Change</dt><dd class="${improved ? "is-better" : "is-worse"}">${callDelta > 0 ? "+" : ""}${callDelta} calls / ${timeDelta > 0 ? "+" : ""}${formatDuration(timeDelta)}</dd></div></dl></article>`;
  };

  view.innerHTML = `<div class="page control-tower-page is-simplified">
    <header class="tower-brief"><div><span class="eyebrow">CONTROL TOWER / DECISION VIEW</span><h1>What changed,<br>and why.</h1><p>Read the recommendation first. Open individual matched runs only when you need the evidence behind it.</p></div><dl><div><dt>Matched pairs</dt><dd>${pairedExamples.length}</dd></div><div><dt>Skills revised</dt><dd>${revisedCount}</dd></div><div><dt>Cost data</dt><dd>Unknown</dd></div></dl></header>
    <section class="telemetry-notice is-compact ${isMeasured ? "is-measured" : ""}"><strong>${isMeasured ? "Measured pilot" : "Preview data"}</strong><p>${escapeHtml(telemetryNotice)} Quality gates are evaluated before efficiency.</p></section>
    <section class="tower-reading-guide"><div class="compact-section-head"><span class="field-label">How to read this</span><h2>Recommendation → evidence → source update.</h2></div><ol><li><span>01</span><strong>Read the decision</strong><p>Is the skill on, off, or conditional for this task shape?</p></li><li><span>02</span><strong>Inspect matched pairs</strong><p>Baseline and candidate use the same task and quality gates.</p></li><li><span>03</span><strong>Trace the revision</strong><p>A reusable change links the eval to the canonical SKILL.md.</p></li></ol></section>
    <section class="tower-decisions"><div class="compact-section-head"><span class="field-label">Current decisions</span><h2>Two modules have measured routing guidance.</h2><p>These are pilot decisions, not universal claims.</p></div><div>${comparisons.map(({ module, baseline, candidate }) => { const signal = dynamicRoutingSignal(module.slug); const time = deltaCell(candidate, baseline, "durationMs"); const calls = deltaCell(candidate, baseline, "toolCalls"); return `<article><header><span>${escapeHtml(skills.find((skill) => skill.slug === module.slug)?.name || module.slug)}</span><em>${escapeHtml(evalSummaries.find((item) => item.module === module.slug)?.decision || "collect-more")}</em></header><h3>${escapeHtml(signal.label)}</h3><p>${escapeHtml(signal.detail)}</p><dl><div><dt>Average time</dt><dd class="${time.className}">${time.value}</dd></div><div><dt>Average calls</dt><dd class="${calls.className}">${calls.value}</dd></div><div><dt>Quality</dt><dd>Passed</dd></div></dl>${module.latestRevision ? `<footer><strong>Source guidance updated v${escapeHtml(module.latestRevision.version)}</strong><a href="./index.html#skill/${module.slug}">See role + applied change →</a></footer>` : ""}</article>`; }).join("")}</div></section>
    <section class="tower-pair-groups"><div class="compact-section-head"><span class="field-label">Matched evidence</span><h2>Open only the module you want to inspect.</h2></div>${moduleGroups.map(({ module, pairs }) => { const signal = dynamicRoutingSignal(module.slug); return `<details><summary><div><span>${escapeHtml(skills.find((skill) => skill.slug === module.slug)?.name || module.slug)}</span><strong>${escapeHtml(signal.label)}</strong></div><small>${pairs.length} matched pairs</small></summary><div class="pair-card-grid">${pairs.map(pairCard).join("")}</div><footer><a href="${repoUrl(module.latestRevision?.evidenceFile || "evals/results/2026-08-15-agent-ab.md")}" target="_blank" rel="noreferrer">Open outputs + grading ↗</a>${module.latestRevision ? `<a href="${repoUrl(module.latestRevision.baseFile)}" target="_blank" rel="noreferrer">Open applied SKILL.md ↗</a>` : ""}</footer></details>`; }).join("")}</section>
    <details class="tower-system-details"><summary><div><span>System details</span><strong>How capture, scoring, and storage work</strong></div><small>Open architecture</small></summary><div class="tower-system-grid"><section><span class="field-label">Evaluation contract</span><h2>Quality before efficiency.</h2><ol><li>Same task and model class</li><li>Correctness, evidence, instruction, safety</li><li>Then time, calls, tokens, and cost</li><li>Version the source only after review</li></ol></section><section><span class="field-label">Event path</span><h2>Backend-neutral by design.</h2><ol class="tower-flow compact"><li><span>01</span><strong>Capture</strong><small>Hooks + evals</small></li><li><span>02</span><strong>Normalize</strong><small>Privacy-minimal event</small></li><li><span>03</span><strong>Compare</strong><small>Baseline vs candidate</small></li><li><span>04</span><strong>Decide</strong><small>Keep, revise, retire</small></li></ol><a href="https://github.com/WillyMLee/tooling-atlas/blob/main/docs/CONTROL_TOWER.md" target="_blank" rel="noreferrer">Read full architecture ↗</a></section></div></details>
  </div>`;
}

function renderAbout() {
  view.innerHTML = `<div class="page">${pageHead("04 / ABOUT", "A shelf for the parts<br><em>worth keeping.</em>", "Tooling Atlas is an open working library assembled from real projects—not a gallery of finished taste or a universal design system.")}
    <section class="about-layout"><div><span class="field-label">Why it exists</span><h2>Experience should compound.</h2><p>When a layout, diagram, interaction, or workflow works, it should become easier to reach for next time. The Atlas records the decision behind the part, not just the surface.</p><p>The visual language borrows the calm editorial roles of the Personal Writing project: warm paper, clear type roles, numbered wayfinding, and restrained motion.</p><a class="text-link" href="https://github.com/WillyMLee/tooling-atlas" target="_blank" rel="noreferrer">Contribute on GitHub ↗</a></div>
    <ol class="about-ledger"><li><span>01</span><div><strong>Design profiles</strong><p>Observed systems summarized by theme, type, brand language, layout, and interaction.</p></div></li><li><span>02</span><div><strong>Diagram packets</strong><p>Reliable explanation shapes with reusable code and configurable content.</p></div></li><li><span>03</span><div><strong>Interaction packets</strong><p>Motion patterns tied to a clear semantic job and reduced-motion fallback.</p></div></li><li><span>04</span><div><strong>Agent modules</strong><p>Installable operating methods grounded in primary documentation and project experience.</p></div></li><li><span>05</span><div><strong>Control Tower</strong><p>Evidence contracts and telemetry that reveal whether a module improves quality, speed, or cost.</p></div></li></ol></section></div>`;
}

function renderNotFound() { view.innerHTML = `<section class="empty-state"><span class="eyebrow">ENTRY NOT FOUND</span><h1>That shelf is empty.</h1><a class="text-link" href="#overview">Return to overview →</a></section>`; }

function renderRoute() {
  const route = window.location.hash.slice(1) || "overview";
  if (route === "overview") renderOverview();
  else if (route === "packets") renderPackets();
  else if (route === "interactions") renderInteractions();
  else if (route === "skills") renderSkillsIndex();
  else if (route === "control-tower") renderControlTower();
  else if (route === "about") renderAbout();
  else if (route.startsWith("design/")) renderDesign(sites.find((site) => site.slug === route.split("/")[1]));
  else if (route.startsWith("skill/")) renderSkill(skills.find((skill) => skill.slug === route.split("/")[1]));
  else renderNotFound();
  document.querySelectorAll("[data-route-link]").forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${route}`));
  directory.classList.remove("is-open"); menuButton.setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}

document.addEventListener("click", async (event) => {
  const row = event.target.closest("[data-href]"); if (row) routeTo(row.dataset.href);
  const packetCard = event.target.closest("[data-packet]"); if (packetCard) { currentPacket = packetCard.dataset.packet; renderPackets(); }
  const accent = event.target.closest("[data-accent]"); if (accent) { packetAccent = accent.dataset.accent; document.querySelector(".packet-stage")?.style.setProperty("--packet-accent", packetAccent); document.querySelectorAll("[data-accent]").forEach((item) => item.classList.toggle("is-active", item === accent)); }
  if (event.target.closest("#copy-packet")) { const options = structuredClone(packetOptions[currentPacket]); await navigator.clipboard.writeText(JSON.stringify({ type: currentPacket, source: packets.find((packet) => packet.slug === currentPacket)?.source, accent: packetAccent, options }, null, 2)); showToast("Configuration copied"); }
});

document.addEventListener("keydown", (event) => { const target = event.target.closest?.("[data-href], [data-packet]"); if (target && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); target.click(); } });
document.addEventListener("change", (event) => { if (event.target.id === "packet-type") { currentPacket = event.target.value; renderPackets(); } });
window.addEventListener("hashchange", renderRoute);
menuButton.addEventListener("click", () => { const open = directory.classList.toggle("is-open"); menuButton.setAttribute("aria-expanded", String(open)); });
document.querySelector("#directory-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll("[data-search-item]").forEach((item) => { item.hidden = Boolean(query) && !item.dataset.searchItem.toLowerCase().includes(query); });
  document.querySelectorAll("[data-search-group]").forEach((group) => { group.hidden = Boolean(query) && !group.querySelector("[data-search-item]:not([hidden])"); });
});

Promise.all([fetch("./catalog/sites.json"), fetch("./catalog/module-registry.json"), fetch("./catalog/design-specs.json"), fetch("./observability/example-runs.json"), fetch("./observability/eval-summary.json"), fetch("./observability/field-tests.json"), fetch("./evals/pilot-suite.json")])
  .then(async (responses) => { if (responses.some((response) => !response.ok)) throw new Error("Atlas data request failed"); return Promise.all(responses.map((response) => response.json())); })
  .then(([sitePayload, modulePayload, designPayload, examplePayload, measuredPayload, fieldPayload, suitePayload]) => { sites = sitePayload.sites; moduleRegistry = modulePayload.modules; designSpecs = designPayload.profiles; fieldTests = fieldPayload.observations; pilotSuite = suitePayload; const telemetryPayload = measuredPayload.dataKind === "measured" && measuredPayload.runs.length ? measuredPayload : examplePayload; telemetryRuns = telemetryPayload.runs; telemetryNotice = telemetryPayload.notice; telemetryKind = telemetryPayload.dataKind; evalSummaries = measuredPayload.summaries || []; renderSidebar(); renderRoute(); })
  .catch(() => { sites = []; renderSidebar(); renderRoute(); showToast("Design catalog unavailable"); });
