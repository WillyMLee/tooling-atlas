---
name: batch-tool-calls
description: Reduce tool round trips by grouping independent read-only operations into bounded batches and returning only the fields needed for the next decision. Use for three or more searches, file reads, metadata lookups, API queries, or repeatable transformations that do not depend on each other's results.
---

# Batch Tool Calls

Batch deterministic work. Keep semantic judgment and consequential actions direct.

## Decide Whether to Batch

Batch when all operations:

- are independent;
- are read-only or otherwise safe to run together;
- have known input and output shapes;
- can share a clear stopping condition.

Do not batch approvals, destructive actions, writes to the same target, or steps whose inputs depend on earlier results.

## Workflow

1. Partition the task into independent calls and dependent decisions.
2. Define the smallest return shape needed for the next decision.
3. Set concurrency, retry, and stop limits before execution.
4. Run independent calls together.
5. Reduce once: deduplicate, retain provenance, and surface missing evidence.
6. Continue with direct tool calls when fresh model judgment is required.

## Operating Contract

For a complex batch, state:

- allowed tools;
- input collection;
- exact output fields;
- concurrency ceiling;
- maximum retries for transient failures;
- stop condition;
- side effects that remain prohibited.

Never repeat a completed call merely because another item in the batch failed.

## Verification

Compare the batched result with a small direct sample. Count lower latency or token use as an improvement only if correctness, evidence, and final-answer completeness still pass.

## Example

For six independent source checks and five local asset inspections, define one compact result shape, run the read-only calls together, preserve a source pointer for each result, and reduce once before writing. Keep any publication or external write outside the batch.

Measure success by round trips reduced, calls not repeated, and final evidence completeness.

Read [references/SOURCES.md](references/SOURCES.md) when revising the batching policy.
