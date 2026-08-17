# Control Tower architecture

Control Tower answers one question: did a module improve the outcome enough to justify its complexity?

## What is implemented

- A versioned module registry with hypotheses and evaluation contracts.
- A backend-neutral v2 JSON event schema with explicit routing decision and outcome fields.
- An opt-in Codex lifecycle hook collector that stores no prompts, tool inputs, tool outputs, or assistant messages.
- ClickHouse DDL and quality-gated comparison queries.
- A six-module eval pilot with eighteen reproducible agent scenarios and a quality-gated scorer.
- A canonical fifteen-site registry with a daily HTTP health snapshot.
- Twenty-four deterministic policy-level A/B pairs across routing, context, batching, and orchestration.
- A focused Control Tower application that keeps policy fixtures, real agent evidence, activity, and unknown usage fields separate.

The local user hook is installed separately from this repository and requires Codex review/trust before it runs. No ClickHouse database is connected by default.

## Event flow

```text
Codex hooks / API traces / eval runner
                  |
                  v
         normalized v2 events
                  |
          +-------+--------+
          |                |
          v                v
    local NDJSON       ClickHouse
    development        durable analytics
          |                |
          +-------+--------+
                  v
       quality-gated comparisons
                  |
                  v
       promote, revise, or retire
```

The event contract is the durable interface. ClickHouse is an excellent analytical backend for high-cardinality run, tool, model, and module dimensions, but the Atlas UI should not depend directly on a vendor-specific ingestion path.

## Feedback into modules

Measured runs can change the dashboard recommendation immediately because it is derived from the current baseline/candidate pairs. They cannot silently change an installed agent skill. A routing change becomes reusable only after review, a version bump in `catalog/module-registry.json`, and a matching policy revision in the canonical `skills/<name>/SKILL.md`. The registry records both the base file and the evidence file so the change remains auditable.

## Capture sources

### Codex lifecycle hooks

Use hooks for session, turn, subagent, and tool activity. The included collector normalizes common hook fields and intentionally discards content. Hooks do not currently provide complete token or billed-cost information, so do not infer those values.

Example `hooks.json` entry:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node C:/path/to/tooling-atlas/scripts/capture-hook.mjs",
            "commandWindows": "node C:/path/to/tooling-atlas/scripts/capture-hook.mjs",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node C:/path/to/tooling-atlas/scripts/capture-hook.mjs",
            "commandWindows": "node C:/path/to/tooling-atlas/scripts/capture-hook.mjs",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

Pass `--out` or set `TOOLING_ATLAS_EVENTS_PATH` to an explicit NDJSON file before enabling the hook. For a controlled CLI or API experiment, pass `--module` and `--variant`, or set their environment equivalents before launching the agent. Add `--module-version`, `--activation-mode`, `--activation-reason`, `--task-shape`, `--source-count`, `--independent-operations`, and `--orchestration-phase` when those values are assigned before the run. General desktop activity remains deliberately unassigned because the content-free hook cannot reliably infer which skill influenced a run. Codex requires hook review and trust after a hook is added or changed.

Activation metadata is deliberately categorical. It answers whether a module was explicit, recommended, automatic, or eval-assigned and which coarse task shape triggered it. It does not store task text, source names, file paths, or tool content.

### Routing decision pairs

`skills/route-skills/scripts/record.mjs` writes one `routing.decided` event before a meaningful routed task and one `routing.completed` event afterward. Both use the same route ID. The pair records selected and skipped skills, routing mode, coarse task shape, outcome, quality-gate result, and retries. The router continues even when telemetry cannot be written.

```sh
npm run telemetry:route -- --stage decision --route-id example --task-shape multi-part --routing-mode orchestrated --selected orchestration-plan
npm run telemetry:route -- --stage outcome --route-id example --task-shape multi-part --routing-mode orchestrated --selected orchestration-plan --outcome completed --quality-passed true
```

### Website health

`npm run sites:check` checks every entry in `catalog/product-registry.json`, records HTTP status, redirect destination, latency, and a timestamp in `observability/site-health.json`, and exits non-zero when a site is down. The scheduled GitHub workflow refreshes this snapshot daily. HTTP reachability does not prove authenticated flows, scheduled jobs, or data freshness.

### Policy-level A/B tests

`npm run eval:strategic` runs twenty-four deterministic pairs against decision fixtures. These tests catch threshold and coordination regressions cheaply. They are not end-to-end agent trials and do not establish token or dollar savings. Real agent evidence remains in the original pilot dataset.

The default personal installation writes to `~/.codex/telemetry/tooling-atlas-events.ndjson`. Inspect counts without exposing content:

```sh
npm run telemetry:summary
```

### OpenAI API agents and evals

For API-backed workflows, emit the same event contract from the application or eval runner. Record actual usage fields returned by the API, trace identifiers, model and reasoning settings, grader results, and the module/variant assigned before the run.

### Workspace analytics

Use aggregated Codex workspace analytics only for organization-level reporting. It is not a replacement for raw run traces or module-level eval data.

## ClickHouse role

`observability/clickhouse.sql` keeps raw, wide events in a `MergeTree` table. Common dimensions are typed columns; evolving details stay in an attributes map. Raw events remain re-queryable, while dashboards can add materialized views later for queries that prove hot.

The schema uses a 180-day TTL as a starting point, not a universal retention policy. Change retention only after measuring event volume, privacy needs, and the value of older comparisons.

## Rollout

1. Use the local example dataset only for interface development.
2. Capture privacy-minimal hook events to local NDJSON.
3. Run the eighteen stable pilot scenarios in `evals/pilot-suite.json` as matched pairs.
4. Score correctness, evidence, instruction adherence, and safety before comparing efficiency.
5. Add API usage and grader results where available.
6. Ingest normalized events to ClickHouse using JSONEachRow or OpenTelemetry infrastructure.
7. Promote modules only after repeated quality-gated gains.

## Privacy boundary

Do not store prompts, full messages, tool arguments, tool responses, file contents, credentials, or unrelated browsing data in Control Tower. Store identifiers, timing, counts, outcomes, error classes, and evaluation scores. Keep any deeper debugging trace behind a separate, explicit retention and access policy.

## References

- [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI: Codex hooks](https://learn.chatgpt.com/docs/hooks)
- [OpenAI: Model and agent optimization guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [ClickHouse: OpenTelemetry storage practices](https://clickhouse.com/resources/engineering/best-resources-storing-opentelemetry-collector-data)
- [ClickHouse: AI observability reference architecture](https://clickhouse.com/blog/ai-sre-observability-architecture)
