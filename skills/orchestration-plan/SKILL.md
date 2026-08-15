---
name: orchestration-plan
description: Choose direct work, programmatic batching, or multiple agents from a task's dependency graph and govern each workstream with an explicit contract. Use for multi-part research, implementation, migration, review, or verification tasks that may contain independent bounded streams.
---

# Orchestration Plan

Use the lightest coordination mode that preserves correctness.

## Choose the Mode

- Direct work: tightly coupled steps, frequent judgment, shared mutable files, or a small task.
- Programmatic batching: independent deterministic tool calls with known schemas.
- Multiple agents: independent bounded workstreams that can run concurrently and return distinct evidence.
- Handoff: a specialist should take ownership of the remaining conversation or user interaction.

Do not delegate merely because a task has many steps.

## Workflow

1. Draw the dependency graph. Mark shared decisions and mutable targets.
2. Keep shared decisions with the coordinator before parallel work begins.
3. Give every stream a contract:
   - objective;
   - scope and excluded work;
   - allowed tools and authority;
   - output shape and evidence;
   - completion and stop conditions.
4. Avoid duplicate streams and concurrent edits to the same file.
5. Synthesize centrally. Resolve conflicts against primary evidence and user intent.
6. Run one final validation of the complete outcome.

## Boundaries

- Delegation never expands the user's authorization.
- One coordinator owns the final answer and cross-stream decisions.
- Side effects stay with the explicitly authorized owner.
- If a stream becomes dependent on another, stop parallel execution and replan.

## Example

For a launch that needs independent research and asset checks followed by shared implementation, parallelize only discovery. Keep shared edits with one owner, require a distinct evidence packet from each stream, and run one integrated production verification.

Measure success by non-overlapping ownership, critical-path reduction, and whether the complete result passes one final check.

Read [references/SOURCES.md](references/SOURCES.md) when choosing between manager-style orchestration and handoffs.
