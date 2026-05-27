---
name: initial-research
description: Runs pre-module Initial Research Context for a PIVOT course module — extracts the module block from modules.md, parallel Perplexity research per dashboard H2, citation-backed synthesis. Use when Taylor or Rylee asks for initial research, pre-module context, or to run /initial-research. Pairs with the /initial-research command. Does not save to workspace or edit the dashboard unless explicitly requested.
---

# initial-research

Cross-module skill for the **Initial Research Context** placeholder on each dashboard H2 (below the divider on module pages). Invoked via **`/initial-research <N>`** — see `.Codex/commands/initial-research.md` for the full procedure.

## Research sequence (with Module 1 examples)

| Step | What happens | Example file |
| --- | --- | --- |
| 1 | Extract `<initial_research_prompt>` from `modules.md`; map H2s from `content/module-<N>.md`; build queries | [examples/01-workflow-and-queries.md](examples/01-workflow-and-queries.md) |
| 2 | Run Perplexity in parallel (one call per H2); capture raw responses | [examples/02-perplexity-raw-responses.md](examples/02-perplexity-raw-responses.md) |
| 3 | Synthesize introductory paragraphs; citation per sentence; works cited per heading; **deliver in chat** | [examples/03-final-synthesis.md](examples/03-final-synthesis.md) |
| 4 (optional) | Save to `workspace/course/module-<N>-initial-research.md` **only if user explicitly asks** | — |

## I produce

- `<initial_research_prompt>` block (from `modules.md` for Module N)
- Parallel Perplexity research aligned to each H2 in `content/module-<N>.md`
- Final synthesis in the shape of `examples/03-final-synthesis.md` — returned in chat by default

## I do not produce

- **Module Knowledge Context** — post-lesson; requires Dr. Annie's transcript after Rylee watches the module
- **Rylee's Expert Context** — Rylee's direct input only
- **Automatic file writes** — no save to `workspace/` or edits to `content/module-*.md` unless the user explicitly requests persistence after reviewing the chat output
- Legal, tax, or IDFPR assertions — gate per `.Codex/shared/disclaimer.md`

## Before running

Read:

1. `.Codex/commands/initial-research.md` — canonical procedure
2. `.Codex/shared/rylee-profile.md` — query framing
3. `examples/03-final-synthesis.md` — target output format
4. `modules.md` + `content/module-<N>.md` — live inputs for the requested module

## Output default

**Chat only.** Do not write `workspace/course/module-<N>-initial-research.md` unless the user says to save, persist, or write to workspace.
