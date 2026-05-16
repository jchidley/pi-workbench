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

## Cost and capability direction

Assume model capability commoditises faster than workflow quality.

Current frontier US models are already good enough for most coding and documentation work, but their providers have incentives to keep the best workflow features inside their own frontends or premium APIs. Chinese and other low-cost labs are likely to keep compressing the price of good-enough coding, long-context summarisation, and bulk maintenance.

Design implication: `pi-workbench` should support a model portfolio rather than a single preferred model. A repo can still choose a practical current default, such as an OpenAI subscription, while keeping the workflow portable if provider economics or terms change.

```text
cheap models
  -> bulk session import, source triage, wiki index maintenance, repetitive checks

mid models
  -> routine implementation, tests, synthesis, lattice updates

premium models
  -> hard architecture, subtle debugging, high-risk review, final judgement
```

Checks and promotion rules must remain model-independent. A cheap model may draft memory; only evidence, review, and checks decide what becomes instruction-grade project truth.

## Escalation policy

Workflows should make escalation explicit:

- Use cheap models for reversible, evidence-preserving transformations.
- Use mid models for ordinary implementation with tests.
- Use premium models when failure cost is high, ambiguity remains after evidence review, or architectural direction is being set.
- Never rely on model reputation alone; require local evidence and executable checks.
