# Tooling Atlas

Tooling Atlas is an open working library for interface references, diagram packets, interaction patterns, and agent workflow skills. It exists so useful decisions from one project can become dependable starting points for the next.

## What is inside

- `catalog/` — design profiles with palette, type, brand, layout, and interaction notes.
- `modules/` — dependency-free JavaScript and CSS diagram primitives.
- `skills/` — validated Agent Skills for context, batching, browser work, orchestration, evals, and tool-surface design.
- `docs/` — longer implementation notes and contribution guidance.

## Run locally

```sh
npm run dev
```

The command prints the local URL after selecting an available port.

## Build

```sh
npm run build
```

The static site is written to `dist/`.

## Diagram kit

```js
import { renderFlow } from "./modules/diagram-kit.js";

renderFlow(document.querySelector("#diagram"), {
  title: "Signals become a working view",
  direction: "vertical",
  steps: [
    { label: "Input", title: "Collect evidence" },
    { label: "Model", title: "Create context" },
    { label: "Outcome", title: "Guide action", tone: "accent" },
  ],
});
```

Import `modules/diagram-kit.css` once and override the documented `--ia-*` custom properties from the containing page.

## Skills

Each folder in `skills/` is a standalone Agent Skill with `SKILL.md` and `agents/openai.yaml`. Copy a folder into your agent's skills directory or install it using the tooling supported by that agent. Review the module before enabling it in a production workflow.

## License

MIT
