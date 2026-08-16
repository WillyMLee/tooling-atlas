# Tooling Atlas

Tooling Atlas is an open working library for interface references, source-derived pattern packets, interaction patterns, agent workflow skills, and evidence about whether those skills help. It exists so useful decisions from one project can become dependable starting points for the next.

## What is inside

- `assets/designs/` — verified live-source opening frames used by the gallery and component crops.
- `catalog/` — source-derived reconstruction profiles with hero anatomy, frame dimensions, responsive rules, build order, and provenance.
- `modules/` — dependency-free JavaScript and CSS patterns extracted from working interfaces.
- `skills/` — validated Agent Skills for context, batching, browser work, orchestration, evals, and tool-surface design.
- `observability/` — the backend-neutral event contract, qualified field observations, example dashboard data, and ClickHouse DDL.
- `docs/` — longer implementation notes and contribution guidance.

- `evals/` — stable baseline/candidate agent scenarios, fixtures, scoring rules, and observation guidance.

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

Run the complete structural validation and build with:

```sh
npm run check
```

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

Measured modules can use evidence-responsive routing. Atlas derives a live recommendation from the currently loaded matched runs, while `catalog/module-registry.json` records the reviewed threshold and the exact revision applied to the canonical open-source `SKILL.md`. The dashboard never silently rewrites a skill: an eval can change the recommendation, but a versioned source edit is still required before Codex inherits new guidance.

For personal Codex use, preview and then create user-scope links while keeping this repository as the source of truth:

```sh
npm run skills:link:dry
npm run skills:link
```

## Control Tower

The Control Tower is a separate measurement surface at `/control-tower.html`, not part of the editorial Atlas directory. It distinguishes a valid module from a proven module. It now prefers the first measured Codex A/B pilot and links each pair to its task, output evidence, grading, and machine-readable observation. See `docs/CONTROL_TOWER.md` for the event flow, privacy boundary, optional Codex hooks, and ClickHouse rollout.

Module pages show two intentionally separate evidence types: dogfood field observations explain what happened during real Atlas work, while matched baseline/candidate benchmarks determine whether a module is actually proven.

Context Budget and Batch Tool Calls now expose the first applied policy revisions directly on their module pages. Each revision links the base file to the measured report that caused the change.

Print the three-module pilot plan with `npm run eval:plan`. Reproduce the current measured score with `npm run eval:score -- evals/observations/2026-08-15-measured.json`, or pass another observation file to update the Control Tower. Inspect privacy-minimal local activity separately with `npm run telemetry:summary`.

## License

MIT
