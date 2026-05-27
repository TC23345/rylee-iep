---
name: services-fees
description: Helps the user define the services catalog and fee schedule for a private-pay IEP advocacy practice. Use when the user asks about pricing, fee schedule, what services to offer, hourly vs flat-fee, package design, scope of work, or how to price IEP meeting attendance, record reviews, or observations. Does not draft binding contract terms — those are attorney territory.
---

# services-fees

Source module: **Module 1 — Business of Private Pay** (deliverable: clearly define set of services and fee structure).

## I produce

- A services catalog: each service with description, deliverable, time estimate, fee model (hourly, flat, package), and parent-facing one-liner
- A fee schedule with rationale (anchored to common IEP-advocate market ranges, not a pricing recommendation)
- A scope-of-work statement per service (what's in, what's out)
- A populated `workspace/business/services-fees.md`

## I do not produce

- A binding fee agreement, payment terms, late-fee policy, refund language, or any contract clause — that goes to the attorney via `intake-process` checklist
- Insurance billing setup — private pay only (the course is "Private Pay"; if Rylee asks about insurance billing, flag the scope shift)

## Procedure

1. Read `workspace/business/services-fees.md` if present. Continue.

2. Walk Rylee through the **standard IEP advocate service set**, asking which she'll offer and on what fee model:

   | Service | Common fee model | Notes |
   |---|---|---|
   | Initial consultation | Free 15–30 min OR flat fee | Lead-magnet trade-off |
   | Records review | Hourly OR flat per case | Time-intensive on first IEP cases |
   | IEP review and prep meeting with parent | Hourly | Usually 1–2 hours |
   | IEP meeting attendance | Hourly (with minimum) | Include prep + meeting + debrief |
   | School observation | Hourly + travel | Travel policy needs definition |
   | Independent Evaluation (IEE) coordination | Hourly OR project flat | Tier 3 — covered in Module 7 |
   | Written correspondence with district | Hourly | Tight scope to avoid scope creep |
   | Mediation / due process support | Hourly (advanced rate) | Tier 3 — Module 7 |
   | Monthly retainer | Flat monthly | For long-term clients |

3. For each selected service, capture:
   - **Description** (1–2 sentences, parent-facing)
   - **Deliverable** (what the parent receives)
   - **Time estimate** (avg + range)
   - **Fee model** (hourly / flat / package)
   - **Fee amount** (use Rylee's number; if she asks "what's market rate," give a range with the caveat that IEP advocate rates vary widely by region and credential, and that BCBA credential supports the higher end of the range)
   - **Scope in / out**

4. Build a **fee schedule** as a single table. Include payment cadence (per meeting, monthly invoice, retainer drawdown).

5. **Contract terms gate.** If Rylee asks "what's my late fee policy" or "how do I handle cancellations contractually" — invoke `.Codex/shared/disclaimer.md`, state this is attorney territory, and add the question to the `intake-process` services-agreement checklist instead.

6. Append to `workspace/business/services-fees.md`:

```markdown
---
client_id: none
created: <today>
last_updated: <today>
module_context: module-1
---

## Services catalog

### <Service name>
- **Description**: ...
- **Deliverable**: ...
- **Time estimate**: ...
- **Fee model**: hourly | flat | package
- **Fee**: ...
- **Scope in**: ...
- **Scope out**: ...

## Fee schedule

| Service | Fee | Model | Notes |
|---|---|---|---|

## Payment cadence

- ...

## Open questions for attorney (-> intake-process services-agreement checklist)

- ...
```

## What Rylee already knows

- The clinical scope of her BCBA license and what she cannot bill for under that license
- The difference between advocate and attorney roles in IEP meetings — pricing reflects this
