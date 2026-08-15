# Interface Atlas

An open-source field guide to reusable diagram modules and web-interface patterns.

Interface Atlas has two jobs:

1. Provide small, framework-free diagrams that can be dropped into editorial, research, and product sites.
2. Record what works across real websites without copying their application code or visual identity.

## Included modules

- **Flow stack** — a sequence with explicit inputs, actions, and outcomes.
- **System map** — a central system with related actors or services.
- **Metric bridge** — a causal path from operating change to business result.
- **Decision fork** — options, tradeoffs, and a recommended path.

All modules use semantic HTML, respect reduced-motion preferences, inherit CSS custom properties, and collapse cleanly on small screens.

## Quick start

```html
<link rel="stylesheet" href="./modules/diagram-kit.css" />
<div id="workflow"></div>
<script type="module">
  import { renderFlow } from "./modules/diagram-kit.js";

  renderFlow(document.querySelector("#workflow"), {
    eyebrow: "How it works",
    steps: [
      { label: "Input", title: "Work traces", detail: "Observed activity" },
      { label: "Product action", title: "Model the process", detail: "Context and exceptions" },
      { label: "Output", title: "Process evidence", detail: "A current operating view", tone: "accent" }
    ]
  });
</script>
```

## Repository map

```text
modules/                 Reusable JavaScript and CSS
catalog/sites.json       Observed website-pattern inventory
docs/                    Selection and implementation guidance
index.html               Live gallery
app.js                   Gallery interactions and examples
styles.css               Gallery-only presentation
```

## Design principles

- Start with the relationship the reader needs to understand.
- Keep the diagram useful when animation, color, or JavaScript is unavailable.
- Treat labels as content, not decoration.
- Prefer one visual grammar per page.
- Use responsive recomposition instead of shrinking a desktop diagram.
- Make copyable examples small enough to understand in one sitting.

See [Diagram best practices](docs/DIAGRAM_BEST_PRACTICES.md) and the [website pattern audit](docs/WEBSITE_PATTERN_AUDIT.md).

## Status

This is the initial `0.1` field release. The next milestone is packaging the modules for npm and adding screenshot-based regression tests.
