---
name: liability-insurance
description: Walks the user through evaluating and purchasing professional liability insurance for a private IEP advocacy practice in Illinois. Use when the user asks about liability insurance, malpractice coverage, professional liability, E&O coverage, advocate insurance, HPSO, CPH Associates, or whether her NSSEO/agency coverage extends to private practice. Defers actual policy selection and premium quotes to the carrier — does not quote dollar figures.
---

# liability-insurance

Source module: **Module 1 — Business of Private Pay** (deliverable: update liability insurance to include the new private practice).

## I produce

- A clear distinction between Rylee's current NSSEO/agency coverage and the coverage she needs for private practice
- The specific question set to take to a carrier: scope-of-practice on the application, BCBA-vs-advocate language, telehealth/in-person/school-observation coverage, tail coverage
- A shortlist of carriers commonly used by behavior analysts and IEP advocates (with the explicit caveat that Rylee verifies current options — carriers add/drop lines regularly)
- A populated `workspace/business/insurance-decisions.md` capturing her choice and the application's scope description

## I do not produce

- A premium quote — premiums vary by carrier, state, claims history, coverage limits, and retroactive date. Refer to the carrier.
- A recommendation between specific carriers as the "right" choice — there is no single right answer; the choice depends on Rylee's coverage limits, deductible tolerance, and whether the carrier covers IEP advocacy explicitly (some only cover ABA, which is the gap that motivates this skill)
- A determination of whether her NSSEO-provided coverage extends to private practice — that's a question for NSSEO's HR/risk-management office and Rylee's review of her current policy documents. The skill helps her ask the right question; it does not assert the answer.
- Cybersecurity / data-breach insurance — separate product, separate decision; flag if Rylee asks, point her to it as a Tier 2 conversation

## Procedure

1. Read `workspace/business/insurance-decisions.md` if it exists. Continue from prior state.

2. **Confirm the gap exists**. Walk Rylee through three questions:
   - **Does your NSSEO/agency coverage extend to work performed outside of NSSEO hours and outside of NSSEO clients?** (Almost always: no. But she has to look — her own employment paperwork or HR will say.)
   - **Does any current personal policy you hold (e.g., a BACB-member-rate policy through HPSO or CPH) cover advocacy work, or only ABA service delivery?** (Many BCBA policies are written narrowly around behavior-analytic services; advocacy work is a different professional activity that may not be covered. The policy language is what matters, not the marketing.)
   - **What's your tolerance for going bare on a first paid client?** (Strong recommendation: do not. Even a single mediation/due-process matter creates real exposure. The skill should not push her into bare; if she's hesitating on cost, point to the lower-limit options carriers offer for solo practices.)

3. **Distinguish the coverages she may need**:
   - **Professional liability (E&O / malpractice)** — the primary need. Covers claims arising from her advocacy work (e.g., a parent claiming she missed a key procedural protection that led to harm).
   - **General liability** — covers premises and bodily injury (e.g., a parent trips at her office). If she's home-office only, lower priority but consider for in-person meetings at her space.
   - **Cyber liability** — covers data breach exposure for the client records she'll hold. Tier 2 conversation; flag it but don't bundle the decision in this skill.
   - **Tail coverage** — if she switches carriers later, ensure the new policy or a tail endorsement covers acts performed during the prior policy's term. Critical for advocacy work, where claims can surface years after a service.

4. **Carrier shortlist** (verification is Rylee's job — premiums and product offerings change):
   - **HPSO** (Healthcare Providers Service Organization) — common for behavior analysts via the BACB-discount channel; verify they explicitly cover IEP advocacy or ask the underwriter how to describe the scope on the application
   - **CPH & Associates** — another BACB-aligned carrier; same verification question
   - **The Hartford / Hiscox / Coalition** — broader small-business E&O carriers; less behavior-analyst-specific but may cover broader advocacy scope
   - **Council for Exceptional Children (CEC)** — has historically offered policies geared toward special-education professionals; check current availability

   For each, the question Rylee asks the underwriter is: "I am a BCBA in IL operating a private IEP advocacy practice. The work includes records review, IEP meeting attendance, school observation, written correspondence with districts, and possibly mediation/due process support. Does your policy cover this scope as advocacy work, or only as behavior-analytic service delivery?" The answer determines whether the policy fits.

5. **Application scope language**. The application asks her to describe her services. The wording she uses there governs what's covered. Do **not** undersell — describe the full intended scope (records review, IEP meeting attendance, observations, correspondence, mediation/due process support if she'll do that). If she only writes "ABA services" on the application, an advocacy-related claim may be denied. The skill should help her draft this language; the carrier signs off.

6. **Decision capture**. Append to `workspace/business/insurance-decisions.md`:

   ```markdown
   ---
   client_id: none
   created: <today>
   last_updated: <today>
   module_context: module-1
   ---

   ## Current coverage gap

   - **NSSEO/agency coverage extends to private practice?**: no | yes (with limitations: ___)
   - **Existing personal policy covers advocacy?**: no | yes (carrier: ___, scope: ___)
   - **Coverage decision**: get new policy | extend existing | bare (NOT recommended)

   ## Carrier evaluation

   | Carrier | Covers advocacy scope explicitly? | Limits offered | Notes |
   |---|---|---|---|

   ## Application scope language (what I'll describe to the carrier)

   > [full scope description here]

   ## Policy details (once bound)

   - **Carrier**: ...
   - **Policy #**: <stored in password manager, not here>
   - **Effective date**: ...
   - **Limits**: per-claim ___ / aggregate ___
   - **Retroactive date**: ...
   - **Tail coverage available?**: yes/no, cost: ...
   - **Renewal date**: ...

   ## Open questions for NSSEO HR / risk

   - [list]
   ```

   **Never write the policy number in this file.** Password manager.

7. **NSSEO conflict-of-interest gate**. If at any point the conversation reveals that NSSEO's employment terms might restrict private practice (non-compete, conflict-of-interest policy, requirement to disclose outside employment), invoke `.Codex/shared/disclaimer.md` and route the question to NSSEO HR + her employment attorney. This skill does not interpret employment contracts.

## What Rylee already knows

- The clinical liability exposure of BCBA practice — the new framing is *advocacy* liability, which is different in kind (procedural and outcome claims, not clinical malpractice)
- That the BACB-member-rate insurance channels exist (HPSO, CPH) — she may already have one; the question is whether it covers her new scope
- That working with families in emotionally charged situations creates claims risk independent of clinical correctness — that's the whole reason the advocate role needs its own coverage
