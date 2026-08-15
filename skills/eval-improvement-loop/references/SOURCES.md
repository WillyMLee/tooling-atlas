# Sources

- [OpenAI: evaluate agent workflows](https://developers.openai.com/api/docs/guides/agent-evals) — use traces for workflow debugging, then datasets and eval runs for repeatable comparisons.
- [OpenAI: trace grading](https://developers.openai.com/api/docs/guides/trace-grading) — grade the end-to-end log of decisions, tool calls, and handoffs to identify targeted improvements.
- [Google Agents CLI: evaluation guide](https://google.github.io/agents-cli/guide/evaluation/) — practical eval-fix loop, trajectory metrics, dataset expansion, and baseline comparison.

Treat model-graded output as one signal. Use deterministic checks for schemas, required fields, citations, and side-effect boundaries whenever possible.
