CREATE DATABASE IF NOT EXISTS tooling_atlas;

CREATE TABLE IF NOT EXISTS tooling_atlas.agent_events
(
    event_time DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
    event_date Date MATERIALIZED toDate(event_time),
    schema_version UInt16 DEFAULT 1,
    event_name LowCardinality(String),
    run_id String CODEC(ZSTD(1)),
    turn_id String CODEC(ZSTD(1)),
    trace_id String CODEC(ZSTD(1)),
    span_id String CODEC(ZSTD(1)),
    parent_span_id String CODEC(ZSTD(1)),
    project LowCardinality(String),
    surface LowCardinality(String),
    module_slug LowCardinality(String),
    module_version LowCardinality(String),
    activation_mode LowCardinality(String),
    activation_reason LowCardinality(String),
    task_shape LowCardinality(String),
    source_count Nullable(UInt32),
    independent_operation_count Nullable(UInt32),
    orchestration_phase LowCardinality(String),
    variant LowCardinality(String),
    model LowCardinality(String),
    reasoning_effort LowCardinality(String),
    tool_name LowCardinality(String),
    status LowCardinality(String),
    duration_ms Nullable(UInt64),
    input_tokens Nullable(UInt64),
    output_tokens Nullable(UInt64),
    cached_tokens Nullable(UInt64),
    tool_calls UInt32 DEFAULT 0,
    estimated_cost_usd Nullable(Decimal(18, 8)),
    quality_score Nullable(Float32),
    success Nullable(UInt8),
    error_code LowCardinality(String),
    attributes Map(LowCardinality(String), String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (project, module_slug, event_name, event_time, run_id)
TTL event_time + INTERVAL 180 DAY DELETE
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;

-- Quality is a gate, not a tradeable efficiency metric. Compare cost and speed
-- only among runs that meet the required success and quality thresholds.
SELECT
    module_slug,
    variant,
    countIf(event_name = 'run.completed') AS runs,
    avgIf(quality_score, event_name = 'run.completed') AS avg_quality,
    avgIf(duration_ms, event_name = 'run.completed') AS avg_duration_ms,
    avgIf(input_tokens + output_tokens, event_name = 'run.completed' AND input_tokens IS NOT NULL AND output_tokens IS NOT NULL) AS avg_tokens,
    avgIf(estimated_cost_usd, event_name = 'run.completed') AS avg_cost_usd
FROM tooling_atlas.agent_events
WHERE event_time >= now() - INTERVAL 30 DAY
  AND success = 1
  AND quality_score >= 0.85
GROUP BY module_slug, variant
ORDER BY module_slug, variant;

-- Detect modules that add coordination but fail to improve the outcome.
SELECT
    module_slug,
    task_shape,
    activation_reason,
    countIf(event_name = 'module.selected') AS activations,
    countIf(event_name = 'run.completed' AND success = 1) AS successful_runs,
    quantileIf(0.5)(duration_ms, event_name = 'run.completed') AS p50_duration_ms,
    sumIf(tool_calls, event_name = 'run.completed') AS tool_calls
FROM tooling_atlas.agent_events
WHERE event_time >= now() - INTERVAL 30 DAY
GROUP BY module_slug, task_shape, activation_reason
ORDER BY activations DESC;
