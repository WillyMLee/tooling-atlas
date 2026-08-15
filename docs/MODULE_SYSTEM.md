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

## Using the skills across projects

Run `npm run skills:link` to create user-scope links under the supported Codex skill directory. The repository remains the source of truth, so edits here become available to future Codex sessions without maintaining copies.

Run `npm run skills:link:dry` first to inspect the exact links. The linker refuses to replace an existing file or directory.

Restart Codex or start a new task if an updated skill does not appear immediately.

## Adding a module

1. Create and validate a focused skill package.
2. Add one registry record with a falsifiable hypothesis, primary metric, guardrails, events, and representative eval cases.
3. Add baseline and candidate cases before changing prompts or routing.
4. Instrument module selection and run completion.
5. Promote maturity only after repeated quality-gated comparisons.

Run `npm run check` before publishing.
