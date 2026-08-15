# Tooling Atlas working agreements

- Treat `skills/` as the canonical reusable agent modules and `catalog/module-registry.json` as their evaluation registry.
- Keep each `SKILL.md` concise; put historical results, dashboard copy, and architecture notes outside the skill package.
- Never label a module proven from example or anecdotal data. Quality-gated baseline-versus-candidate evidence is required.
- During a controlled eval, assign the module and variant before the run. Do not infer attribution from a prompt, transcript, or tool pattern after the fact.
- Keep activity telemetry separate from eval artifacts: hooks record metadata, while the eval harness records scores and deliberate test prompts.
- Keep Control Tower telemetry privacy-minimal. Do not collect prompts, messages, tool arguments, tool output, credentials, or file contents.
- Run `npm run check` after changing JavaScript, JSON, skills, or observability files.
- Preserve source attribution when extracting interface patterns from another project.
