---
name: context-budget
description: Keep long, tool-heavy tasks focused and resumable by reducing large outputs at the source, retrieving evidence narrowly, and maintaining a compact state packet. Use for broad repository work, logs, research, long browser sessions, or tasks at risk of context loss or repeated reading; stay direct for a handful of short sources.
---

# Context Budget

## Evidence-Adjusted Policy

Policy revision: `context-budget-2026-08-15-r1`

- Default to direct work for a handful of short sources.
- Activate the full workflow for many-source or large-output work, repeated retrieval, or a material handoff/compaction risk.
- Treat this threshold as evidence-responsive, not self-modifying: revise this base file only after a reviewed eval changes the routing decision.

Preserve intent, decisions, provenance, and active state. Reduce bulk—not evidence.

## Workflow

1. Write a working set before broad inspection:
   - concrete outcome;
   - in-scope files or systems;
   - current decisions and unknowns;
   - evidence the final answer must include.
2. Reduce large outputs before they enter the conversation:
   - filter file lists with targeted search;
   - query logs for relevant windows and fields;
   - request structured fields from APIs;
   - use Context Mode tools when they are already available.
3. Keep provenance for every reduction. Record the file, URL, query, line, or record range needed to reopen the source.
4. Reopen exact source material only for implementation or final proof.
5. After a major milestone, update a resume packet with:
   - completed work;
   - active files and routes;
   - decisions and assumptions;
   - verification already run;
   - next safe action.

## Routing Rules

- Prefer narrow search over full-file reads.
- Prefer one structured reduction over repeated summaries.
- Keep user instructions, approvals, failures, and destructive-action boundaries verbatim enough to preserve their meaning.
- Do not chase a token-reduction target when it lowers correctness or makes evidence hard to recover.
- Do not install Context Mode or alter agent configuration unless the user explicitly requests it.

## Completion Check

Before handing off, confirm that a new agent could continue from the resume packet without rereading the whole task and could still locate every important source.

## Example

For a repository audit with hundreds of files and several long logs, keep the objective, active files, open decisions, and required proof in the working set. Search the full sources in place, reopen only the exact lines needed for a decision, and leave a resume packet that names what was verified and what remains.

Measure success by evidence retained, repeated reads avoided, and whether a fresh run can resume without reconstructing the task.

Read [references/SOURCES.md](references/SOURCES.md) when evaluating Context Mode or revising this method.
