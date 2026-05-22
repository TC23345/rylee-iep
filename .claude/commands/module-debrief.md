---
description: Walk Rylee through extracting takeaways from a course module and updating the matching skill(s). Use after she watches Module N. Reads workspace/course/module-N-notes.md, identifies skills with module_context=module-N, proposes specific edits, applies the ones she approves, and logs changes to .claude/CHANGELOG.md.
argument-hint: <module-number>
---

# /module-debrief

The core "after-module" workflow. Rylee just watched a module; this command is how that module turns into improved skills.

## Procedure

1. **Parse module number** from `$ARGUMENTS`. Must be 1–8. If missing or invalid, ask Rylee which module she just watched.

2. **Read** `workspace/course/module-<N>-notes.md`.
   - If it doesn't exist, create it from this template and walk her through filling it BEFORE moving to step 3:
     ```markdown
     ---
     module: <N>
     watched_on: <today>
     ---

     # Module <N> debrief notes

     ## What was new
     -

     ## What was confirmed (already knew)
     -

     ## What surprised me
     -

     ## What would I tell a parent differently now?
     -

     ## Specific tools / templates / scripts Dr. Annie shared
     -

     ## Questions for the next group call
     -
     ```
   - Ask Rylee one section at a time. Do not let her dump everything at once — that defeats the structuring purpose. One section, one short reply, move on.

3. **Identify matching skills**. Search `.claude/skills/*/SKILL.md` for frontmatter `module_context: module-<N>`.
   - For Module 1: business-name, entity-setup, services-fees, intake-process, liability-insurance, backend-systems
   - For Modules 2–8 on initial run: likely zero matches → see step 5

4. **For each matched skill**, in turn:
   a. Read the SKILL.md
   b. Compare it to Rylee's notes. Find specifically:
      - Procedure steps that are now wrong or incomplete based on what Dr. Annie taught
      - "What Rylee already knows" sections that should be updated with new vocabulary
      - "I produce / I do not produce" lines that might need to expand or contract
      - Any asset templates that should get new fields
   c. Propose 2–5 specific edits as a numbered list. Wait for Rylee to approve each (y/n/skip).
   d. Apply approved edits via Edit tool. Do NOT rewrite the whole skill.
   e. Log to `.claude/CHANGELOG.md`:
      ```markdown
      ## <YYYY-MM-DD> — Module <N> debrief: <skill-name>

      - **What**: <skill path> — applied <N> edits from Module <N>
      - **Why**: <one-line summary of the substance>
      - **Who**: Rylee + Claude
      ```

5. **For unmatched deliverables**. Read the relevant module section in `modules.md`. For each deliverable that has no skill yet:
   a. Ask Rylee: "Module <N> has a deliverable for `<deliverable>`. Want to draft a skill for it now?"
   b. If yes, draft a new `.claude/skills/<skill-name>/SKILL.md` using the structure of an existing skill (e.g., `entity-setup`) as the template:
      - Frontmatter with `name`, `description`, `module_context: module-<N>`
      - "Source module" line
      - "I produce / I do not produce" sections
      - Procedure
      - "What Rylee already knows" section
   c. Author it interactively — ask her about the deliverable, capture her language, gate any legal/tax/clinical sub-questions to `shared/disclaimer.md`
   d. Log to `.claude/CHANGELOG.md` as a new skill

6. **End-of-debrief summary**. Tell Rylee:
   - Skills updated this session (count + names)
   - New skills authored (count + names)
   - Open questions she wrote that should go to the next group call (pulled from her notes' "Questions for the next group call" section)
   - One-line: "Module <N> debrief complete. Next: Module <N+1> when you're ready."

## Things to NOT do

- Don't rewrite a skill in one shot — incremental edits, each approved
- Don't pre-draft skills for modules she hasn't watched yet
- Don't second-guess Dr. Annie's positioning if it contradicts the existing skill — propose the edit, let Rylee judge
- Don't create skills for things that aren't on the module's deliverable list — scope creep
- Don't write any client PII into a debrief note — if she illustrates a point with a real case, anonymize per `shared/pii-policy.md`
