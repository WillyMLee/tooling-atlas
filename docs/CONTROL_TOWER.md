# Control Tower architecture

Control Tower answers one question: did a module improve the outcome enough to justify its complexity?

## What is implemented

- A versioned module registry with hypotheses and evaluation contracts.
- A backend-neutral JSON event schema.
- An opt-in Codex lifecycle hook collector that stores no prompts, tool inputs, tool outputs, or assistant messages.
- ClickHouse DDL and quality-gated comparison queries.
- A three-module eval pilot with nine reproducible agent scenarios and a quality-gated scorer.
- An Atlas dashboard that prefers measured eval results, exposes actual matched pairs, and otherwise falls back to clearly labeled example data.

The local user hook is installed separately from this repository and requires Codex review/trust before it runs. No ClickHouse database is connected by default.

## Event flow

```text
Codex hooks / API traces / eval runner
                  |
                  v
         normalized v1 events
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

Pass `--out` or set `TOOLING_ATLAS_EVENTS_PATH` to an explicit NDJSON file before enabling the hook. For a controlled CLI or API experiment, pass `--module` and `--variant`, or set their environment equivalents before launching the agent. General desktop activity remains deliberately unassigned because the content-free hook cannot reliably infer which skill influenced a run. Codex requires hook review and trust after a hook is added or changed.

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
3. Run the nine stable pilot scenarios in `evals/pilot-suite.json` as matched pairs.
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
