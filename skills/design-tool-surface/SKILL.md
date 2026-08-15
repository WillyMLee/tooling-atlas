---
name: design-tool-surface
description: Simplify and clarify the tools available to an AI agent by removing overlap, tightening inputs and return shapes, documenting side effects and errors, and testing routing decisions. Use when agents choose the wrong tool, receive bloated outputs, retry unnecessarily, or face ambiguous tools and parameters.
---

# Design Tool Surface

Give every tool one legible job and one predictable contract.

## Workflow

1. Inventory the user intents the agent must route.
2. Map each intent to the smallest required evidence or action.
3. Remove or hide overlapping tools. If two tools remain, state the boundary in both descriptions.
4. Tighten every contract:
   - semantic purpose;
   - required inputs and allowed values;
   - returned fields and types;
   - error and retry behavior;
   - side effects and approval requirements;
   - stop condition.
5. Return only the fields needed for the next decision while preserving provenance and errors.
6. Run representative and adversarial routing cases. Inspect traces and simplify again where selection remains ambiguous.

## Routing Example

For web work, use search or fetch for static semantic retrieval. Reserve browser control for visible interaction, authenticated state, or visual QA. Do not expose several tools that all appear to "read a page" without explaining this boundary.

## Success Checks

- correct tool chosen on the first attempt;
- fewer unnecessary calls and retries;
- smaller result payloads without evidence loss;
- side effects and errors remain visible;
- fallback behavior is deterministic.

Read [references/SOURCES.md](references/SOURCES.md) when revising tool descriptions or measuring routing quality.
