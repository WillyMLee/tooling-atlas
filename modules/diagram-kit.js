const html = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
})[character]);

const mount = (target, markup) => {
  if (!(target instanceof Element)) throw new TypeError("Diagram Kit needs a valid target element.");
  target.innerHTML = markup;
  return target.firstElementChild;
};

const shell = ({ type, eyebrow, title, description, body }) => `
  <figure class="ia-diagram ia-${type}" data-ia-diagram="${type}">
    ${(eyebrow || title || description) ? `<figcaption class="ia-caption">
      ${eyebrow ? `<span class="ia-eyebrow">${html(eyebrow)}</span>` : ""}
      ${title ? `<strong>${html(title)}</strong>` : ""}
      ${description ? `<span>${html(description)}</span>` : ""}
    </figcaption>` : ""}
    ${body}
  </figure>`;

export function renderFlow(target, options = {}) {
  const steps = options.steps || [];
  return mount(target, shell({
    type: `flow ia-flow-${options.direction === "horizontal" ? "horizontal" : "vertical"}`,
    ...options,
    body: `<ol class="ia-flow-list">${steps.map((step, index) => `<li class="ia-flow-step ${step.tone === "accent" ? "is-accent" : ""}">
      <span class="ia-step-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="ia-step-copy"><small>${html(step.label)}</small><strong>${html(step.title)}</strong>${step.detail ? `<span>${html(step.detail)}</span>` : ""}</span>
    </li>`).join("")}</ol>`,
  }));
}

export function renderSystemMap(target, options = {}) {
  const nodes = options.nodes || [];
  return mount(target, shell({
    type: "system-map",
    ...options,
    body: `<div class="ia-map-stage">
      <span class="ia-map-axis ia-map-axis-x" aria-hidden="true"></span><span class="ia-map-axis ia-map-axis-y" aria-hidden="true"></span>
      <div class="ia-map-core"><small>${html(options.core?.label || "Core")}</small><strong>${html(options.core?.title || "System")}</strong></div>
      <ul class="ia-map-nodes">${nodes.map((node, index) => `<li style="--ia-node:${index}"><small>${html(node.label)}</small><strong>${html(node.title)}</strong>${node.detail ? `<span>${html(node.detail)}</span>` : ""}</li>`).join("")}</ul>
    </div>`,
  }));
}

export function renderMetricBridge(target, options = {}) {
  const metrics = options.metrics || [];
  return mount(target, shell({
    type: "metric-bridge",
    ...options,
    body: `<ol class="ia-metric-list">${metrics.map((metric, index) => `<li>
      <span class="ia-metric-value">${html(metric.value)}</span>
      <span class="ia-metric-copy"><small>${html(metric.label)}</small><strong>${html(metric.title)}</strong>${metric.detail ? `<span>${html(metric.detail)}</span>` : ""}</span>
      ${index < metrics.length - 1 ? `<i aria-hidden="true">→</i>` : ""}
    </li>`).join("")}</ol>`,
  }));
}

export function renderDecisionFork(target, options = {}) {
  const paths = options.paths || [];
  return mount(target, shell({
    type: "decision-fork",
    ...options,
    body: `<div class="ia-decision-question"><small>${html(options.questionLabel || "Decision")}</small><strong>${html(options.question || "Choose a path")}</strong></div>
      <div class="ia-decision-paths">${paths.map((path) => `<article class="ia-decision-path ${path.recommended ? "is-recommended" : ""}">
        <span>${html(path.label)}${path.recommended ? " · Recommended" : ""}</span>
        <h3>${html(path.title)}</h3>
        <p>${html(path.detail)}</p>
        ${path.tradeoff ? `<small>${html(path.tradeoff)}</small>` : ""}
      </article>`).join("")}</div>`,
  }));
}

export function renderEvidenceChain(target, options = {}) {
  const steps = options.steps || [];
  return mount(target, shell({
    type: "evidence-chain",
    ...options,
    body: `<ol class="ia-evidence-list">${steps.map((step, index) => `<li class="ia-evidence-step ${step.tone === "accent" ? "is-accent" : ""}">
      <span class="ia-evidence-index">${String(index + 1).padStart(2, "0")}</span>
      <small>${html(step.label)}</small>
      <strong>${html(step.title)}</strong>
      ${step.detail ? `<p>${html(step.detail)}</p>` : ""}
    </li>`).join("")}</ol>`,
  }));
}

export const DiagramKit = { renderFlow, renderSystemMap, renderMetricBridge, renderDecisionFork, renderEvidenceChain };
