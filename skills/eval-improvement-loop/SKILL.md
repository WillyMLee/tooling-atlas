---
name: eval-improvement-loop
description: Diagnose and improve agent quality with traces, explicit success criteria, representative eval cases, and baseline-versus-candidate comparisons. Use for prompt changes, tool-routing failures, regressions, model or reasoning-effort comparisons, and agent workflows that need measurable optimization instead of anecdotal tuning.
---

# Eval Improvement Loop

Improve the earliest material failure. Preserve a stable baseline.

## Workflow

1. Define the outcome before changing the system:
   - task success;
   - required evidence and format;
   - safety and authorization boundaries;
   - latency and cost limits.
2. Collect representative traces. Include the common path, at least one edge case, and a known failure.
3. Locate the earliest material failure across routing, tool selection, arguments, tool result, handoff, synthesis, or final format.
4. Change one major lever: prompt, tool contract, route, model, reasoning effort, memory, or guardrail.
5. Rerun the same cases and compare baseline with candidate.
6. Add the discovered failure as a permanent regression case.

## Grading Order

Gate optimization in this order:

1. correctness and task completion;
2. evidence and instruction adherence;
3. safety and authorization;
4. reliability across cases;
5. latency, calls, tokens, and cost.

Do not accept a cheaper run that fails an earlier gate.

## Example

When an agent finds the correct sources but omits citations, grade the trace and final message separately. If retrieval passes and synthesis fails, tighten the final-output contract rather than changing search. Rerun the same cases and add citation completeness as a regression check.

Read [references/SOURCES.md](references/SOURCES.md) when selecting trace, dataset, or grader methods.
