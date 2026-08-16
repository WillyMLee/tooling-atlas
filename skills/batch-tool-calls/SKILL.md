---
name: batch-tool-calls
description: Reduce tool round trips for a substantial set of independent read-only operations by using bounded batches and compact return shapes. Prefer direct work for small three-to-four item reads; consider this module around eight or more comparable operations when round-trip latency is material.
---

# Batch Tool Calls

## Evidence-Adjusted Policy

Policy revision: `batch-tool-calls-2026-08-15-r1`

- Default to direct reads for three or four quick operations.
- Consider batching at roughly eight comparable independent operations when round-trip latency is material and the return shape is compact.
- Treat this threshold as evidence-responsive, not self-modifying: revise this base file only after a reviewed eval changes the routing decision.

Batch deterministic work. Keep semantic judgment and consequential actions direct.

## Decide Whether to Batch

Do not load this module merely because a task contains three or four files. For small sets, read directly. At the provisional threshold, still confirm that batching can actually reduce round trips.

Batch when all operations:

- are independent;
- are read-only or otherwise safe to run together;
- have known input and output shapes;
- can share a clear stopping condition.

Do not batch approvals, destructive actions, writes to the same target, or steps whose inputs depend on earlier results.

Do not batch when:

- fewer than roughly eight quick operations are involved;
- one compact direct command can already return the required fields;
- the combined result could exceed the active context budget;
- semantic judgment is required after each result.

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
