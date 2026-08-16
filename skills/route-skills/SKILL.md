---
name: route-skills
description: Choose the smallest useful set of Codex skills from the task shape, available skill descriptions, authorization boundaries, and measured routing evidence. Use when several skills could apply, module activation is ambiguous, a multi-stage workflow needs ordered specialists, or Codex should explain why it is working directly instead of loading more skills.
---

# Route Skills

Route first; load specialist instructions only after selection.

## Workflow

1. Honor any skill the user explicitly names. Routing may add a necessary companion but never suppress an explicit skill.
2. Describe the task shape without copying sensitive content:
   - bounded or broad;
   - coupled, independent, browser-visible, or multi-part;
   - read-only or state-changing;
   - one-off, measured improvement, or repeated workflow.
3. Start with direct work. Activate a skill only when its description supplies a method the task otherwise lacks.
4. Choose at most one specialist per distinct role. Remove overlapping skills and state the boundary when two remain.
5. Order selected skills by phase: route, prepare, execute, then improve. Do not run improvement skills as execution overhead.
6. Preserve authorization. A routed skill cannot expand allowed tools, writes, external communication, deployment, or delegation.
7. Return the routing packet before substantial work when the choice is material.

## Routing Packet

Return only:

- `mode`: direct, batched, specialist, or orchestrated;
- `use_now`: ordered skills and one reason each;
- `after_completion`: evaluation or implementation skills, if any;
- `skip`: plausible skills deliberately omitted and why;
- `activation`: task shape, activation mode, activation reason, and known thresholds;
- `stop_condition`: when to re-route instead of adding more skills.

Keep the packet under twelve lines unless the user asks for the decision model.

## Atlas Policy

For Atlas modules, read [references/routing-policy.json](references/routing-policy.json). Use the bundled router for repeatable decisions:

```sh
node scripts/route.mjs --scope multi --work-shape browser --improvement skill
```

Treat thresholds as provisional. Measured routing revisions may change them; do not infer universal gains from one pilot.

## Boundaries

- Prefer direct work for small, tightly coupled tasks.
- Use orchestration only for a genuine dependency graph, not merely many steps.
- Keep shared mutable targets with one owner.
- Keep evaluation and skill implementation after task completion unless the task explicitly is evaluation or skill authoring.
- Do not claim a skill improved quality, time, tokens, or cost without matched evidence.

