---
description: Cohort-paced weekly status review. Identifies current course module per cohort schedule, summarizes checklist movement, flags external blockers (CPA, attorney, IDFPR, IL SoS), and produces a short status Rylee can bring to the next group call.
---

# /weekly-review

A short, structured pulse-check. Run once a week — Rylee picks the day; this command doesn't enforce a cadence. Outputs a condensed status, not a journal.

## Procedure

1. **Pin the cohort week**. Cohort start: 2026-06-01 (from `.claude/shared/course-context.md`).
   - Week 1 = 2026-06-01 to 2026-06-07
   - Current week = `floor((today - 2026-06-01) / 7) + 1`, clamped to 1–12 (pre-start = "pre-cohort," post-week-12 = "post-cohort")
   - State the week number and which module is the "current" module per a one-module-per-week pacing (Module 1 in week 1, Module 2 in week 2, … Module 8 around week 8; the back four weeks are catch-up + implementation per Dr. Annie's format).

2. **Scan recent activity**:
   - `.claude/CHANGELOG.md` — entries since the last `## YYYY-MM-DD` matching last week or later
   - `workspace/course/module-<N>-notes.md` for the most recently touched module
   - `workspace/business/*.md` — any file with `last_updated` within the past 7 days
   - `workspace/clients/*/` folders (existence only — do NOT read client file contents into the review unless Rylee asks)

3. **Build the status** in this exact shape:

   ```markdown
   # Weekly review — <YYYY-MM-DD> (cohort week <N>)

   ## Current module
   - Module <N>: <title> — <watched | in progress | not started>

   ## Forward progress this week
   - <one-line per skill update, checklist movement, decision made>

   ## Blocked / waiting on
   - <one-line per item> — who/what we're waiting on, since when

   ## Open questions for the next group call
   - <pulled from workspace/course/module-<N>-notes.md "Questions for the next group call" section>

   ## Live calls coming up
   - <next 2nd Friday or 4th Tuesday, whichever is sooner>

   ## Next focus
   - <Rylee's one-sentence pick for the coming week>
   ```

4. **Ask Rylee** to confirm the "Next focus" line — that's the only thing she has to type. Everything else is pulled from files.

5. **Save** the review to `workspace/course/weekly-reviews/<YYYY-MM-DD>.md`. Create the `weekly-reviews/` subfolder if absent.

## Live call dates

The next live calls always fall on the 2nd Friday or 4th Tuesday of the month. Compute the next one from today's date:
- 2nd Friday: the Friday in week 2 of the month (the Friday between the 8th and 14th)
- 4th Tuesday: the Tuesday in week 4 of the month (the Tuesday between the 22nd and 28th)

State both times in EST per `shared/course-context.md`:
- 2nd Fri: 10:30–12:00 EST
- 4th Tue: 14:30–16:00 EST

## What this command does NOT do

- Does not generate work — it surveys, it doesn't prescribe
- Does not edit skills — that's `/module-debrief`
- Does not write to client folders — clients are not a weekly-review concern; this is about Rylee's pace through the course
- Does not nag — if nothing moved, the review just says "nothing moved this week" and that's a legitimate status
