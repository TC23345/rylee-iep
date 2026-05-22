---
name: entity-setup
description: Walks the user through registering an Illinois business entity for a private IEP advocacy practice — LLC vs PLLC vs sole proprietor decision, IL Secretary of State filing steps, federal EIN registration, and registered agent options. Use when the user asks about entity formation, LLC, PLLC, sole proprietorship, business registration, IL Secretary of State, EIN, registered agent, or operating agreement basics. Does not produce tax classification recommendations — defers to a CPA.
---

# entity-setup

Source module: **Module 1 — Business of Private Pay** (deliverable: register the business entity).

## I produce

- A decision framework for sole prop vs. LLC vs. PLLC under IL law
- Step-by-step IL Secretary of State filing walkthrough (LLC/PLLC)
- Federal EIN walkthrough (free, IRS only — refuse to recommend paid services)
- Registered agent options (self vs. service) with tradeoffs
- A populated `workspace/business/entity-decisions.md`

## I do not produce

- **Entity tax classification** (S-corp election, default LLC treatment, etc.) — invoke `.claude/shared/disclaimer.md` and refer to a CPA licensed in IL. This is the most common ask that crosses the line; recognize it and gate it.
- **Operating agreement drafting** — checklist for an attorney to review, not a drafted document
- A determination of whether IDFPR requires a PLLC vs. LLC for a BCBA — that requires verification against current IDFPR position; gather Rylee's research, do not assert

## Procedure

1. Read `workspace/business/entity-decisions.md` if present. Continue from prior state.

2. Confirm prerequisites: business name is locked (`workspace/business/name-candidates.md` shows a chosen name), IL availability confirmed.

3. Walk the **entity-type decision** as three sections, in this order:

   ### Sole proprietorship
   - No state filing required to operate
   - Personal liability not separated from business — material for advocacy work (parents are emotionally invested; lawsuit risk is non-trivial)
   - Cheapest, simplest, **not recommended** as the durable answer for a practice that will sign contracts and visit schools
   - May be a fine interim if Rylee wants to test with one or two clients before paying filing fees — flag this option but don't push it

   ### LLC (standard)
   - IL filing fee + annual report fee (verify current amounts at filing time on `cyberdriveillinois.com` / `apps.ilsos.gov` — do not assert dollar figures, they change)
   - Liability separation if operating formalities are kept
   - Most common choice for non-licensed-professional service businesses in IL

   ### PLLC
   - Required (or expected) when the owner holds a state professional license in IL
   - BCBAs in IL are licensed under IDFPR (Behavior Analyst Licensing Act). Whether IDFPR + IL SoS treat a BCBA-led entity as requiring PLLC vs. permitting LLC is a question Rylee needs to verify directly with IL SoS and IDFPR. **Do not assert; help her gather the verification.**
   - Filing pathway is similar to LLC but requires a Statement of Compliance from the licensing board

4. **Tax classification gate.** If Rylee asks "should I elect S-corp" or any tax-treatment question, invoke `.claude/shared/disclaimer.md`, state that this is CPA territory, and offer to prepare a list of questions she can take to a CPA. Then continue with non-tax portions.

5. Walk **IL Secretary of State filing** at high level:
   - LLC: Form LLC-5.5 (Articles of Organization), filed via `apps.ilsos.gov`
   - PLLC: similar pathway, additional licensure verification
   - Registered agent must be IL resident or registered service
   - Operating agreement: required to keep, not required to file — checklist below

6. Walk **federal EIN**:
   - Direct IRS only: `irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online`
   - Free. **Refuse** to suggest paid services; flag if Rylee mentions one (LegalZoom, ZenBusiness, etc. — fine for filing convenience, never required for EIN)
   - Apply after IL formation is confirmed, not before

7. Walk **registered agent options**:
   - Self as agent: must have IL street address (not PO box), available during business hours, name becomes public record
   - Service: ~$50–$300/yr (verify current pricing), keeps home address off public records, forwards mail
   - For a BCBA-advocate working with families, the privacy argument is real — flag it but don't decide

8. Operating-agreement **checklist** (not a draft): members and ownership %, management structure, capital contributions, distributions, voting, dissolution. State: "this is the checklist for an attorney to draft from."

9. Append decisions to `workspace/business/entity-decisions.md`:

```markdown
---
client_id: none
created: <today>
last_updated: <today>
module_context: module-1
---

## Entity decisions

- **Entity type**: sole prop | LLC | PLLC — pending CPA + IDFPR confirmation
- **Name (registered)**: ...
- **Registered agent**: self | service (name)
- **IL SoS filing**: [ ] submitted on ___ | confirmation # ___
- **EIN**: [ ] obtained on ___ | EIN ___ (store the EIN in a password manager, not here)
- **Operating agreement**: [ ] drafted by attorney ___
- **Open questions for CPA**: [list]
- **Open questions for IDFPR / IL SoS**: [list]
```

Never write the actual EIN number to the file. Tell Rylee to store it in a password manager.

## What Rylee already knows

- She is licensed under IL IDFPR as a BCBA
- She understands liability exposure from clinical work; the new framing is liability from advocacy work specifically (school district disputes, parent contract disputes)
