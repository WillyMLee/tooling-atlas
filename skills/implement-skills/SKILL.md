---
name: implement-skills
description: Create, update, validate, install, and register reusable Codex skills from repeated workflows or explicit user requests. Use when a successful operating pattern should become a SKILL.md package, an existing skill needs evidence-backed revision, skill metadata or resources are stale, or Atlas should turn a workflow into a testable personal capability.
---

# Implement Skills

Turn a proven or explicitly requested workflow into the smallest maintainable skill package.

## Workflow

1. Define concrete trigger examples, non-trigger examples, useful output, safety boundaries, and the canonical owner.
2. Search existing skills before creating one. Update the closest skill when the job and trigger overlap materially; create a new skill only for a distinct reusable capability.
3. Separate the task result from the reusable method. Never package private content, credentials, transient paths, or project-specific facts unless the user explicitly wants a project-local skill.
4. Initialize new packages with the available skill-creation tooling. Use lowercase hyphenated names and create only resources the workflow needs.
5. Write concise frontmatter. Front-load the job, trigger words, and boundaries in `description`; keep procedural detail in the body and large specifics in one-level references.
6. Add deterministic scripts only for repeatable, fragile operations. Run every added script on a representative fixture.
7. Validate structure and Atlas contracts. Run `node scripts/audit-skill.mjs <skill-path>` plus the available official skill validator.
8. Forward-test representative, edge, and known-failure cases without leaking the expected answer. Keep results labeled as planned until real runs exist.
9. Install or link the skill only when authorized. Report the canonical source, installed location, version, and whether a new Codex task is required for discovery.
10. Register activation fields and an eval contract. Revise routing guidance only after reviewed evidence.

## Decision Gates

Read [references/implementation-contract.md](references/implementation-contract.md) when creating or materially revising a skill.

Do not ship while any gate is unresolved:

- trigger description is ambiguous or overlaps another skill;
- side effects or authorization boundaries are missing;
- bundled scripts are untested;
- UI metadata does not match `SKILL.md`;
- validation fails;
- measured claims lack evidence.

## Handoff

Return:

- skill name, version, and canonical path;
- trigger and explicit non-trigger;
- files created or changed;
- validation and forward-test status;
- install/link status;
- next eval needed before promotion.

