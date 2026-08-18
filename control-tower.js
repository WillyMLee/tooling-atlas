const root = document.querySelector("#control-tower-root");
const escapeHtml = (value = "") => String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const percent = (value) => value == null ? "Unknown" : `${value > 0 ? "+" : ""}${value}%`;
const dateTime = (value) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const titleCase = (value) => String(value).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const agentImpact = (summary) => {
  if (!summary || !summary.pairedRuns || summary.primaryImprovementPercent == null) return "No real agent A/B yet";
  const direction = summary.primaryImprovementPercent > 0 ? "improvement" : summary.primaryImprovementPercent < 0 ? "regression" : "no change";
  return `${Math.abs(summary.primaryImprovementPercent)}% ${direction} · ${summary.pairedRuns}/${summary.requiredPairs} pairs`;
};

const fetchJson = async (path) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
};

const render = ({ registry, health, modules, agentEval, policyEval, activity, backlog }) => {
  const healthBySlug = new Map(health.checks.map((item) => [item.slug, item]));
  const agentPairs = agentEval.runs.length / 2;
  const policyPairs = policyEval.runs.length / 2;
  const active = backlog.items.filter((item) => item.status === "active");
  const later = backlog.items.filter((item) => item.status === "later");
  const moduleName = (slug) => modules.modules.find((item) => item.slug === slug)?.slug.replaceAll("-", " ") || slug;
  const activityBySlug = new Map(activity.modules.map((item) => [item.slug, item]));
  const agentBySlug = new Map(agentEval.summaries.map((item) => [item.module, item]));
  const policyBySlug = new Map(policyEval.summaries.map((item) => [item.module, item]));
  const integration = activity.systemIntegration || {};
  const status = (ready) => ready ? "Ready" : "Needs setup";
  const metricCoverage = [
    ["Quality", "Available", `${policyEval.runs.length} policy runs + ${agentEval.runs.length} agent runs`],
    ["Latency", "Partial", `${agentEval.runs.filter((run) => run.durationMs != null).length} agent runs + ${health.checks.length} site checks`],
    ["Tool calls", "Partial", `${agentEval.runs.filter((run) => run.toolCalls != null).length} agent runs`],
    ["Retries", "Partial", `${policyEval.runs.filter((run) => run.retryCount > 0).length} policy runs report retries`],
    ["Tokens", "Missing", "Collector supports the fields; no measured values yet"],
    ["Estimated cost", "Missing", "Never inferred when provider usage is unavailable"]
  ];

  root.innerHTML = `
    <main class="ct-page">
      <header class="ct-hero" id="overview">
        <div><span class="ct-kicker">CONTROL TOWER / OPERATIONS</span><h1>Monitor what<br>matters.</h1><p>One quiet view for skill availability, routed usage, measured evidence, website health, and the work still queued.</p></div>
        <div class="ct-summary" aria-label="Current status">
          <article><span>Atlas skills installed</span><strong>${activity.installation.installed}/${activity.installation.registered}</strong><small>Available to local Codex tasks</small></article>
          <article><span>Recorded route outcomes</span><strong>${activity.routes.outcomes}/${activity.routes.decisions}</strong><small>${activity.routes.qualityPassed} passed their task quality gate</small></article>
          <article><span>Agent A/B pairs</span><strong>${agentPairs}</strong><small>${policyPairs} policy pairs remain separate</small></article>
          <article><span>Cost coverage</span><strong>None</strong><small>Displayed as unknown, never estimated</small></article>
        </div>
      </header>

      <nav class="ct-jump" aria-label="Control Tower sections">
        <a href="#skills">Skills</a><a href="#sites">Sites</a><a href="#routing">Routing</a><a href="#evals">Evaluations</a><a href="#metrics">Metrics</a><a href="#backlog">Backlog</a>
      </nav>

      <section class="ct-section ct-skills" id="skills">
        <div class="ct-section-head"><div><span>01 / Skill status</span><h2>Installed is not<br>the same as active.</h2></div><p>The tally separates availability, recorded selection, completed routes, and measured A/B impact. That prevents a loaded skill from receiving credit for work it did not cause.</p></div>
        <div class="ct-system-chain" aria-label="Codex-wide Atlas integration">
          <article class="${integration.skillsDiscoverable ? "is-ready" : ""}"><span>01 / Discover</span><strong>${status(integration.skillsDiscoverable)}</strong><p>${activity.installation.installed}/${activity.installation.registered} skills in the user-level library, available to local Codex tasks.</p></article>
          <article class="${integration.globalRoutingConfigured ? "is-ready" : ""}"><span>02 / Route</span><strong>${status(integration.globalRoutingConfigured)}</strong><p>Global guidance selects one clear specialist or asks Smart Skills Router to resolve ambiguity.</p></article>
          <article class="${integration.lifecycleCaptureConfigured ? "is-ready" : ""}"><span>03 / Observe</span><strong>${integration.lifecycleCaptureConfigured ? "Configured" : "Needs setup"}</strong><p>${integration.configuredHookEvents || 0}/${integration.expectedHookEvents || 9} lifecycle events configured. Trust is reviewed separately in Codex.</p></article>
        </div>
        <p class="ct-system-note">Build-time local status · Scope: this user’s Codex desktop, CLI, and IDE tasks · Hook trust: review with <code>/hooks</code></p>
        <div class="ct-skill-legend"><article><b>Installed</b><p>The skill package exists in your local Codex skill directory.</p></article><article><b>Selected</b><p>The router assigned it before a recorded task began.</p></article><article><b>Measured</b><p>A baseline/candidate comparison exists and passed its quality gate.</p></article></div>
        <div class="ct-current-route">
          <div><span>Latest routed selection</span><strong>${activity.lastSelection.selected.length ? activity.lastSelection.selected.map(titleCase).join(" + ") : "Direct work"}</strong><small>${escapeHtml(activity.lastSelection.taskShape)} · ${escapeHtml(activity.lastSelection.routingMode)} · snapshot ${dateTime(activity.generatedAt)}</small></div>
          <dl><div><dt>Decisions</dt><dd>${activity.routes.decisions}</dd></div><div><dt>Outcomes</dt><dd>${activity.routes.outcomes}</dd></div><div><dt>Open records</dt><dd>${activity.routes.open}</dd></div></dl>
        </div>
        <div class="ct-skill-grid">${modules.modules.map((module) => {
          const usage = activityBySlug.get(module.slug) || { installed: false, selectedRoutes: 0, completedRoutes: 0, qualityPassedRoutes: 0 };
          const agent = agentBySlug.get(module.slug);
          const policy = policyBySlug.get(module.slug);
          const evidenceClass = agent?.pairedRuns ? (agent.primaryImprovementPercent < 0 ? "is-regression" : "is-measured") : policy ? "is-policy" : "is-unmeasured";
          return `<article class="ct-skill-card ${evidenceClass}">
            <header><span class="${usage.installed ? "is-installed" : ""}"><i></i>${usage.installed ? "Installed" : "Not linked"}</span><em>${escapeHtml(module.orchestration.phase)}</em></header>
            <h3>${escapeHtml(titleCase(module.slug))}</h3>
            <p>${escapeHtml(module.routingPolicy?.currentDefault || module.orchestration.role)}</p>
            <dl><div><dt>Selected</dt><dd>${usage.selectedRoutes} route${usage.selectedRoutes === 1 ? "" : "s"}</dd></div><div><dt>Completed</dt><dd>${usage.completedRoutes}</dd></div><div><dt>Quality passed</dt><dd>${usage.qualityPassedRoutes}</dd></div></dl>
            <div class="ct-impact"><span>Real agent evidence</span><strong>${escapeHtml(agentImpact(agent))}</strong><small>${escapeHtml(agent?.primaryMetric || "Trial not assigned")}</small></div>
            <footer>${policy ? `<span>Policy proxy</span><strong>${percent(policy.primaryImprovementPercent)} · ${escapeHtml(policy.primaryMetric)}</strong>` : `<span>Policy proxy</span><strong>Not yet measured</strong>`}</footer>
          </article>`;
        }).join("")}</div>
        <p class="ct-data-note">${escapeHtml(activity.notice)} Tokens and billed cost remain unknown; the dashboard does not infer them.</p>
      </section>

      <section class="ct-section" id="sites">
        <div class="ct-section-head"><div><span>02 / Website registry</span><h2>Every live surface,<br>in one ledger.</h2></div><p>${health.notice}</p></div>
        <div class="ct-site-tools"><label>Filter sites<input id="site-filter" type="search" placeholder="Name, category, hosting..." autocomplete="off"></label><span>${registry.sites.length} registered</span></div>
        <div class="ct-site-list" id="site-list">${registry.sites.map((site) => {
          const check = healthBySlug.get(site.slug);
          return `<article data-site-search="${escapeHtml(`${site.name} ${site.category} ${site.hosting} ${site.purpose}`.toLowerCase())}">
            <div class="ct-health is-${escapeHtml(check?.status || "unknown")}"><i></i><span>${escapeHtml(check?.status || "unknown")}</span></div>
            <div><strong>${escapeHtml(site.name)}</strong><p>${escapeHtml(site.purpose)}</p></div>
            <dl><div><dt>Category</dt><dd>${escapeHtml(site.category)}</dd></div><div><dt>Hosting</dt><dd>${escapeHtml(site.hosting)}</dd></div><div><dt>Latency</dt><dd>${check?.latencyMs == null ? "Unknown" : `${check.latencyMs} ms`}</dd></div></dl>
            <a href="${escapeHtml(site.url)}" target="_blank" rel="noreferrer">Open site <span aria-hidden="true">↗</span></a>
          </article>`;
        }).join("")}</div><p class="ct-site-empty" id="site-empty" hidden>No registered site matches this filter.</p>
      </section>

      <section class="ct-section ct-routing" id="routing">
        <div class="ct-section-head"><div><span>03 / Routing telemetry</span><h2>Decision first.<br>Outcome second.</h2></div><p>Meaningful routes now produce a local event pair. Content stays private; the record keeps only categorical operating metadata.</p></div>
        <ol class="ct-route-flow"><li><span>01</span><strong>Classify task shape</strong><small>scope, source count, work shape</small></li><li><span>02</span><strong>Record decision</strong><small>selected, skipped, routing mode</small></li><li><span>03</span><strong>Execute work</strong><small>normal task tools and evidence</small></li><li><span>04</span><strong>Record outcome</strong><small>completed, blocked, failed, rerouted</small></li></ol>
        <div class="ct-routing-contract"><article><span>Recorded</span><p>Route ID, task-shape category, selected and skipped skills, outcome, quality-gate result, retries.</p></article><article><span>Never recorded</span><p>Prompts, messages, tool arguments, tool output, credentials, file contents, or private page data.</p></article><article><span>Current state</span><p>Schema v2 and route-pair test are implemented. Local NDJSON remains private until explicitly aggregated.</p></article></div>
      </section>

      <section class="ct-section" id="evals">
        <div class="ct-section-head"><div><span>04 / Evaluation evidence</span><h2>Two kinds of evidence,<br>kept separate.</h2></div><p>Policy fixtures test decision logic cheaply. Real agent pairs test whether instructions help in actual work. Neither is presented as universal proof.</p></div>
        <div class="ct-eval-label"><strong>Policy-level A/B</strong><span>${policyPairs} matched pairs · deterministic fixtures</span></div>
        <div class="ct-eval-grid">${policyEval.summaries.map((summary) => `<article><header><span>${escapeHtml(moduleName(summary.module))}</span><em>${escapeHtml(summary.decision)}</em></header><strong>${Math.round(summary.candidateQuality * 100)}%</strong><p>candidate quality pass rate</p><dl><div><dt>Baseline quality</dt><dd>${Math.round(summary.baselineQuality * 100)}%</dd></div><div><dt>Primary metric</dt><dd>${percent(summary.primaryImprovementPercent)}</dd></div><div><dt>Cases</dt><dd>${summary.cases}</dd></div></dl></article>`).join("")}</div>
        <div class="ct-eval-label"><strong>Real agent pilot</strong><span>${agentPairs} matched pairs · observed tasks</span></div>
        <div class="ct-agent-eval-list">${agentEval.summaries.map((summary) => `<article><div><strong>${escapeHtml(moduleName(summary.module))}</strong><span>${summary.pairedRuns}/${summary.requiredPairs} pairs</span></div><p>${escapeHtml(summary.primaryMetric)}</p><em>${escapeHtml(summary.decision)}</em></article>`).join("")}</div>
      </section>

      <section class="ct-section ct-metrics" id="metrics">
        <div class="ct-section-head"><div><span>05 / Metric coverage</span><h2>Unknown stays<br>unknown.</h2></div><p>Efficiency is considered only after task success, evidence, instruction adherence, safety, and reliability pass.</p></div>
        <div class="ct-metric-grid">${metricCoverage.map(([name, status, detail]) => `<article class="is-${status.toLowerCase()}"><span>${escapeHtml(status)}</span><strong>${escapeHtml(name)}</strong><p>${escapeHtml(detail)}</p></article>`).join("")}</div>
      </section>

      <section class="ct-section" id="backlog">
        <div class="ct-section-head"><div><span>06 / Strategic backlog</span><h2>Six active.<br>Six deliberately later.</h2></div><p>The queue remains visible without competing with the current optimization work.</p></div>
        <div class="ct-backlog"><div><span>Optimizing now</span>${active.map((item) => `<article><b>${String(item.id).padStart(2, "0")}</b><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.outcome)}</p></div></article>`).join("")}</div><div class="is-later"><span>Keep track of</span>${later.map((item) => `<article><b>${String(item.id).padStart(2, "0")}</b><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.outcome)}</p></div></article>`).join("")}</div></div>
      </section>
    </main>`;

  const filter = document.querySelector("#site-filter");
  filter.addEventListener("input", () => {
    const query = filter.value.trim().toLowerCase();
    const items = [...document.querySelectorAll("[data-site-search]")];
    items.forEach((item) => { item.hidden = Boolean(query) && !item.dataset.siteSearch.includes(query); });
    document.querySelector("#site-empty").hidden = items.some((item) => !item.hidden);
  });
};

Promise.all([
  fetchJson("./catalog/product-registry.json"),
  fetchJson("./observability/site-health.json"),
  fetchJson("./catalog/module-registry.json"),
  fetchJson("./observability/eval-summary.json"),
  fetchJson("./observability/strategic-ab-summary.json"),
  fetchJson("./observability/activity-summary.json"),
  fetchJson("./catalog/strategic-backlog.json")
]).then(([registry, health, modules, agentEval, policyEval, activity, backlog]) => render({ registry, health, modules, agentEval, policyEval, activity, backlog }))
  .catch((error) => { root.innerHTML = `<main class="ct-error"><span>CONTROL TOWER ERROR</span><h1>Monitoring data could not load.</h1><p>${escapeHtml(error.message)}</p></main>`; });
