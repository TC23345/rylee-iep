---
name: business-name
description: Brainstorms private practice business names and walks the user through Illinois Secretary of State name-availability checks. Use when the user asks to brainstorm names, check business name availability, evaluate naming options, choose a name for the practice, or compare candidate names against IL filing rules. Specific to BCBA-led IEP advocacy private practice in Illinois.
---

# business-name

Source module: **Module 1 - Business of Private Pay** (deliverable: pick a name).

Helps Rylee land on a business name that:

1. Reflects an IEP advocacy practice (not pure ABA - she is pivoting)
2. Is available on the IL Secretary of State business entity search
3. Plays well with a `.com` domain
4. Survives the "say it on a parent intake call" test

## I produce

- Candidate name lists with rationale (style: descriptive vs. evocative vs. eponymous, syllable count, parent-facing readability)
- A scored shortlist with availability-checking instructions
- A populated `workspace/business/name-candidates.md` with frontmatter

## I do not produce

- A final trademark clearance - that requires USPTO searching plus attorney review if Rylee wants legal clearance
- Domain purchase, DNS setup, or social handle registration
- Entity-form advice; naming work can surface LLC/PLLC questions, but those move to `entity-setup`

## Procedure

1. Read `workspace/business/name-candidates.md` if it exists. Continue from prior state, do not overwrite.
2. Ask Rylee for: brand axis (warm/clinical/empowerment/no preference), whether she wants her name in it, geographic anchor preference (Illinois/Chicago/none).
3. Generate **12 candidates** spanning the chosen axes. Each candidate gets: name, one-line rationale, style category, .com likelihood (guess; verify is Rylee's job).
4. Present as a numbered list. Ask Rylee to mark up to 5 as "check availability."
5. For each marked name, give the user the IL SoS business entity search URL pattern: `https://apps.ilsos.gov/businessentitysearch/` - instruct them to search the exact entity name plus the entity designator (e.g., "Acme Advocacy LLC"). Note that IL requires the entity designator in the registered name; the search should be done against the full registered form.
6. Append to `workspace/business/name-candidates.md` with this structure:

```markdown
---
client_id: none
created: <today>
last_updated: <today>
module_context: module-1
---

## Candidates (round <n>, <date>)

### 1. Name Here
- **Rationale**: ...
- **Style**: warm | clinical | empowerment | eponymous
- **.com likely**: yes/no
- **IL SoS availability**: [ ] checked  | result: ___
- **Notes**: ...
```

7. Do not invoke the professional-scope disclaimer for naming work. This is brainstorming territory. Invoke the disclaimer only if Rylee crosses into entity-form selection, trademark clearance, tax classification, or contract terms.

## What Rylee already knows

- She is a BCBA; her credential matters for how the name reads to school staff
- "Advocacy" vs. "consulting" vs. "support" carries weight in special education circles - present these as deliberate choices, not definitions she needs re-taught