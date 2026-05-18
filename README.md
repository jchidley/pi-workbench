# pi-workbench

Evidence-first Markdown workbench for `pi-coding-agent`.

`pi-workbench` combines two useful patterns:

- Karpathy-style LLM wiki: raw sources are preserved, agents maintain a flexible Markdown synthesis layer.
- lat.md-style enforcement: implementation-critical knowledge is checked with links, section structure, and optional code/test backlinks.

It is designed for Jack-style pi workflows: practical tasks, original-source provenance, local automation, no mandatory SaaS ticket frontend, and replaceable model providers. The durable asset is the workflow/evidence/check layer; models are swappable compute. See [docs/strategy.md](docs/strategy.md).

## Project shape

A repo using pi-workbench contains:

```text
raw/        immutable evidence: YouTube/Pi transcripts, measurements, manuals, session extracts, link snapshots
wiki/       flexible domain/source synthesis: concepts, source notes, reviews, curated links/playlists, questions
lattice/    enforced implementation/project knowledge graph
work/       local Markdown task queue
```

Transcripts, browser-history exports, and raw link dumps are evidence. They are promoted into `wiki/` only when they become durable knowledge, useful synthesis, curated links/playlists, workflow reviews, session-derived "what happened / what next" notes, field observations, or open questions.

Promote from `wiki/` to `lattice/` only when the knowledge affects implementation truth: architecture, data model, CLI behaviour, device assumptions, constraints, file formats, or tests. `lattice/` is pi-workbench's current canonical truth layer; `lat.md` is the preferred future/checkable successor model. Do not run both in one project unless deliberately migrating.

Markdown links use an Obsidian/Foam-compatible wikilink subset:

```text
[[page]]
[[page#Heading]]
[[page|Alias]]
[[page#Heading|Alias]]
```

Avoid embeds, block IDs, and Logseq/Dendron-specific alias forms for portable project truth.

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
pi-workbench youtube playlist --ids data/playlists/example.ids --title "Example Study Playlist"
```

Repeated YouTube/transcript curation is a built-in workflow, not a separate system. See [docs/workflows/youtube-transcript-playlists.md](docs/workflows/youtube-transcript-playlists.md) for the transcript-first pattern: discover, download/reuse transcripts, rank locally, store ordered IDs in `data/playlists/*.ids`, generate playlist notes, then create real YouTube playlists only when final.

## Default guard

The guard is implemented as a pi extension event handler, not as a separate item in pi's startup list. You will see only `workbench` under `[Extensions]`; the hook is inside that extension.

When loaded as a pi extension in a repo containing `.workbench/config.toml`, pi-workbench installs an `agent_end` guard:

1. run `./scripts/check.sh` when present, otherwise `pi-workbench check`
2. if checks pass, set the workbench status to `guard passed` and record a hidden session entry
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

Jack's usual source-to-wiki flow is project-local: collect evidence in `raw/`, synthesize only the useful parts into `wiki/`, and promote only code-affecting truth into `lattice/`. Prefer Markdown, `rg`, and small scripts before adding databases, embeddings, MCP servers, scheduled ingestion, or APIs.
