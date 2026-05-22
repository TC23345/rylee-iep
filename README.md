# rylee-iep

A working repo for Rylee Coteus's pivot from agency BCBA work into a private-pay IEP advocacy practice. Built around the **PIVOT into IEP Advocacy®** course (Dr. Annie / Constance McLaughlin) — Summer 2026 cohort, starts **2026-06-01**.

This repo doubles as a **module-by-module action-plan dashboard**: scan this README to see where Rylee is, which skills exist, what's been validated against the actual course content, and what's still scaffolding.

> **Pre-cohort state (as of 2026-05-21).** Everything under [`.claude/skills/`](.claude/skills/) was drafted from the public course outline at [iepadvocacytraining.com](https://www.iepadvocacytraining.com/) plus general IL/BCBA business knowledge. It is **scaffolding, not validated**. When Rylee begins the actual course, each skill gets reviewed and updated against Dr. Annie's real lessons + Rylee's domain expertise via [`/module-debrief`](.claude/commands/module-debrief.md).

---

## What this project does

1. **Organizes the course's action plan** — each of the 8 modules has concrete deliverables; this repo turns them into trackable skills and checklists
2. **Captures Rylee's domain expertise** — her BCBA-side knowledge of IEPs, IL/IDFPR scope, and NSSEO context lives in [`.claude/shared/rylee-profile.md`](.claude/shared/rylee-profile.md) so skills don't re-ask
3. **Layers in course content as it's learned** — after Rylee watches each module, [`/module-debrief`](.claude/commands/module-debrief.md) merges what Dr. Annie taught into the matching skills
4. **Walks her through the deliverables** — each finished skill is a procedure that takes her from "module deliverable" to "done" without re-learning the substance every time
5. **Tracks per-client work** once she has clients — [`/new-client`](.claude/commands/new-client.md) instantiates a folder, [`/checklist`](.claude/commands/checklist.md) walks the IEP advocacy checklist

---

## Who does what

- **Taylor** (operator, AI-native): steers Claude, runs commands, drafts and refines skills, keeps the repo coherent
- **Rylee** (end user, domain expert): watches modules, brings BCBA + advocacy expertise, validates skill content, uses the skills against real clients
- **Claude**: executes the skills, enforces PII policy, invokes the disclaimer at the right gates, never asserts on legal/tax/IDFPR-position territory

---

## Module roadmap

Status legend: `(scaffold)` drafted from public outline, unvalidated · `(in review)` course watched, debrief in progress · `(validated)` course content merged, skill is canonical · `—` not yet authored.

Tick each deliverable as Rylee completes it. The arrow on each line points at the skill that walks her through it.

1. **The Business of Private Pay** (scaffold)

   - [ ] Pick a name and register your new business entity with your state

        → [business-name](.claude/skills/business-name/SKILL.md)
        → [entity-setup](.claude/skills/entity-setup/SKILL.md)

   - [ ] Update your liability insurance to include your new private practice

        → [liability-insurance](.claude/skills/liability-insurance/SKILL.md)

   - [ ] Clearly define your set of services and fee structure

        → [services-fees](.claude/skills/services-fees/SKILL.md)

   - [ ] Set up your back end systems for file organization and contracts

        → [backend-systems](.claude/skills/backend-systems/SKILL.md)

   - [ ] Create your custom client intake process so you can get started right away

        → [intake-process](.claude/skills/intake-process/SKILL.md)

2. **Navigating the Special Education System** —

   - [ ] Learn the meaning of special education methodology, terms, and philosophies
   - [ ] Build a foundation for IEP Advocacy based on your knowledge of special education
   - [ ] Begin completing an IEP Advocacy checklist

3. **Becoming an Expert at IEPs** —

   - [ ] Learn and understand the 6 steps in the IEP process
   - [ ] Describe and define the eligibility for an IEP
   - [ ] Become an observation expert

4. **Starting your IEP Advocacy Practice** —

   - [ ] Identify who your ideal client is
   - [ ] Streamline your intake system
   - [ ] Identify your support team and self care as an IEP advocate

5. **Getting your First 5 Clients** —

   - [ ] Identify your key referral sources, so you can create meaningful connections to meet new potential clients
   - [ ] Set up your presence online, so you can attract and nurture clients from there
   - [ ] Learn how to attract your ideal clients online and via referrals

6. **Working with Clients** —

   - [ ] Learn the cycle of support for your clients
   - [ ] Formulate a plan to support new clients and long term clients
   - [ ] Develop the skills to handle conflict management and difficult conversations

7. **Advanced Special Education Knowledge** —

   - [ ] Learn about Independent Education Evaluations
   - [ ] Understand ESY
   - [ ] Dispute Key Terms
   - [ ] Understand the difference between mediation and due process
   - [ ] Know how to link evaluations to the correct supports

8. **Taking your Business Full Time** —

   - [ ] Learn when is the right time to let go of direct client work and go full time
   - [ ] Make a plan for the future so you can sustain your success long term
   - [ ] Plan your transition so you can leave your current job on good terms

Modules 2–8 deliverables don't yet have skills attached. Each gets a skill (or two) authored via [`/module-debrief <N>`](.claude/commands/module-debrief.md) when Rylee reaches that module, with her notes + Dr. Annie's actual content. See [`feedback_skill_authoring.md`](C:\Users\TC933\.claude\projects\c--Users-TC933-Projects-rylee-iep\memory\feedback_skill_authoring.md) for the rationale.

---

## How we'll use this repo throughout the course

### Pre-cohort (now → 2026-06-01)

- Read through current Module 1 skills, flag obvious gaps to address once the real lessons land
- Confirm directory structure works in Claude Code (`/help` shows the four commands, skills auto-discover)
- Don't deep-edit the Module 1 skills yet — the debrief workflow will handle that

### During each module (weekly cadence)

1. **Watch the module** (Rylee, on her own)
2. **Note dump** → `workspace/course/module-<N>-notes.md` (template generated by `/module-debrief`)
3. **Debrief together** (Taylor + Rylee + Claude): run [`/module-debrief <N>`](.claude/commands/module-debrief.md)
   - For Module 1: this means *replacing* the scaffolded content with the real course substance
   - For Modules 2–8: this means *authoring* the skills from scratch using her notes
4. **Work through the deliverable checklists** using [`/checklist`](.claude/commands/checklist.md) and the relevant skill
5. **Move artifacts** into `workspace/business/*.md` (decisions) or `workspace/clients/<id>/` (when clients show up)

### Weekly

- [`/weekly-review`](.claude/commands/weekly-review.md) → produces a short status: current module, what moved, what's blocked, what's next. Useful prep for Dr. Annie's group calls (2nd Fri 10:30 EST, 4th Tue 14:30 EST).

### When external work is needed

- Legal / contract language → attorney (skill flags to [`shared/disclaimer.md`](.claude/shared/disclaimer.md))
- Tax classification → CPA (same gate)
- IDFPR position on BCBA-owned entities → Rylee verifies directly with IDFPR
- These open questions accumulate in `workspace/business/*.md` "Open questions for ___" sections

---

## Repo map

```text
rylee-iep/
├── README.md                       ← you are here
├── CLAUDE.md                       ← project-level instructions for Claude Code
├── modules.md                      ← course module outline (source: iepadvocacytraining.com)
├── .gitignore                      ← gitignores workspace/, secrets
├── .claude/
│   ├── CHANGELOG.md                ← every skill edit logged here
│   ├── shared/                     ← cross-skill references (disclaimer, profile, PII policy)
│   ├── commands/                   ← /new-client, /module-debrief, /checklist, /weekly-review
│   └── skills/                     ← module-1 skills (more added as Rylee progresses)
└── workspace/                      ← gitignored — Rylee's business decisions + client folders
    ├── business/
    ├── clients/<client_id>/
    └── course/module-<N>-notes.md  ← per-module distillation
```

For PII rules, scope gates, and the skill update workflow in detail, see [`CLAUDE.md`](CLAUDE.md).

---

## Course context

- **Course**: PIVOT into IEP Advocacy® — [iepadvocacytraining.com](https://www.iepadvocacytraining.com/)
- **Instructor**: Dr. Annie / Constance McLaughlin (BACB registry)
- **Cohort**: Summer 2026, starts 2026-06-01, 12 weeks, 12-month materials access
- **Format**: 8 pre-recorded modules + 6 group calls + physical workbook + 6 BACB CEUs
- **Audience**: BCBAs primarily (Rylee), also OT/SLP/PT
- **Scope**: business setup + advocacy competency. **No certification awarded.** Private-pay only.

Full cohort meta: [`.claude/shared/course-context.md`](.claude/shared/course-context.md)

---

## What this repo is NOT

- Not legal advice — see [`shared/disclaimer.md`](.claude/shared/disclaimer.md)
- Not tax advice — CPA territory
- Not a substitute for Dr. Annie's course — this organizes Rylee's work *through* the course, it doesn't replace the course
- Not a client-facing tool — every file here is internal. Client-facing artifacts (intake form PDFs, welcome packets, agreements) get exported from the assets and shared via her cloud drive, not this repo.
- Not an authoritative source on IL filing logistics, IDFPR positions, or insurance carrier products — those change; the repo encodes Rylee's verified decisions, not assertions about external systems
