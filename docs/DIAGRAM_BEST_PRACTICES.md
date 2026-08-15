# Diagram best practices

## Choose by relationship

| Reader question | Use | Avoid |
| --- | --- | --- |
| What happens first, next, and last? | Flow stack | A free-form system map |
| What connects to the central platform? | System map | A dense process flow |
| How does an operating change create value? | Metric bridge | Unrelated KPI cards |
| Which path should we choose? | Decision fork | A generic comparison table |
| How did we form this working view? | Evidence chain | Hidden chain-of-thought or unsupported certainty |

## Content rules

1. Write the one-sentence insight before drawing the diagram.
2. Keep node titles under seven words.
3. Put evidence and caveats in prose adjacent to the diagram.
4. Use a maximum of one accent state unless color carries categorical meaning.
5. Prefer three to five nodes. Split larger systems into multiple views.
6. Highlight with brackets, rules, or labels before filling an entire card with color. Preserve the reading hierarchy when the accent changes.

## Layout rules

- The connector should terminate at a node edge, never drift behind text.
- Node padding is part of the component API; do not tune each card independently.
- A horizontal flow must become a vertical flow below its readable minimum width.
- Spatial system maps should become ordered lists on mobile.
- Never scale an entire diagram down with `transform: scale()`.

## Accessibility

- Preserve a meaningful DOM order.
- Use `figure` and `figcaption` when the diagram has a title or explanation.
- Do not encode state through color alone.
- Keep text contrast at WCAG AA levels.
- Disable decorative movement under `prefers-reduced-motion`.
- Make the complete relationship visible without hover.

## Motion

Motion may:

- reveal order;
- show state changing;
- maintain object continuity;
- direct attention after a user action.

Motion should not:

- compensate for unclear layout;
- continuously animate every connector;
- delay access to labels;
- change the meaning for reduced-motion users.

## Review checklist

- [ ] The reader question and diagram type match.
- [ ] The insight is legible in the static state.
- [ ] Labels remain readable at 320 CSS pixels.
- [ ] Focus and reading order are logical.
- [ ] Light and dark themes preserve emphasis.
- [ ] Long content wraps without changing connector alignment.
- [ ] Empty, two-node, and maximum-node states have been tested.
