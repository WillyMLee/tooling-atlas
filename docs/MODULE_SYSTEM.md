# Agent module system

Tooling Atlas separates a useful method from evidence that the method works.

## The module contract

Every module has four layers:

1. `skills/<slug>/SKILL.md` is the concise operating method Codex loads when the task matches.
2. `skills/<slug>/agents/openai.yaml` is the human-facing discovery metadata.
3. `catalog/module-registry.json` records the hypothesis, maturity, events, and evaluation cases.
4. Control Tower telemetry records what happened in representative baseline and candidate runs.

The Atlas module page is the readable operating manual for those layers. It presents the sequence, worked example, test bench, qualified field findings, success checks, and source package without loading all of that material into the agent's working context.

Do not put dashboards, historical results, or long research notes in `SKILL.md`. That content consumes context every time the skill triggers. Keep it in the registry, observability data, or a focused reference.

## Maturity states

- `Experimental`: the workflow is plausible but its task shape or operating sequence is still changing.
- `Ready`: the package is valid and the workflow is stable enough to benchmark.
- `Proven`: representative evals show a repeatable quality or efficiency gain without failing a guardrail.
- `Retired`: the method is redundant, harmful, or no longer compatible with the current tool surface.

`Ready` does not mean proven. Promote a module only from measured baseline-versus-candidate evidence.

## Evidence rules

Evaluate in this order:

1. task success;
2. required evidence and instruction adherence;
3. safety and authorization;
4. reliability across representative cases;
5. latency, tool calls, tokens, and estimated cost.

A cheaper failed run is not an improvement. A faster run that omits proof is not an improvement. Track costs as estimates unless the source supplies billed cost directly.

### Field observations are not benchmarks

`observability/field-tests.json` records direct dogfood findings such as a truncated batch or a successful recovery. These findings can justify a design change and make current testing visible, but they do not promote maturity. Only representative, matched baseline/candidate runs with the quality and safety gates intact count as performance evidence.

## Using the skills across Codex

Run `npm run system:install` for the complete user-level integration. It links the eight canonical packages into `~/.agents/skills`, adds a small managed routing block to `~/.codex/AGENTS.md`, and merges privacy-minimal lifecycle capture into `~/.codex/hooks.json`. This makes the skills discoverable from any local Codex project while keeping activation selective.

The routing block does not turn on all modules for every prompt. Codex matches a clear specialist directly and uses `route-skills` when several modules could apply, activation is ambiguous, or phases need ordering. Measurement and implementation modules remain opt-in overhead for tasks that actually need them.

Use `npm run system:dry` to inspect status without writing and `npm run system:check` as the ongoing doctor. The installer is idempotent, preserves unrelated global instructions and hooks, and refuses to overwrite a conflicting skill directory. The older `npm run skills:link` command remains available when only discovery links are wanted.

After installing or changing hooks, review their exact definitions with `/hooks` in Codex. Codex intentionally skips untrusted user hooks. Restart Codex or start a new task if updated skills or global instructions do not appear immediately.

This installation scope covers the local Codex desktop app, CLI, and IDE extension for this user account. Packaging Atlas as a plugin is the separate distribution path when the goal expands to Chat and Work on web or mobile.

## Adding a module

1. Create and validate a focused skill package.
2. Add one registry record with a falsifiable hypothesis, primary metric, guardrails, events, and representative eval cases.
3. Add baseline and candidate cases before changing prompts or routing.
4. Instrument module selection and run completion.
5. Promote maturity only after repeated quality-gated comparisons.

Run `npm run check` before publishing.
