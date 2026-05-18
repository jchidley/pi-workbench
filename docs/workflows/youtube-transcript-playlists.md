# YouTube transcript playlist workflow

Use this when a project repeatedly needs YouTube/video material turned into a useful study playlist or curated learning path.

This is a pi-workbench workflow, not a separate knowledge system. The durable project artifacts are the transcript evidence, ordered `.ids` files, playlist rationale, and any promoted wiki synthesis.

## Workflow

1. Discover candidate videos with web search, channel/playlist pages, or `yt-dlp ytsearch`.
2. Download or reuse transcripts before judging relevance.
3. Search and rank locally with `rg`, source metadata, and LLM judgement.
4. Store the stable ordered video IDs in `data/playlists/<name>.ids`.
5. Generate a Markdown playlist note and temporary review URL.
6. Review with `https://www.youtube.com/watch_videos?video_ids=...`.
7. Create a real YouTube playlist only when the order is stable.
8. If desired, open the final playlist in the YouTube app and manually tap Download.

## Project layout

```text
~/transcripts/...              reusable local transcript archives
raw/transcripts/               copied/cited transcript evidence when project-specific
data/playlists/*.ids           canonical ordered video ID lists
docs/*playlist*.md             generated playlist notes, rationale, review/final URLs
wiki/                          durable learning promoted from the videos
lattice/                       only if video-derived knowledge affects implementation truth
```

## Generate a playlist note

Create `data/playlists/example.ids` with one YouTube video ID per line. Blank lines and `#` comments are ignored.

Then run:

```bash
pi-workbench youtube playlist \
  --ids data/playlists/example.ids \
  --title "Example Study Playlist"
```

This writes:

```text
docs/example-playlist.md
```

The generated note includes:

- the source `.ids` file
- a temporary `watch_videos` review URL
- individual video links
- a placeholder for the final YouTube playlist URL
- reminders about YouTube app download limitations

Use `--out` to choose a different output path:

```bash
pi-workbench youtube playlist \
  --ids data/playlists/qmx-nanovna.ids \
  --title "QMX NanoVNA Field Antenna Study" \
  --out docs/qmx-nanovna-field-antenna-playlist.md
```

If a final playlist already exists, record it:

```bash
pi-workbench youtube playlist \
  --ids data/playlists/qmx-nanovna.ids \
  --title "QMX NanoVNA Field Antenna Study" \
  --final-url "https://www.youtube.com/playlist?list=..."
```

## YouTube API rule

Use the official YouTube Data API only for final account playlist creation.

Avoid repeated replace/delete/reinsert cycles because quota is limited. Prefer creating a fresh final playlist from a stable `.ids` file, then manually deleting old or partial playlists.

## Promotion discipline

Transcripts and generated playlists are evidence/curation artifacts. Promote into `wiki/` only when they create durable learning, a curated annotated list, a workflow review, or open questions.

Promote into `lattice/` only when the material changes implementation truth: data model, device assumptions, CLI behaviour, file formats, constraints, or tests.
