# CLAUDE.md — Rylee's IEP Advocacy Workspace

This project is **Rylee Coteus's** Claude Code workspace for her pivot from agency BCBA work into a private-pay IEP advocacy practice. She is enrolled in **PIVOT into IEP Advocacy®** (Dr. Annie / Constance McLaughlin) — Summer 2026 cohort, starts 2026-06-01, 12 weeks, 8 modules.

The directory is organized around the course's 8-module deliverable list. Each module's deliverables are encoded as skills under `.claude/skills/`. Rylee uses Claude Code to walk through those deliverables; Claude uses the skills to give her the IL-specific, BCBA-aware, advocate-side framing without re-explaining context every session.

## Who Rylee is (assume this is given)

- BCBA licensed in Illinois via IDFPR (Behavior Analyst Licensing Act)
- MS, currently Coach + BCBA at NSSEO in Palatine, IL (~3+ years BA experience)
- Comfortable in IEP meetings from the clinician side; **new to the advocate-side framing**
- Full credential/context profile: `profile.md` (repo root)

## File conventions

| Location | What lives here | Tracked in git? |
|---|---|---|
| `modules.md` | Course module/deliverable overview | yes |
| `.claude/` | Skills, commands, shared references | yes |
| `.claude/skills/<skill>/assets/` | **Templates** (source of truth, stamped with `{client_id}`) | yes |
| `workspace/business/*.md` | Rylee's business decisions (name, entity, fees, insurance) | no — gitignored |
| `workspace/clients/<client_id>/` | Per-client populated files (intake, IEP checklist, session log) | no — gitignored |
| `workspace/course/module-<N>-notes.md` | Rylee's per-module takeaways (input to `/module-debrief`) | no — gitignored |

**Editing `assets/` vs `workspace/`**: `assets/` files are the *templates* — edit them when Rylee wants to change the form/structure for all future clients. `workspace/clients/<id>/` files are the *populated copies* — edit them when working with a specific client. Never edit a workspace file thinking it will affect future clients; never edit an asset file thinking it will retroactively update existing client folders.

## Dashboard content conventions

The repo now deploys a root-level Next.js App Router dashboard to https://rylee-iep-production.up.railway.app. Markdown content for each surface lives in well-known paths and is loaded server-side through the Next app:

| Path | Renders to |
|---|---|
| `README.md` | Overview page (`/`) |
| `archive.md` | Archive page (`/archive`) |
| `modules.md` | Course module overview, used for sidebar metadata |
| `content/module-<N>.md` | Per-deliverable section bodies on `/module/<N>`; each `## Heading` defines a section, a `[Paragraph]` body falls back to the three bracketed `CONTEXT_PLACEHOLDERS` |
| `content/skills/<slug>/<lens>.md` | Skill page panels at `/skill/<slug>`; `lens` in `{research, module, expert}` maps to the three tabs |

**Skill lens file structure** (`content/skills/<slug>/<lens>.md`):

- A leading `# Heading` is promoted to **both** the tab label and the panel head title, replacing the generic "Initial Research" / "Module Knowledge" / "Rylee's Expert" defaults.
- An optional `*italic subtitle*` on the next non-empty line replaces the default panel hint (`Pre-module orientation` / `Synthesized from lesson` / `Weighs heaviest downstream`).
- Everything after that renders as the panel body through the React markdown renderer and the `.md-body` design system (tables, `<details>` collapsibles, lists inside blockquotes, etc. are all supported).
- Missing files fall back to the bracketed `[…Context — …]` placeholder text. No error.

This is purely a presentation layer — the source of truth for skill *behavior* is still `.claude/skills/<slug>/SKILL.md`. The `content/skills/<slug>/*.md` files are the rendered narrative surface for the dashboard.

**How to write these pages** (structure, voice, the Taylor-explaining-to-Rylee register, readability rules): `.claude/shared/skill-page-style.md`.

## PII policy

- **Never commit**: full student names, full school district names, parent contact info, EIN, SSN, dates of birth, NPI of minors
- **Construct `client_id`** as `<first-name-lowercase>-<last-initial>-<district-abbr>` (e.g., `marcus-t-d214`). Use only this in committed files.
- **`{client_display_name}`** in templates expands to `<First Name> <Last Initial>.` — never the full last name
- **EIN/SSN**: lives in a password manager, never in any file (committed or workspace). When a skill needs to confirm "EIN obtained," it ticks a checkbox; it does not store the number.
- **District names**: use the official abbreviation (e.g., "D214" not "Township High School District 214")
- Full PII rules: `.claude/shared/pii-policy.md`

## Scope gates (when to invoke the disclaimer)

The disclaimer at `.claude/shared/disclaimer.md` should be invoked whenever Rylee crosses into:

- **Legal questions**: contract terms, late fees, cancellations, dispute resolution, employment classification → attorney
- **Tax questions**: entity tax classification (S-corp election, etc.), deductible structuring, quarterly estimates → CPA
- **IDFPR position questions**: whether IDFPR considers a BCBA-led advocacy entity to require PLLC vs. LLC, scope-of-practice questions → Rylee verifies directly with IDFPR; Claude does not assert
- **Clinical determinations on someone else's child**: eligibility opinions, disability category opinions → Rylee's own clinical judgment + the school team; Claude does not assert
- **Insurance billing**: explicitly out of scope (the course is private-pay only)

Recognize the boundary, invoke the disclaimer, and either defer to the appropriate professional or add the question to a skill's "open questions" list (e.g., `intake-process` services-agreement checklist for attorney questions).

## Skill update workflow

When Rylee finishes a module:

1. She writes her takeaways into `workspace/course/module-<N>-notes.md` (free-form — what was new, what was confirmed, what surprised her)
2. She runs `/module-debrief <N>`
3. The command identifies skills with `module_context: module-<N>` in their frontmatter, proposes specific edits to each based on her notes, applies the edits she approves, and logs the change to `.claude/CHANGELOG.md`
4. If a deliverable has no matching skill yet, the command drafts one with her input

Do not ad-hoc edit skills outside this workflow during active course progression — `/module-debrief` keeps the changelog coherent and prevents drift between what Rylee learned and what the skill encodes.

## Commands

- `/new-client <first-name>` — instantiate `workspace/clients/<id>/` from the intake-process templates
- `/initial-research <N>` — pre-module Initial Research Context via `modules.md` + parallel Perplexity per H2
- `/module-debrief <N>` — post-module takeaway extraction + skill updates
- `/checklist <name>` — work through a specific checklist (course checklist or per-client IEP checklist)
- `/weekly-review` — cohort-paced status: current module, checklist movement, external blockers (CPA/attorney/IDFPR/SoS)

## What this directory deliberately does not do

- Draft binding contracts or fee agreements (those go to her attorney)
- Recommend tax elections (CPA)
- Assert IDFPR's current position on BCBA entity requirements (verification, not assertion)
- Quote insurance premiums or recommend specific carriers as required (carriers change pricing; Rylee verifies)
- Cover insurance billing (private-pay-only course)
- Pre-stub Modules 2–8 skills before Rylee watches those modules
