---
description: Instantiate a new client folder under workspace/clients/ from the intake-process templates. Stamps client_id, client_display_name, and today's date into the asset frontmatter placeholders. Use after Rylee signs a new engagement, before the first paid session.
argument-hint: <first-name> [<last-initial>] [<district-abbr>]
---

# /new-client

You are setting up the per-client workspace folder for Rylee's new advocacy client. The skill `intake-process` defines the templates; this command instantiates them.

## Procedure

1. **Parse arguments**. Acceptable forms:
   - `/new-client Marcus` → ask Rylee for last initial and district abbreviation
   - `/new-client Marcus T` → ask Rylee for district abbreviation
   - `/new-client Marcus T D214` → all three provided, no follow-up needed

2. **Construct `client_id`** per `.claude/shared/pii-policy.md`: lowercase, hyphen-separated, format `<first>-<last-initial>-<district-abbr>` (e.g., `marcus-t-d214`).

3. **Confirm with Rylee** before creating the folder: "I'll create `workspace/clients/marcus-t-d214/` — confirm?" If she says the district abbreviation is wrong, fix and re-confirm.

4. **Check for collision**. If `workspace/clients/<client_id>/` already exists, stop and ask Rylee whether to (a) open the existing one, (b) use a different abbreviation, or (c) overwrite (only if she explicitly confirms — this is destructive).

5. **Create the folder** and copy each template from `.claude/skills/intake-process/assets/` into it:
   - `intake-form.md`
   - `welcome-packet.md`
   - `iep-checklist.md`
   - `session-log.md`

   Do **not** copy `services-agreement-checklist.md` — that's an attorney-input template, not per-client.

6. **Stamp the frontmatter placeholders** in each copied file:
   - `{client_id}` → the constructed client_id
   - `{client_display_name}` → `<First Name> <Last Initial>.` (e.g., `Marcus T.`)
   - `{today}` → today's date in `YYYY-MM-DD` format

   Leave all body placeholders (other than frontmatter) untouched — Rylee fills those during intake.

7. **Tell Rylee where things are** and what's next:
   - Path: `workspace/clients/<client_id>/`
   - Files created: intake-form, welcome-packet, iep-checklist, session-log
   - Next step: send `intake-form.md` to the family (export to PDF or share doc), per the `intake-process` workflow

## PII guardrails

- Do not write the full last name anywhere — last initial only, per `.claude/shared/pii-policy.md`
- Do not write the full school district name — abbreviation only
- If Rylee gives you full last name in the argument by mistake (e.g., `/new-client Marcus Thompson`), stop and ask her to give just the initial

## What this command does NOT do

- Does not collect intake content — the family fills the form, Rylee transcribes if needed
- Does not draft the services agreement — that's `intake-process` + her attorney
- Does not schedule the first session — Rylee's calendar tool
- Does not add the client to any list — there is no client list file in this repo (deliberately)
