# Tooling Atlas

Tooling Atlas is an open working library for interface references, source-derived pattern packets, interaction patterns, and agent workflow skills. It exists so useful decisions from one project can become dependable starting points for the next.

## What is inside

- `catalog/` — design profiles with palette, type, brand, layout, and interaction notes.
- `modules/` — dependency-free JavaScript and CSS patterns extracted from working interfaces.
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

## Pattern kit

```js
import { renderLiveProcess } from "./modules/diagram-kit.js";

renderLiveProcess(document.querySelector("#module"), {
  source: "WillyMLee.com",
  label: "Weekend baking",
  steps: ["Feed the starter", "Shape the dough", "Wait for the rise"],
});
```

Import `modules/diagram-kit.css` once and override the documented `--ia-*` custom properties from the containing page. The kit also includes Product Workflow, Problem Narrative, Competitive Radar, Hero Ledger, Step Detail, and Planning Rail renderers.

## Skills

Each folder in `skills/` is a standalone Agent Skill with `SKILL.md` and `agents/openai.yaml`. Copy a folder into your agent's skills directory or install it using the tooling supported by that agent. Review the module before enabling it in a production workflow.

## License

MIT
