---
name: intake-process
description: Designs and refines the client intake process for a private IEP advocacy practice — intake form, welcome packet, services-agreement checklist (for attorney review), and the operational steps from first inquiry to signed engagement. Use when the user asks about intake forms, onboarding, welcome packets, services agreements, the steps from inquiry to signed client, or how to handle the first call. Provides templates that the /new-client command instantiates into a client folder.
---

# intake-process

Source module: **Module 1 — Business of Private Pay** (deliverables: back-end systems for file organization and contracts; client intake process).

## I produce

- An intake-form template (`assets/intake-form.md`)
- A welcome-packet template (`assets/welcome-packet.md`)
- A services-agreement **checklist** for attorney review (`assets/services-agreement-checklist.md`) — not a drafted contract
- The end-to-end intake workflow: inquiry → screening call → intake form → fee agreement → signed engagement → first session
- Updates to the templates as Rylee's practice evolves

## I do not produce

- A signed, binding services agreement — that's attorney work. The checklist hands the attorney the substance; the attorney drafts the language.
- HIPAA / FERPA compliance certifications — flag any time those come up; Rylee is not a covered entity by default, but FERPA applies to records she handles. Defer specifics to her attorney.

## Procedure

1. **First call ever**: walk Rylee through the four assets and the workflow before customizing anything. The templates are starting points, not final.

2. **Customization pass**: ask Rylee to mark up each template inline (in the `assets/` files) with her preferences. This is the only legitimate edit to `assets/` files — they are the source-of-truth templates, not workspace files.

3. **Workflow** (what `/new-client` automates):
   - Inquiry arrives (email, referral) → Rylee triages: is this a fit?
   - Screening call (15–30 min, free or flat-fee per `services-fees` decision)
   - If fit: send intake form (the asset, exported as PDF or shared doc)
   - Intake form returned → Rylee reviews, sends welcome packet + fee agreement
   - Fee agreement signed → first paid session scheduled
   - `/new-client <name>` instantiates the client folder at the start of this last step

4. **When Rylee says "I want to add an intake field"**: edit `assets/intake-form.md`, not the workspace file. Log the change in `.Codex/CHANGELOG.md` so future clients get the updated template.

5. **Scope gate**: when Rylee asks about contract terms — payment timing, late fees, cancellation, termination, dispute resolution — invoke `.Codex/shared/disclaimer.md` and add the question to `assets/services-agreement-checklist.md` for the attorney.

## Asset files

- `assets/intake-form.md` — collected at intake, becomes `workspace/clients/<id>/intake.md`
- `assets/welcome-packet.md` — sent after intake form is returned
- `assets/services-agreement-checklist.md` — input for attorney; not a contract
- `assets/iep-checklist.md` — starter IEP advocacy checklist (Tier 2 will expand)
- `assets/session-log.md` — empty append-only log seeded into each new client folder
