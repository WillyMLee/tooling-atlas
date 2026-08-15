const html = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

const mount = (target, markup) => {
  if (!(target instanceof Element)) throw new TypeError("Diagram Kit needs a valid target element.");
  target.innerHTML = markup;
  return target.firstElementChild;
};

const shell = ({ type, source, title, body }) => `
  <figure class="ia-module ia-${type}" data-ia-module="${type}">
    <figcaption class="ia-module-bar"><span>${html(source)}</span><strong>${html(title)}</strong></figcaption>
    ${body}
  </figure>`;

export function renderLiveProcess(target, options = {}) {
  const steps = options.steps || [];
  return mount(target, shell({
    type: "live-process", source: options.source || "WillyMLee.com", title: options.title || "Live process",
    body: `<div class="ia-live-head"><span><i aria-hidden="true"></i>${html(options.label || "Current activity")}</span><small>${html(options.status || "Live")}</small></div>
      <ol class="ia-live-chain">${steps.map((step, index) => `<li style="--ia-delay:${index * 420}ms">
        <span>${index + 1}</span><strong>${html(step)}</strong>${index < steps.length - 1 ? `<i aria-hidden="true"><b></b></i>` : ""}
      </li>`).join("")}</ol>`,
  }));
}

const workflowMarkup = (workflow = {}) => `<div class="ia-product-copy"><small>${html(workflow.label || "Product")}</small><h3>${html(workflow.title || "Product workflow")}</h3><p>${html(workflow.detail || "")}</p></div>
  <ol class="ia-product-chain">
    <li><span>01</span><small>Input</small><strong>${html(workflow.input || "Source material")}</strong></li>
    <li class="is-product"><span>02</span><small>Product action</small><strong>${html(workflow.action || workflow.title || "Process the work")}</strong></li>
    <li><span>03</span><small>Output</small><strong>${html(workflow.output || "Usable result")}</strong></li>
  </ol>`;

export function renderProductWorkflow(target, options = {}) {
  const workflows = options.workflows || [];
  const first = workflows[0] || {};
  const figure = mount(target, shell({
    type: "product-workflow", source: options.source || "Signal Notes", title: options.title || "How the product works",
    body: `<nav class="ia-workflow-tabs" aria-label="Product workflows">${workflows.map((workflow, index) => `<button type="button" data-ia-workflow="${index}" class="${index === 0 ? "is-active" : ""}">${html(workflow.label)}</button>`).join("")}</nav>
      <div class="ia-workflow-stage">${workflowMarkup(first)}</div>`,
  }));
  figure.querySelectorAll("[data-ia-workflow]").forEach((button) => button.addEventListener("click", () => {
    figure.querySelectorAll("[data-ia-workflow]").forEach((item) => item.classList.toggle("is-active", item === button));
    figure.querySelector(".ia-workflow-stage").innerHTML = workflowMarkup(workflows[Number(button.dataset.iaWorkflow)] || first);
  }));
  return figure;
}

export function renderProblemNarrative(target, options = {}) {
  const steps = options.steps || [];
  return mount(target, shell({
    type: "problem-narrative", source: options.source || "Signal Notes", title: options.title || "Problem to solution",
    body: `<ol class="ia-problem-list">${steps.map((step, index) => `<li>
      <div class="ia-problem-step"><span>${String(index + 1).padStart(2, "0")}</span><small>${html(step.label)}</small></div>
      <div class="ia-problem-copy"><h3>${html(step.title)}</h3><p>${html(step.detail)}</p>${step.note ? `<aside>${html(step.note)}</aside>` : ""}</div>
    </li>`).join("")}</ol>`,
  }));
}

export function renderCompetitiveRadar(target, options = {}) {
  const nodes = options.nodes || [];
  return mount(target, shell({
    type: "competitive-radar", source: options.source || "Signal Notes", title: options.title || "Competitive field",
    body: `<div class="ia-radar-stage">
      <span class="ia-radar-axis ia-radar-axis-x"></span><span class="ia-radar-axis ia-radar-axis-y"></span>
      <span class="ia-radar-ring one"></span><span class="ia-radar-ring two"></span><span class="ia-radar-ring three"></span>
      <span class="ia-radar-label top">Infrastructure</span><span class="ia-radar-label side">Applications</span>
      <span class="ia-radar-sweep" aria-hidden="true"></span><span class="ia-radar-origin" aria-label="Center point"><i></i></span>
      ${nodes.map((node) => `<button type="button" class="ia-radar-node" style="left:${node.x}%;top:${node.y}%"><b>${html(node.initial || node.name.slice(0, 1))}</b><span>${html(node.name)}</span><small>${html(node.note || node.category || "")}</small></button>`).join("")}
    </div>`,
  }));
}

export function renderHeroLedger(target, options = {}) {
  const rows = options.rows || [];
  return mount(target, shell({
    type: "hero-ledger", source: options.source || "Crumb", title: options.title || "Hero summary ledger",
    body: `<div class="ia-ledger-wrap"><article class="ia-ledger-card">
      <i class="ia-ledger-tape" aria-hidden="true"></i><header><span>${html(options.eyebrow || "Library summary")}</span><small>${html(options.period || "2026")}</small></header>
      <div class="ia-ledger-stat"><strong>${html(options.value || "24")}</strong><span>${html(options.unit || "items")}</span></div>
      <dl>${rows.map((row) => `<div><dt>${html(row.label)}</dt><dd>${html(row.value)}</dd></div>`).join("")}</dl>
      <button type="button">${html(options.action || "Open the working view")}<span>→</span></button>
    </article><aside><small>Why it works</small><p>${html(options.note || "One memorable number, a few supporting facts, and a single next action give the hero useful product context.")}</p></aside></div>`,
  }));
}

export function renderStepDetail(target, options = {}) {
  const ingredients = options.ingredients || [];
  const process = options.process || [];
  return mount(target, shell({
    type: "step-detail", source: options.source || "Crumb", title: options.title || "Instruction with working context",
    body: `<article class="ia-step-layout">
      <span class="ia-step-number">${html(options.number || "03")}</span>
      <div class="ia-step-copy"><header><h3>${html(options.stepTitle || "Build the base")}</h3><span>${html(options.time || "12 min")}</span></header><p>${html(options.detail || "")}</p>${options.tip ? `<aside>${html(options.tip)}</aside>` : ""}</div>
      <aside class="ia-step-glance"><header><span>At a glance</span><b>${html(options.number || "03")}</b></header>
        <section><strong>Use in this step</strong><ul>${ingredients.map((item) => `<li><b>${html(item.amount)}</b><span>${html(item.name)}</span></li>`).join("")}</ul></section>
        <section><strong>Process</strong><ul>${process.map((item) => `<li>${html(item)}</li>`).join("")}</ul></section>
      </aside>
    </article>`,
  }));
}

export function renderPlannerRail(target, options = {}) {
  const days = options.days || [];
  const meals = options.meals || [];
  const figure = mount(target, shell({
    type: "planner-rail", source: options.source || "Crumb", title: options.title || "Selectable planning rail",
    body: `<nav class="ia-day-tabs" aria-label="Choose a day">${days.map((day, index) => `<button type="button" data-ia-day="${index}" class="${index === 0 ? "is-active" : ""}"><strong>${html(day.label)}</strong><small>${html(day.count)}</small></button>`).join("")}</nav>
      <div class="ia-meal-grid">${meals.map((meal) => `<article><header><span>${html(meal.icon)}</span><div><h3>${html(meal.label)}</h3><p>${html(meal.hint)}</p></div></header><div>${(meal.items || []).map((item) => `<button type="button"><strong>${html(item.title)}</strong><small>${html(item.meta)}</small></button>`).join("")}</div><button type="button" class="ia-add-item">+ Find an item</button></article>`).join("")}</div>`,
  }));
  figure.querySelectorAll("[data-ia-day]").forEach((button) => button.addEventListener("click", () => {
    figure.querySelectorAll("[data-ia-day]").forEach((item) => item.classList.toggle("is-active", item === button));
  }));
  return figure;
}

export const DiagramKit = {
  renderLiveProcess, renderProductWorkflow, renderProblemNarrative, renderCompetitiveRadar,
  renderHeroLedger, renderStepDetail, renderPlannerRail,
};
