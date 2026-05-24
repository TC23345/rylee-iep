# Archive

Content previously surfaced on the Overview / README. Parked here while we decide whether to keep, rewrite, or delete.

---

## Repo intro

A working repo for Rylee Coteus's pivot from agency BCBA work into a private-pay IEP advocacy practice. Built around the **PIVOT into IEP Advocacy®** course (Dr. Annie / Constance McLaughlin) — Summer 2026 cohort, starts **2026-06-01**.

This repo doubles as a **module-by-module action-plan dashboard**: scan this README to see where Rylee is, which skills exist, what's been validated against the actual course content, and what's still scaffolding.

---

## Module roadmap

Status legend: `(scaffold)` drafted from public outline, unvalidated · `(in review)` course watched, debrief in progress · `(validated)` course content merged, skill is canonical · `—` not yet authored.

Open a module from the sidebar to see its deliverables and tick them off as Rylee completes them.

1. **The Business of Private Pay**
2. **Navigating the Special Education System**
3. **Becoming an Expert at IEPs**
4. **Starting your IEP Advocacy Practice**
5. **Getting your First 5 Clients**
6. **Working with Clients**
7. **Advanced Special Education Knowledge**
8. **Taking your Business Full Time**

Modules 2–8 deliverables don't yet have skills attached. Each gets a skill (or two) authored via [`/module-debrief <N>`](.claude/commands/module-debrief.md) when Rylee reaches that module, with her notes + Dr. Annie's actual content.

---

## Pre-cohort (now → 2026-06-01)

- Read through current Module 1 skills, flag obvious gaps to address once the real lessons land
- Confirm directory structure works in Claude Code (`/help` shows the four commands, skills auto-discover)
- Don't deep-edit the Module 1 skills yet — the debrief workflow will handle that

---

## Previous deliverable-section placeholder text

These three bracketed paragraphs used to appear under every deliverable heading on each module page (e.g. "Naming & Registering Your Business Entity in Illinois" on Module 1). They've been replaced with a simpler "questions and curiosities" prompt + a video/discussion link block. Parked here in case the structure is useful as a future template.

[Initial Research Context - this is conducted before the module to give us an introduction to the concepts included within the heading/bullet point]

[Module Knowledge Context - this is synthesized by parsing the video transcript of the lesson into one paragraph using 5 to 7 clear, concise, and complete sentences applying the module knowledge to the concept included within the heading/bullet point]

[Rylee's Expert Context - this is input provided directly from Rylee that weighs the heaviest on any and all downstream tasks/deliverables included within the heading/bullet point]

---

## Previous Overview copy

The README went through a few drafts before landing on the Workflow Framework version. Earlier copy parked here.

### "What this project does" (pivot-framing draft)

Rylee is pivoting from full-time MS BCBA/LBA work at NSSEO into private-pay IEP advocacy. To make that jump she enrolled in Dr. Annie McLaughlin's **PIVOT into IEP Advocacy®** — 12 weeks of mentorship, weekly group calls, and a binder of templates, cheat sheets, and worked examples from someone who has already made the transition. At $1,500 the access alone is a real deal.

But it's a "you get out what you put in" program. We've talked about this kind of thing for years: the realistic rate of cohort students who finish the modules *and* actually stand up a practice is low. The gap is the execution side — the implicit sub-tasks sitting behind each module's checkboxes — and that's where this repo lives.

Taylor (operator) is all-in on the build side. The mechanism:

1. **Treat each module's deliverable checkboxes as the contract**, then research the sub-tasks each one *implies* but doesn't spell out (e.g. "register your entity" → name availability check → IL SoS filing → EIN → registered agent → operating agreement basics)
2. **Encode those sub-tasks as skills** under `.claude/skills/` so each deliverable becomes a procedure Rylee can run, not a thing she has to re-reason from scratch every time
3. **Capture her domain expertise** — BCBA-side knowledge of IEPs, IL/IDFPR scope, NSSEO context — in `.claude/shared/rylee-profile.md` so the skills don't re-ask what she already knows
4. **Merge in Dr. Annie's actual lessons** after each module via `/module-debrief`, replacing the pre-watched scaffolding with the real content
5. **Track per-client work** once clients show up — `/new-client` spins up a folder, `/checklist` walks the IEP advocacy checklist

### "Who does what"

- **Taylor** (operator, AI-native): steers Claude, runs commands, drafts and refines skills, keeps the repo coherent
- **Rylee** (end user, domain expert): watches modules, brings BCBA + advocacy expertise, validates skill content, uses the skills against real clients
- **Claude**: executes the skills, enforces PII policy, invokes the disclaimer at the right gates, never asserts on legal/tax/IDFPR-position territory

### "How we'll use this repo throughout the course"

#### During each module (weekly cadence)

1. **Watch the module** (Rylee, on her own)
2. **Note dump** → `workspace/course/module-<N>-notes.md` (template generated by `/module-debrief`)
3. **Debrief together** (Taylor + Rylee + Claude): run `/module-debrief <N>`
4. **Work through the deliverable checklists** using `/checklist` and the relevant skill
5. **Move artifacts** into `workspace/business/*.md` (decisions) or `workspace/clients/<id>/` (when clients show up)

#### Weekly

- `/weekly-review` → short status: current module, what moved, what's blocked, what's next. Useful prep for Dr. Annie's group calls (2nd Fri 10:30 EST, 4th Tue 14:30 EST).

#### When external work is needed

- Legal / contract language → attorney (skill flags to `shared/disclaimer.md`)
- Tax classification → CPA (same gate)
- IDFPR position on BCBA-owned entities → Rylee verifies directly with IDFPR
- These open questions accumulate in `workspace/business/*.md` "Open questions for ___" sections

### Course context

- **Course**: PIVOT into IEP Advocacy® — iepadvocacytraining.com
- **Instructor**: Dr. Annie / Constance McLaughlin (BACB registry)
- **Cohort**: Summer 2026, starts 2026-06-01, 12 weeks, 12-month materials access
- **Format**: 8 pre-recorded modules + 6 group calls + physical workbook + 6 BACB CEUs
- **Scope**: business setup + advocacy competency. Private-pay only.

### Pre-cohort callout

> Pre-cohort state (as of 2026-05-21). Everything under `.claude/skills/` was drafted from the public course outline at iepadvocacytraining.com plus general IL/BCBA business knowledge. It is scaffolding, not validated. When Rylee begins the actual course, each skill gets reviewed and updated against Dr. Annie's real lessons + Rylee's domain expertise via `/module-debrief`.

### Disclaimer / scope-gate block (removed)

> Not legal, tax, or insurance billing advice. Anything in those zones defers to her attorney, CPA, carrier, or IDFPR directly. Private-pay only — no insurance.
