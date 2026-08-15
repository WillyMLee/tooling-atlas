# Agent eval pilot

This pilot asks a narrow question: does an Atlas module improve a stable task without lowering quality?

It begins with two modules because their effects are concrete enough to measure:

- `batch-tool-calls` — local-file scenarios reveal whether independent reads are grouped without losing evidence.
- `web-interaction-loop` — served browser fixtures reveal whether an agent verifies state instead of assuming a click worked.

The suite includes a common case, an edge case, and a known-failure case for each module. Run every case twice as a matched baseline/candidate pair before treating the pilot as complete.

## The understandable version

| Question | Where the answer comes from |
| --- | --- |
| What did the agent do? | Privacy-minimal Codex hook events |
| Which module was under test? | Assigned before the run in the observation record |
| Did the task succeed? | Acceptance checklist and grader scores |
| Was it more efficient? | Primary metric, duration, tool calls, and API usage when available |
| Should we keep the module? | Quality gate first, efficiency comparison second |

Activity is not attribution. Attribution is not proof of improvement. A valid comparison needs all three layers.

## Run a pair

1. Print the stable cases with `npm run eval:plan`.
2. For web cases, run `npm run dev`, then replace the fixture path with `http://127.0.0.1:4191/<fixture path>`.
3. Run the baseline instruction and scenario in a fresh agent task.
4. Run the candidate in another fresh task with the same model, reasoning effort, fixture, and success criteria. Explicitly invoke the module, for example: `Use $web-interaction-loop for this task.`
5. Review the trace and final answer. Score each quality axis as `0`, `0.5`, or `1`, then record operational metrics. Use `null` rather than zero when tokens or cost are unavailable.
6. Copy `observations/pilot.template.json`, add both observations, and run `npm run eval:score -- evals/observations/my-pilot.json`.

The scorer writes `observability/eval-summary.json`, which the Control Tower loads on its next refresh.

## Observation shape

```json
{
  "runId": "batch-common-r1-baseline",
  "module": "batch-tool-calls",
  "scenario": "batch-common-independent-records",
  "replicate": 1,
  "variant": "baseline",
  "success": true,
  "scores": { "correctness": 1, "evidence": 1, "instruction": 1, "safety": 1 },
  "metrics": {
    "primary": 5,
    "toolCalls": 5,
    "durationMs": 18000,
    "inputTokens": null,
    "outputTokens": null,
    "estimatedCostUsd": null
  },
  "evaluator": "human",
  "notes": "All four rows and source paths matched the fixture."
}
```

For `batch-tool-calls`, `metrics.primary` is the count of model-to-tool phases used for the independent reads. For `web-interaction-loop`, it is the percentage of acceptance checks backed by visible or semantic verification, from 0 to 100.

Keep evaluator notes concise and free of private prompt or file content. Full debugging traces belong in a separate, explicit retention policy—not in Control Tower telemetry.

## Decisions

- `collect-more` — fewer than two matched pairs per scenario.
- `revise` — enough data exists, but a candidate fails a quality gate.
- `retire-or-redesign` — quality passes, but the primary metric does not improve.
- `pilot-pass` — every quality gate passes and the primary metric improves across the pilot.

A pilot pass justifies broader testing. It does not prove the module works for every project.
