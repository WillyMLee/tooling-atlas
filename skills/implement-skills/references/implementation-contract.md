# Skill implementation contract

## Intake

- Concrete requests that should trigger the skill
- Similar requests that should not trigger it
- Canonical source and intended installation scope
- Required output and authority boundaries
- Existing skills with adjacent responsibilities

## Package

- `SKILL.md` with only `name` and `description` in frontmatter
- `agents/openai.yaml` with matching display metadata and a `$skill-name` default prompt
- `scripts/` only for deterministic repeated operations
- `references/` only for details that are conditionally needed
- `assets/` only for files copied into final outputs

Do not add a README, changelog, installation guide, or duplicate reference material inside the skill.

## Validation evidence

- Structural validator passes
- Every bundled script runs successfully on a representative fixture
- Common, edge, and known-failure cases are defined
- Trigger and non-trigger routing cases are tested
- Installation or linking is verified without overwriting unrelated personal skills
- Performance claims remain unmeasured until matched runs exist

## Registry handoff

Record version, maturity, evidence status, hypothesis, primary metric, guardrails, events, orchestration role, partners, and any reviewed policy revision.

