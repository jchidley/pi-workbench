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

When loaded as a pi extension in a repo containing `.workbench/config.toml`, pi-workbench runs a guard at the end of each agent prompt:

1. run `./scripts/check.sh` when present, otherwise `pi-workbench check`
2. if checks pass, record a hidden pass message
3. if checks fail, send the failure back to the agent as a follow-up user message

Disable temporarily with:

```bash
PI_WORKBENCH_GUARD=0 pi
```

## Philosophy

Enforce seams, not every thought.

Hard checks are for broken links, missing source provenance, implementation references, and task completion. Exploratory wiki notes stay lightweight and useful.
