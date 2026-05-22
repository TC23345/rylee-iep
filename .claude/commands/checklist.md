---
description: Work through a specific checklist with Rylee — either a business-level checklist or a per-client IEP advocacy checklist. Reads current state, asks which items to tackle, walks each item, ticks completed, logs blockers. Use to make incremental forward progress on a defined list rather than open-ended planning.
argument-hint: <checklist-name> [<client_id>]
---

# /checklist

Make tangible progress on a defined checklist. Not for open-ended exploration — for ticking boxes.

## Procedure

1. **Resolve which file** based on `$ARGUMENTS`:

   | Argument | File |
   | --- | --- |
   | `services-agreement` | `.claude/skills/intake-process/assets/services-agreement-checklist.md` (template — attorney input) |
   | `iep-advocacy <client_id>` | `workspace/clients/<client_id>/iep-checklist.md` |
   | `entity-setup` | `workspace/business/entity-decisions.md` |
   | `intake-template` | `.claude/skills/intake-process/assets/iep-checklist.md` (template — Tier 2 expansion) |
   | (other) | search `workspace/` and `.claude/skills/*/assets/` for a file whose name matches; if multiple, ask Rylee to disambiguate |

   If no match, list the available checklists and ask.

2. **Read the file**. Identify all checkbox items: lines matching `- [ ]` (open) or `- [x]` (done). The project uses markdown task-list syntax exclusively — if a legacy ballot-box character (U+2610 / U+2611) appears in an older file, convert it to the markdown form as part of the session.

3. **Summarize state**:
   - "Checklist `<name>` — `<N>` done, `<M>` open"
   - List the open items with their numeric index

4. **Ask Rylee** which she wants to work on this session. She can say:
   - A list of indices ("1, 3, 7")
   - "all" (walk every open item)
   - "blocked" (only walk items previously flagged as blocked, to retry)

5. **For each chosen item, in order**:
   a. State the item out loud
   b. Ask "done?" / "in progress?" / "blocked?" / "skip"
   c. If **done**: ask for a one-line note about how (e.g., "EIN obtained 2026-06-10 via IRS direct — # in 1Password"), then change `- [ ]` to `- [x]` and append the note inline:

      ```markdown
      - [x] Obtain EIN — direct via irs.gov, stored in 1Password (2026-06-10)
      ```

   d. If **in progress**: leave `- [ ]`, add an inline note `(in progress — <what's pending>)` and move on
   e. If **blocked**: leave `- [ ]`, add `(BLOCKED: <reason / who we're waiting on>)`. Add the blocker to the file's "Open questions / next steps" section if one exists.
   f. If **skip**: no edits, move on

6. **End-of-session summary**:
   - Items moved to done this session
   - Items still blocked (with who/what they're waiting on)
   - One-line: "Next checklist session: pick up at item `<N>`"

## PII guardrails

- Never write a full student name, district name, EIN, or SSN into a checklist note. Use abbreviations per `.claude/shared/pii-policy.md`.
- If a client checklist note needs to reference a school staffer (e.g., case manager name), use first name + role only (e.g., "Sarah, case mgr") — that's workspace-only and the file is gitignored, but the principle still applies.

## What this command does NOT do

- Does not author new checklist items — adding items is a skill-edit operation (run `/module-debrief` or edit the asset directly)
- Does not generate the underlying work — if the item is "register LLC with IL SoS," this command doesn't walk her through the filing; it just records "done | in progress | blocked." For the actual walkthrough, invoke the `entity-setup` skill.
- Does not communicate with the family or district — it's a workspace tool, not a client-facing one
