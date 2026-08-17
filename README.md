# Tooling Atlas

Tooling Atlas is an open working library for interface references, source-derived pattern packets, interaction patterns, agent workflow skills, and evidence about whether those skills help. It exists so useful decisions from one project can become dependable starting points for the next.

## What is inside

- `assets/designs/` — three live page/product-state frames, four opening-frame component crops, and one verified mobile frame per profile.
- `catalog/` — reconstruction profiles, the canonical live-product registry, and the twelve-item strategic backlog.
- `modules/` — dependency-free JavaScript and CSS patterns extracted from working interfaces.
- `skills/` — validated Agent Skills for routing, implementation, context, batching, browser work, orchestration, evals, and tool-surface design.
- `observability/` — website health, policy and agent eval summaries, the privacy-minimal event contract, and optional ClickHouse DDL.
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

## Design gallery

The gallery is organized for research and reconstruction rather than screenshot volume. Search by task, theme, component, or interaction; each profile then separates page anatomy, opening-frame component anatomy, source-mapped section order, build sequence, and responsive proof. Capture metadata lives in `catalog/design-captures.json`, and the benchmark rubric is documented in `docs/DESIGN_GALLERY_BENCHMARK.md`.

## Skills

Each folder in `skills/` is a standalone Agent Skill with `SKILL.md` and `agents/openai.yaml`. Copy a folder into your agent's skills directory or install it using the tooling supported by that agent. Review the module before enabling it in a production workflow.

Measured modules can use evidence-responsive routing. Atlas derives a live recommendation from the currently loaded matched runs, while `catalog/module-registry.json` records the reviewed threshold and the exact revision applied to the canonical open-source `SKILL.md`. The dashboard never silently rewrites a skill: an eval can change the recommendation, but a versioned source edit is still required before Codex inherits new guidance.

The module directory is organized as an orchestration flow: Route, Prepare, Execute, Improve. Orchestration owns shared decisions and synthesis; specialist skills receive bounded inputs and return explicit handoff artifacts. Most tasks should use no module or one coordinator plus one specialist, not the entire stack.

`route-skills` is the lightweight activation layer. It starts with direct work, selects specialists from task shape and measured thresholds, and keeps evaluation or skill authoring after completion. Its deterministic policy can be inspected without sending task content anywhere:

```sh
node skills/route-skills/scripts/route.mjs --scope multi --work-shape browser --improvement skill --format text
```

Meaningful routing decisions can now produce a privacy-minimal decision/outcome pair in the local Atlas NDJSON file. The record contains categorical task shape, selected and skipped skills, outcome, quality-gate state, and retries; it never stores prompts, messages, tool arguments, tool output, credentials, or file contents.

`implement-skills` turns a reviewed workflow into a concise skill package, checks overlap before creating another skill, validates metadata and scripts, and keeps performance claims unmeasured until matched runs exist.

For personal Codex use, preview and then create user-scope links while keeping this repository as the source of truth:

```sh
npm run skills:link:dry
npm run skills:link
```

## Control Tower

The Control Tower is a separate application at `/control-tower.html`. It combines the canonical fifteen-site registry, measured HTTP health, routing telemetry contract, twenty-four deterministic policy A/B pairs, six real agent pairs, metric coverage, and the active/later strategic backlog. Policy fixtures and real agent evidence remain visually and semantically separate.

Its default view shows current routing decisions first. Individual pairs and system architecture are progressively disclosed so evidence remains available without overwhelming the decision.

Module pages show two intentionally separate evidence types: dogfood field observations explain what happened during real Atlas work, while matched baseline/candidate benchmarks determine whether a module is actually proven.

Context Budget and Batch Tool Calls now expose the first applied policy revisions directly on their module pages. Each revision links the base file to the measured report that caused the change.

Refresh the live site snapshot with `npm run sites:check`; the scheduled GitHub workflow runs the same checker daily. Reproduce the deterministic policy matrix with `npm run eval:strategic`. Print the six-module, eighteen-scenario agent plan with `npm run eval:plan`, and reproduce the current agent score with `npm run eval:score -- evals/observations/2026-08-15-measured.json`. Inspect private local activity separately with `npm run telemetry:summary`.

## License

MIT
