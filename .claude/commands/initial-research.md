---
description: Run pre-module Initial Research Context for a course module. Extracts the module block from modules.md as the research prompt, runs one parallel Perplexity query per dashboard H2 (from content/module-N.md), and returns synthesized introductory paragraphs with per-sentence citations. Use before Rylee watches Module N to fill the Initial Research Context placeholders.
argument-hint: <module-number>
---

# /initial-research

Pre-module research workflow. Invokes the **`initial-research`** skill (`.claude/skills/initial-research/`). Reads the official course outline for Module N, researches each deliverable H2 in parallel, and returns citation-backed introductory context in chat.

This command fills **Initial Research Context only**. It does not write Module Knowledge Context (post-lesson transcript) or Rylee's Expert Context.

## Procedure

Read `.claude/skills/initial-research/SKILL.md` and the step-matched **examples** before executing:

| Step | Example |
| --- | --- |
| 1–5: prompt, queries, Perplexity | [examples/01-workflow-and-queries.md](../skills/initial-research/examples/01-workflow-and-queries.md) |
| 5: raw API output | [examples/02-perplexity-raw-responses.md](../skills/initial-research/examples/02-perplexity-raw-responses.md) |
| 6: final chat delivery | [examples/03-final-synthesis.md](../skills/initial-research/examples/03-final-synthesis.md) |

### 1. Parse module number

- Read `$ARGUMENTS` as integer `N`. Must be 1–8.
- If missing or invalid, ask which module to research.

### 2. Load context (read-only)

| File | Why |
| --- | --- |
| `modules.md` | Source of `<initial_research_prompt>` |
| `content/module-<N>.md` | H2 headings — one research unit per `##` section |
| `.claude/shared/rylee-profile.md` | BCBA, IL, advocate-side framing |
| `.claude/shared/disclaimer.md` | Gates for legal/tax/IDFPR claims |

If `content/module-<N>.md` is missing, derive research units from bullets under **Inside this module, you will:** in the `modules.md` excerpt. Tell the user the content file is missing.

### 3. Extract `<initial_research_prompt>` from `modules.md`

Match the extraction pattern in **example 01** (Module 1).

- Start: `## Module <N>:` through the deliverable bullets
- End: next `---` or next `## Module <M>:`

Present wrapped as:

```markdown
<initial_research_prompt>
## Module <N>: <title>

<intro>

**Inside this module, you will:**

- ...
</initial_research_prompt>
```

Confirm with the user before running Perplexity if they are in the loop.

### 4. Map research units to H2 headings

From `content/module-<N>.md`, collect each `## <heading>`. Pair with `modules.md` bullets by index when counts match.

### 5. Build and run Perplexity queries (parallel)

Match query style and execution rules in **example 01** §2 and raw output shape in **example 02**.

- Use **Perplexity MCP** (`perplexity_ask`; `search_context_size`: **medium**)
- One parallel batch — all H2s at once
- Retry once on timeout

### 6. Synthesize and deliver in chat

Match **example 03** exactly for structure:

- One `## <H2>` per heading from `content/module-<N>.md`
- Introductory paragraph; `[n]` after every sentence; works cited reset per heading
- Synthesis rules in example 03 and `disclaimer.md`

**Default: post the full synthesis in this chat.** Do not write any file.

### 7. Save to workspace (explicit opt-in only)

**Do not save unless the user explicitly asks** (e.g. "save it," "write to workspace," "persist this").

When explicitly requested:

- Write `workspace/course/module-<N>-initial-research.md` (gitignored)
- YAML frontmatter: `module`, `generated_on`, `source`
- Include `<initial_research_prompt>` + synthesized sections
- Do not edit `content/module-<N>.md` unless they separately ask to paste into the dashboard

### 8. End-of-run summary

- Module N title, H2 list, Perplexity retries if any
- State clearly: **"Delivered in chat only"** unless a workspace save was explicitly requested
- Remind: review before replacing `[Initial Research Context ...]` placeholders on the dashboard

## Things to NOT do

- Do not save to `workspace/` by default — chat delivery only
- Do not edit `content/module-*.md`, `index.html`, or other skills without explicit approval
- Do not run `/module-debrief` (post-module)
- Do not substitute lesson transcript content
- Do not commit workspace output to git
