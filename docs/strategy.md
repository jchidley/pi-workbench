# pi-workbench strategy

`pi-workbench` is a vendor-neutral workflow layer for `pi-coding-agent`.

## Market assumption

Model providers and agent frontends have different incentives:

- Anthropic can make the best experience live inside its own frontend/runtime.
- OpenAI is currently friendly to external tooling, but platform incentives can change.
- Low-cost model providers make inference cheap, but do not provide Jack's workflow.
- Pi's advantage is that workflows, tools, memory, and enforcement are user-owned.

Therefore `pi-workbench` keeps durable value in local, versioned artifacts rather than in any model provider's memory or frontend.

## Architecture principle

```text
human workflow
  -> pi harness
  -> pi-workbench evidence / wiki / lattice / tasks / checks
  -> replaceable model providers
  -> repo-local code and data
```

Models are execution engines. The workflow layer is the asset.

## Design rules

1. **Repo-local truth** — if it matters, it lives in Git as Markdown, code, scripts, or raw evidence.
2. **Evidence before memory** — agent conclusions start as evidence or synthesis; only promoted facts become implementation truth.
3. **Model-agnostic** — no required Claude/OpenAI/Gemini-specific memory or frontend feature.
4. **Local-first automation** — use Markdown work queues and scripts before SaaS trackers.
5. **Executable enforcement** — checks must run outside the model and fail loudly.
6. **Pass quiet, fail loud** — successful automatic checks should not clutter chat; failures must be fed back to the agent.
7. **Enforce seams, not every thought** — strict for code-affecting truth and provenance, flexible for exploratory wiki work.

## Knowledge layers

- `raw/` — immutable evidence.
- `wiki/` — flexible LLM-maintained synthesis.
- `lattice/` — checked implementation/project truth.
- `work/` — local work queue and state machine.

## Provider independence

`pi-workbench` should work with Claude, Codex, Gemini, DeepSeek, Qwen, GLM, local models, and future providers through pi. It should not rely on hidden provider memory for correctness.
