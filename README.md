# pi-workbench

Evidence-first Markdown workbench for `pi-coding-agent`.

`pi-workbench` combines two useful patterns:

- Karpathy-style LLM wiki: raw sources are preserved, agents maintain a flexible Markdown synthesis layer.
- lat.md-style enforcement: implementation-critical knowledge is checked with links, section structure, and optional code/test backlinks.

It is designed for Jack-style pi workflows: practical tasks, original-source provenance, local automation, no mandatory SaaS ticket frontend.

## Project shape

A repo using pi-workbench contains:

```text
raw/        immutable evidence: transcripts, measurements, manuals, session extracts
wiki/       flexible RF/domain/source synthesis maintained by agents
lattice/    enforced implementation/project knowledge graph
work/       local Markdown task queue
```

## Install locally in a project

During development, add this package to a project-local pi settings file:

```json
{
  "packages": ["/home/jack/github/pi-workbench"]
}
```

Then run `/reload` in pi.

## CLI

```bash
pi-workbench init
pi-workbench check
pi-workbench status
pi-workbench task next
pi-workbench task done <task-file>
pi-workbench session import <session.jsonl>
```

## Default guard

The guard is implemented as a pi extension event handler, not as a separate item in pi's startup list. You will see only `workbench` under `[Extensions]`; the hook is inside that extension.

When loaded as a pi extension in a repo containing `.workbench/config.toml`, pi-workbench installs an `agent_end` guard:

1. run `./scripts/check.sh` when present, otherwise `pi-workbench check`
2. if checks pass, set the workbench status to `guard passed` and record a hidden pass message
3. if checks fail, set the workbench status to `guard failed` and send the failure back to the agent as a follow-up user message

On session start it also shows `workbench: guard active` in the UI status area and notifies that the guard is active.

Disable temporarily with:

```bash
PI_WORKBENCH_GUARD=0 pi
```

## Influences

`pi-workbench` is original code, but intentionally borrows ideas from several projects and patterns:

- [`1st1/lat.md`](https://github.com/1st1/lat.md) — enforced Markdown knowledge graph, checked links, implementation backlinks, and test-spec coverage ideas.
- [Karpathy's LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) — immutable raw sources, LLM-maintained wiki synthesis, index/log files, and compounding source ingestion.
- [`openai/symphony`](https://github.com/openai/symphony) — work-item-driven agent automation, repeatable checks, and orchestration concepts. `pi-workbench` uses local Markdown tasks instead of Linear or another ticket frontend.
- [`NateBJones-Projects/OB1`](https://github.com/NateBJones-Projects/OB1) — cross-tool memory and provenance ideas. `pi-workbench` currently stays filesystem/Markdown-first rather than database-backed.

No source code has been copied from these projects.

## Philosophy

Enforce seams, not every thought.

Hard checks are for broken links, missing source provenance, implementation references, and task completion. Exploratory wiki notes stay lightweight and useful.
