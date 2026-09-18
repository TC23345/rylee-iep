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

## Web app: Rylee's Case Log

The root-level Next.js app (deployed to https://rylee-iep-production.up.railway.app) is **no longer the course dashboard**. It is a daily case log for Rylee's day job, modelled on the Excel workbook she kept by hand: a "Daily Case Counts" sheet plus one sheet per month with rows of Date · Case # · Case Type · Start · End · Duration · Notes. `README.md` describes every feature and has the file map.

- **Branches and deploy.** `master` is the only branch that matters; Railway deploys every push to it. `nextjs-rebuild` is kept fast-forwarded to master for history. Day-to-day work happens in the worktree `.claude/worktrees/case-log` on branch `case-log-design`, then fast-forward merged into master and pushed.
- **Data.** Rows live in MongoDB `case_entries`; added or renamed tabs in `month_tabs`; `audit_events` records writes. Everything is scoped by `orgId`, which is the Clerk user id. Server actions under `app/actions/` are the only write path. Rylee's log holds her real rows; Taylor's own log holds synthetic demo data (July to September 2026) imported from `docs/import-samples/`.
- **Users.** Rylee is the data owner. Taylor is the admin (`RYLEE_ADMIN_USER_IDS`) and browses her log through **View as** inside the Clerk avatar menu, never by writing under his own id. Never backfill or write rows under Taylor's id when the intent is Rylee's data.
- **Case types.** Eleven types in `lib/entry-schema.ts` (case work vs other time). A row counts as a case only when it has a case number and is not lunch; `lib/entries.ts` mirrors that rule in its aggregates. Note templates per type live in the same file.
- **Importing spreadsheets.** `docs/import-format.md` is the contract; `docs/import-samples/` are the reference files. When converting one of Rylee's unstructured sheets, produce a workbook matching them exactly, then use Import Excel on a month tab. The importer dedupes on day + case number + start time.
- **UI conventions.** Rows edit inline and save on blur. Delete is hold-to-delete with an Undo toast, no confirm dialog. The Next button and submit button in the add dialog must stay separately keyed (React reuses the node otherwise and a real click submits). The type legend and the day log belong on the month pages; the home "Calendar" tab is tiles and the month card, and the daily sheet is its own "Case Counts" tab (`/counts`). Colours and fonts follow `docs/acentra-design.md`; no hex literals in components.
- **Local quirks.** `MONGODB_DNS_SERVERS` in `.env.local` is required on this Windows machine. Turbopack can serve stale CSS after `globals.css` edits; restart the dev server with `.next` removed. Sign an automation browser in with a Clerk sign-in token, never Google OAuth.
- The markdown files (`modules.md`, `content/`, `archive.md`) are no longer rendered by the app; they remain as inputs to the Claude harness below.

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
