import { renderFlow, renderSystemMap, renderMetricBridge, renderDecisionFork, renderEvidenceChain } from "./modules/diagram-kit.js";

const view = document.querySelector("#view");
const toast = document.querySelector("#toast");
const designLinks = document.querySelector("#design-links");
const skillLinks = document.querySelector("#skill-links");
const menuButton = document.querySelector("#menu-button");
const directory = document.querySelector("#directory");

const skills = [
  {
    slug: "context-budget", name: "Context Budget", status: "Experimental",
    summary: "Keep large tool output outside the active conversation, retrieve evidence narrowly, and preserve a compact project state for long tasks.",
    trigger: "Long-running repository work, heavy logs, broad web research, or repeated tool output.",
    avoid: "Short tasks where the complete source is already small and directly relevant.",
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
    slug: "batch-tool-calls", name: "Batch Tool Calls", status: "Ready",
    summary: "Group independent reads and lookups into bounded batches, then reduce results before deciding what happens next.",
    trigger: "Three or more independent queries, file reads, metadata lookups, or repeatable transformations.",
    avoid: "Dependent calls where each result changes the next decision, or any batch of consequential writes.",
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
  { slug: "flow", name: "Flow Stack", use: "A sequence where each step produces the input for the next.", shows: "How work moves", avoid: "Parallel or circular systems" },
  { slug: "system", name: "System Field", use: "A central product coordinating several actors, systems, or policy surfaces.", shows: "Who connects to the core", avoid: "Detailed chronological flows" },
  { slug: "metric", name: "Metric Bridge", use: "An operating change that compounds into a measurable business result.", shows: "Why an improvement matters", avoid: "Large KPI dashboards" },
  { slug: "decision", name: "Decision Fork", use: "A choice between credible paths with an explicit recommendation and tradeoffs.", shows: "What must be decided", avoid: "More than three options" },
  { slug: "evidence", name: "Evidence Chain", use: "A visible path from observed signal to interpretation, open question, and next test.", shows: "How the view was formed", avoid: "Private chain-of-thought" },
];

const packetOptions = {
  flow: {
    eyebrow: "Product path", title: "Signals become a usable operating view", direction: "vertical",
    steps: [
      { label: "Input", title: "Collect the evidence", detail: "Bring together the traces that describe the current state." },
      { label: "Model", title: "Create the context", detail: "Connect events, roles, rules, and exceptions." },
      { label: "Outcome", title: "Guide the next action", detail: "Expose a clear view that a person or agent can use.", tone: "accent" },
    ],
  },
  system: {
    eyebrow: "System relationship", title: "The product coordinates the working system",
    core: { label: "Core", title: "Control plane" },
    nodes: [
      { label: "Observe", title: "People", detail: "Behavior and roles" },
      { label: "Connect", title: "Systems", detail: "Events and state" },
      { label: "Govern", title: "Policy", detail: "Rules and evidence" },
      { label: "Execute", title: "Agents", detail: "Bounded action" },
    ],
  },
  metric: {
    eyebrow: "Value chain", title: "Operating improvement becomes economic value",
    metrics: [
      { value: "−28%", label: "Friction", title: "Cycle time", detail: "Less waiting and rework." },
      { value: "+19%", label: "Capacity", title: "Throughput", detail: "More cases per team." },
      { value: "$4.2M", label: "Outcome", title: "Annual value", detail: "Measured contribution." },
    ],
  },
  decision: {
    eyebrow: "Strategic choice", title: "Make the tradeoff legible", questionLabel: "Entry decision", question: "How should the team enter the market?",
    paths: [
      { label: "Path A", title: "Own the workflow", detail: "Build deeply around one painful operating process.", tradeoff: "More implementation · stronger position", recommended: true },
      { label: "Path B", title: "Embed in the suite", detail: "Integrate with an incumbent and inherit distribution.", tradeoff: "Faster access · less control" },
    ],
  },
  evidence: {
    eyebrow: "Working view", title: "Move from signal to a testable conclusion",
    steps: [
      { label: "Observe", title: "The signal", detail: "Start with a source, behavior, or measured change that another reader can inspect." },
      { label: "Interpret", title: "What it may mean", detail: "Connect the evidence to a market, product, or operating implication without overstating certainty." },
      { label: "Question", title: "What remains open", detail: "Name the unknown that could change the view." },
      { label: "Test", title: "What to watch next", detail: "Define the next observable proof point.", tone: "accent" },
    ],
  },
};

const renderers = { flow: renderFlow, system: renderSystemMap, metric: renderMetricBridge, decision: renderDecisionFork, evidence: renderEvidenceChain };
let sites = [];
let currentPacket = "flow";
let packetAccent = "#b44c36";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const showToast = (message) => { toast.textContent = message; toast.classList.add("is-visible"); window.setTimeout(() => toast.classList.remove("is-visible"), 1600); };
const routeTo = (hash) => { window.location.hash = hash; };
const pageHead = (kicker, title, description) => `<header class="page-head"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${description}</p></header>`;

function renderSidebar() {
  designLinks.innerHTML = sites.map((site, index) => `<a href="#design/${site.slug}" data-route-link data-search-item="${escapeHtml(`${site.name} ${site.type} ${site.theme}`)}">D${String(index + 1).padStart(2, "0")} <strong>${escapeHtml(site.name)}</strong></a>`).join("");
  skillLinks.innerHTML = `<a href="#skills" data-route-link data-search-item="all agent modules optimization skills">A00 <strong>All modules</strong></a>${skills.map((skill, index) => `<a href="#skill/${skill.slug}" data-route-link data-search-item="${escapeHtml(`${skill.name} ${skill.summary}`)}">A${String(index + 1).padStart(2, "0")} <strong>${escapeHtml(skill.name)}</strong></a>`).join("")}`;
  document.querySelector("#atlas-count").textContent = `${sites.length + packets.length + skills.length + 3} entries`;
}

function renderOverview() {
  const recent = sites.slice(0, 5);
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
      <div class="section-heading"><div><span class="section-index">01 / Recently cataloged</span><h2>Design gallery</h2></div><p>Open a reference sheet for the palette, type system, brand language, layout, and interaction choices behind each project.</p></div>
      <table class="entry-table"><thead><tr><th>No.</th><th>Design</th><th>Mode</th><th>Useful pattern</th></tr></thead><tbody>${recent.map((site, index) => `<tr data-href="#design/${site.slug}" tabindex="0"><td>${String(index + 1).padStart(2,"0")}</td><td><strong>${escapeHtml(site.name)}</strong></td><td><span class="type-chip">${escapeHtml(site.type)}</span></td><td class="table-muted">${escapeHtml(site.pattern)}</td></tr>`).join("")}</tbody></table>
    </section>
    <section class="content-section">
      <div class="section-heading"><div><span class="section-index">02 / Working packets</span><h2>Start from a proven shape</h2></div><p>Packets keep recurring interface work consistent while leaving the content, tone, and final judgment open.</p></div>
      <div class="overview-grid">
        <a class="overview-card" href="#packets"><span>D / 05</span><h3>Diagram packets</h3><p>Five code-native explanation patterns with a live configurator.</p><small>Open builder →</small></a>
        <a class="overview-card" href="#interactions"><span>I / 03</span><h3>Interaction packets</h3><p>Quiet motion patterns with timing, purpose, and reduced-motion behavior.</p><small>Inspect motion →</small></a>
        <a class="overview-card" href="#skills"><span>A / 06</span><h3>Agent modules</h3><p>Installable operating playbooks for context, tools, browsing, orchestration, and evals.</p><small>Review modules →</small></a>
      </div>
    </section>
  </div>`;
}

function renderDesign(site) {
  if (!site) return renderNotFound();
  view.innerHTML = `<article class="page">
    <header class="design-hero">
      <div><span class="eyebrow">DESIGN PROFILE / ${escapeHtml(site.type)}</span><h1>${escapeHtml(site.name)}</h1><p class="lede">${escapeHtml(site.summary)}</p></div>
      <dl class="design-meta"><div><dt>Theme</dt><dd>${escapeHtml(site.theme)}</dd></div><div><dt>Typeface</dt><dd>${escapeHtml(site.typeface)}</dd></div><div><dt>State</dt><dd>Observed pattern</dd></div><div><dt>Project</dt><dd><a href="${site.url}" target="_blank" rel="noreferrer">Open live site ↗</a></dd></div></dl>
    </header>
    <div class="profile-layout">
      <div class="profile-main">
        <section class="profile-block"><span class="field-label">Design summary</span><h2>What gives it its character</h2><p>${escapeHtml(site.designSummary)}</p></section>
        <section class="profile-block"><span class="field-label">System notes</span><h2>Reusable decisions</h2><ul class="attribute-list">
          <li><strong>Brand language</strong><span>${escapeHtml(site.brandElements.join(" · "))}</span></li>
          <li><strong>Layout</strong><span>${escapeHtml(site.layout)}</span></li>
          <li><strong>Interaction</strong><span>${escapeHtml(site.interactions)}</span></li>
          <li><strong>Best reused for</strong><span>${escapeHtml(site.pattern)}</span></li>
          <li><strong>Watch for</strong><span>${escapeHtml(site.caution)}</span></li>
        </ul></section>
      </div>
      <aside class="profile-side">
        <span class="field-label">Color system</span><h2>${escapeHtml(site.theme)}</h2>
        <div class="palette">${site.colors.map((color) => `<div class="swatch" style="background:${color.hex};color:${color.text || "#20211e"}"><span>${escapeHtml(color.name)}</span><code>${escapeHtml(color.hex)}</code></div>`).join("")}</div>
        <div class="type-specimen"><span class="field-label">Typeface</span><p>${escapeHtml(site.typeface)}</p></div>
        <div class="tag-list">${site.brandElements.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      </aside>
    </div>
  </article>`;
}

function renderPackets() {
  view.innerHTML = `<div class="page">
    ${pageHead("02 / DIAGRAM PACKETS", "Explain the system.<br><em>Keep the seams visible.</em>", "Code-native diagrams for recurring website explanations. Choose a shape, tune its direction and accent, then copy a stable configuration.")}
    <section class="content-section">
      <div class="packet-grid">${packets.map((packet, index) => `<article class="packet-card ${packet.slug === currentPacket ? "is-active" : ""}" data-packet="${packet.slug}" tabindex="0"><div class="packet-card-top"><span>${String(index + 1).padStart(2,"0")}</span><small>${packet.shows}</small></div><h3>${packet.name}</h3><p>${packet.use}</p><dl><div><dt>Best for</dt><dd>${packet.shows}</dd></div><div><dt>Avoid for</dt><dd>${packet.avoid}</dd></div></dl></article>`).join("")}</div>
    </section>
    <section class="packet-layout">
      <div class="packet-stage" style="--packet-accent:${packetAccent}"><div class="packet-stage-head"><span class="field-label">Live packet</span><strong>${packets.find((packet) => packet.slug === currentPacket).shows}</strong><p>${packets.find((packet) => packet.slug === currentPacket).use}</p></div><div id="packet-preview"></div></div>
      <aside class="packet-controls">
        <span class="field-label">Packet controls</span>
        <div class="control-group"><label>Diagram type<select id="packet-type">${packets.map((packet) => `<option value="${packet.slug}" ${packet.slug === currentPacket ? "selected" : ""}>${packet.name}</option>`).join("")}</select></label></div>
        <div class="control-group" ${currentPacket === "flow" ? "" : "hidden"}><label>Flow direction<select id="packet-direction"><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select></label></div>
        <div class="packet-purpose"><span class="field-label">What it does</span><p>${packets.find((packet) => packet.slug === currentPacket).shows}</p><span class="field-label">Do not use it for</span><p>${packets.find((packet) => packet.slug === currentPacket).avoid}</p></div>
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
  if (currentPacket === "flow") options.direction = document.querySelector("#packet-direction")?.value || options.direction;
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
  view.innerHTML = `<div class="page">${pageHead("AGENT MODULES / WORKING SET", "Choose the operating method<br><em>before adding complexity.</em>", "Installable playbooks for recurring agent failure modes. Each module explains when it should trigger, when it should not, the operating sequence, an example, and how improvement is measured.")}
    <section class="content-section"><div class="skill-grid">${skills.map((skill, index) => `<a class="skill-card" href="#skill/${skill.slug}"><div class="skill-card-top"><span>A${String(index+1).padStart(2,"0")}</span><span>${skill.status}</span></div><h2>${skill.name}</h2><p>${skill.summary}</p><dl><div><dt>Use when</dt><dd>${skill.trigger}</dd></div><div><dt>Result</dt><dd>${skill.outcome}</dd></div></dl><span>Open playbook →</span></a>`).join("")}</div></section></div>`;
}

function renderSkill(skill) {
  if (!skill) return renderNotFound();
  view.innerHTML = `<article class="page">
    <header class="design-hero skill-hero"><div><span class="eyebrow">AGENT MODULE / ${skill.status}</span><h1>${skill.name}</h1><p class="lede">${skill.summary}</p></div><dl class="design-meta"><div><dt>Use when</dt><dd>${skill.trigger}</dd></div><div><dt>Avoid when</dt><dd>${skill.avoid}</dd></div><div><dt>Outcome</dt><dd>${skill.outcome}</dd></div><div><dt>Source</dt><dd><a href="https://github.com/WillyMLee/tooling-atlas/blob/main/${skill.sourcePath}" target="_blank" rel="noreferrer">Open SKILL.md ↗</a></dd></div></dl></header>
    <div class="skill-detail-layout"><div class="skill-main"><section class="profile-block"><span class="field-label">Operating sequence</span><h2>How the module runs</h2><ol class="skill-sequence">${skill.steps.map(([title, detail]) => `<li><strong>${title}</strong><span>${detail}</span></li>`).join("")}</ol></section>
    <section class="profile-block"><span class="field-label">Worked example</span><h2>What changes in practice</h2><div class="skill-example"><div><small>Situation</small><p>${skill.example.scenario}</p></div><div><small>Operating pattern</small><p>${skill.example.pattern}</p></div><div><small>Useful output</small><p>${skill.example.deliverable}</p></div></div></section></div>
    <aside class="skill-side"><section><span class="field-label">Safety boundaries</span><h2>Keep intact</h2><ul class="guardrail-list">${skill.safeguards.map((item) => `<li>${item}</li>`).join("")}</ul></section><section><span class="field-label">Measure the result</span><h2>Success checks</h2><ol class="measure-list">${skill.measures.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${item}</li>`).join("")}</ol></section><section><span class="field-label">Primary sources</span><ul class="source-list">${skill.sources.map(([label,url]) => `<li><a href="${url}" target="_blank" rel="noreferrer"><span>${label}</span><span>↗</span></a></li>`).join("")}</ul></section></aside></div>
  </article>`;
}

function renderAbout() {
  view.innerHTML = `<div class="page">${pageHead("04 / ABOUT", "A shelf for the parts<br><em>worth keeping.</em>", "Tooling Atlas is an open working library assembled from real projects—not a gallery of finished taste or a universal design system.")}
    <section class="about-layout"><div><span class="field-label">Why it exists</span><h2>Experience should compound.</h2><p>When a layout, diagram, interaction, or workflow works, it should become easier to reach for next time. The Atlas records the decision behind the part, not just the surface.</p><p>The visual language borrows the calm editorial roles of the Personal Writing project: warm paper, clear type roles, numbered wayfinding, and restrained motion.</p><a class="text-link" href="https://github.com/WillyMLee/tooling-atlas" target="_blank" rel="noreferrer">Contribute on GitHub ↗</a></div>
    <ol class="about-ledger"><li><span>01</span><div><strong>Design profiles</strong><p>Observed systems summarized by theme, type, brand language, layout, and interaction.</p></div></li><li><span>02</span><div><strong>Diagram packets</strong><p>Reliable explanation shapes with reusable code and configurable content.</p></div></li><li><span>03</span><div><strong>Interaction packets</strong><p>Motion patterns tied to a clear semantic job and reduced-motion fallback.</p></div></li><li><span>04</span><div><strong>Agent modules</strong><p>Installable operating methods grounded in primary documentation and project experience.</p></div></li></ol></section></div>`;
}

function renderNotFound() { view.innerHTML = `<section class="empty-state"><span class="eyebrow">ENTRY NOT FOUND</span><h1>That shelf is empty.</h1><a class="text-link" href="#overview">Return to overview →</a></section>`; }

function renderRoute() {
  const route = window.location.hash.slice(1) || "overview";
  if (route === "overview") renderOverview();
  else if (route === "packets") renderPackets();
  else if (route === "interactions") renderInteractions();
  else if (route === "skills") renderSkillsIndex();
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
  if (event.target.closest("#copy-packet")) { const options = structuredClone(packetOptions[currentPacket]); if (currentPacket === "flow") options.direction = document.querySelector("#packet-direction")?.value || options.direction; await navigator.clipboard.writeText(JSON.stringify({ type: currentPacket, accent: packetAccent, options }, null, 2)); showToast("Configuration copied"); }
});

document.addEventListener("keydown", (event) => { const target = event.target.closest?.("[data-href], [data-packet]"); if (target && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); target.click(); } });
document.addEventListener("change", (event) => { if (event.target.id === "packet-type") { currentPacket = event.target.value; renderPackets(); } if (event.target.id === "packet-direction") renderPacketPreview(); });
window.addEventListener("hashchange", renderRoute);
menuButton.addEventListener("click", () => { const open = directory.classList.toggle("is-open"); menuButton.setAttribute("aria-expanded", String(open)); });
document.querySelector("#directory-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll("[data-search-item]").forEach((item) => { item.hidden = Boolean(query) && !item.dataset.searchItem.toLowerCase().includes(query); });
  document.querySelectorAll("[data-search-group]").forEach((group) => { group.hidden = Boolean(query) && !group.querySelector("[data-search-item]:not([hidden])"); });
});

fetch("./catalog/sites.json")
  .then((response) => { if (!response.ok) throw new Error("Catalog request failed"); return response.json(); })
  .then((payload) => { sites = payload.sites; renderSidebar(); renderRoute(); })
  .catch(() => { sites = []; renderSidebar(); renderRoute(); showToast("Design catalog unavailable"); });
