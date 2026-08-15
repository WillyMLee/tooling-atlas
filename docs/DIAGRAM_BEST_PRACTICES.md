# Diagram best practices

## Choose by the reader's job

| Reader question | Source-derived packet | Observed in |
| --- | --- | --- |
| Can I see a short process unfolding? | Live Process | WillyMLee.com hero |
| What does each product capability actually do? | Product Workflow | Signal Notes company profiles |
| Why does this product category need to exist? | Problem Narrative | Signal Notes company profiles |
| Where do the alternatives sit relative to one another? | Competitive Radar | Signal Notes overview |
| What useful state should sit beside the hero? | Hero Ledger | Crumb homepage |
| What context is needed while completing this step? | Step Detail | Crumb recipe pages |
| How do I select time and allocate items? | Planning Rail | Crumb weekly planner |

## Content rules

1. Write the one-sentence insight before drawing the diagram.
2. Start from a working source pattern before inventing a new visual grammar.
3. Keep node titles under seven words.
4. Put evidence and caveats in prose adjacent to the diagram.
5. Use a maximum of one accent state unless color carries categorical meaning.
6. Prefer three to five nodes. Split larger systems into multiple views.
7. Preserve the interaction's semantic job when adapting its surface style.

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
