---
name: workbench
description: >-
  Maintain pi-workbench repos by ingesting evidence, updating wiki synthesis,
  updating enforced lattice implementation docs, managing local Markdown tasks,
  and running checks.
---

# pi-workbench Skill

Use this skill when a task touches durable project knowledge, source ingestion, evidence review, local work items, or implementation documentation.

`pi-workbench` is the workflow layer; model providers are replaceable execution engines. Keep durable truth in repo-local files, not hidden provider memory. Prefer cheap models for reversible bulk maintenance, mid models for routine implementation, and premium models for high-risk judgement.

## Layers

- `raw/` is immutable evidence: transcripts, manuals, measurements, logs, session JSONL extracts, web snapshots.
- `wiki/` is flexible LLM-maintained synthesis: concepts, field notes, source summaries, open questions.
- `lattice/` is enforced implementation/project truth: architecture, domain constraints, device interfaces, data model, test specs.
- `work/` is a local Markdown work queue: `inbox/`, `active/`, `review/`, `done/`.

## Operating rules

Before implementation work:

1. Read relevant `lattice/` pages.
2. Read relevant `wiki/` pages if RF/domain/source understanding matters.
3. If the task references prior sessions, import or read the session JSONL and preserve the path as evidence.

After work:

1. Update `lattice/` for code-affecting changes: architecture, CLI behaviour, file formats, device assumptions, tests, constraints.
2. Update `wiki/` for source synthesis, field observations, learning, or interpretation changes.
3. Preserve provenance: source-derived wiki pages should include a `## Sources` section with local raw paths and external URLs.
4. Run `pi-workbench check` and the repo's `scripts/check.sh` if present.
5. Do not declare completion if hard checks fail.

## Enforcement philosophy

Enforce seams, not every thought.

Hard-enforce implementation truth, broken links, missing source provenance, and test specs. Keep exploratory wiki notes lightweight. Automatic checks should be pass-quiet and fail-loud: do not clutter chat with successful guard output, but fix failures before completion.

## Wikilinks

Use the Obsidian/Foam-compatible subset:

```text
[[page]]
[[page#Heading]]
[[path/to/page#Heading]]
[[page|Alias]]
[[page#Heading|Alias]]
```

Avoid embeds (`![[...]]`), block IDs (`[[page^block-id]]`), reversed aliases (`[[alias|page]]`), and Logseq-style `[Alias]([[page]])` links in portable project truth.

## Code refs

Use implementation backlinks where useful:

```rust
// @lattice: [[measurement-model#Sweep]]
```

The checker validates `@lattice` references against `lattice/` headings.

## Tasks

Task files are Markdown with optional YAML frontmatter. A good task states:

- goal
- inputs/evidence
- expected outputs
- done criteria
- required checks

Use `pi-workbench task next` to select the next local task. Move finished tasks only after checks pass.
