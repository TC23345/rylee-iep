# Example — Step 1: Workflow, prompt extraction, and Perplexity queries

**Sequence:** `/initial-research` steps 1–5 · Module 1 validation run (2026-05-22)
**Role:** Reference for how to build `<initial_research_prompt>` from `modules.md`, map H2s from `content/module-N.md`, and draft parallel Perplexity queries.

**Related examples**
- [Step 2: Perplexity raw responses](02-perplexity-raw-responses.md)
- [Step 3: Final synthesis to user](03-final-synthesis.md)

---

## 0. User Request

> "you can probably scrape https://tc23345.github.io/rylee-iep/#module-1 to get the headings to conduct the research for - conduct it in parallel using perplexity mcp - return the response here with your paragraphs of initial research context under each ## heading in the chat so i can read it easily - include a [x] citation number after each sentence in the context to verify the source with a works cited within each heading. Again just a test to return to me, no changes to be made to the actual project"

---

## 1. Page Scrape

**URL:** https://tc23345.github.io/rylee-iep/
**Tool:** firecrawl_scrape (markdown format, onlyMainContent=true)

### Module 1 H2 headings extracted

1. Naming & Registering Your Business Entity in Illinois
2. Insuring Your Private Practice: Liability Insurance
3. Defining Your Services and Fee Structure
4. Backend Systems: File Organization and Contracts
5. Your Custom Client Intake Process

Each heading on the live page shows three placeholder blocks:
- `[Initial Research Context]` — conducted before the module
- `[Module Knowledge Context]` — synthesized from the lesson transcript after Rylee watches it
- `[Rylee's Expert Context]` — Rylee's direct input, weights heaviest

This test exercises only the first placeholder.

---

## 2. Perplexity Queries (5 in parallel)

### Query 1 — Naming & Registering Business Entity in Illinois

> For a BCBA (Board Certified Behavior Analyst) in Illinois who wants to start a private-pay IEP advocacy practice (not ABA therapy, not insurance billing), what are the key considerations for naming and registering the business entity? Specifically address: (1) whether Illinois requires a PLLC vs LLC for a BCBA-owned advocacy practice given IDFPR licensing under the Behavior Analyst Licensing Act, (2) the Illinois Secretary of State business name availability rules and required entity designators, (3) the practical filing process via apps.ilsos.gov and typical processing times, (4) whether the BCBA license imposes any naming or scope-of-practice restrictions on a non-clinical advocacy entity, (5) the trade-offs between sole proprietorship vs LLC for liability protection. Provide an introductory overview an aspiring advocate would need before researching further.

### Query 2 — Liability Insurance

> For a BCBA (Board Certified Behavior Analyst) in Illinois launching a private-pay IEP advocacy practice, what does professional liability insurance look like? Specifically: (1) does the typical BCBA malpractice / professional liability policy (e.g., HPSO, CPH & Associates) cover non-clinical IEP advocacy work or is it scoped to behavior analysis only, (2) what carriers currently write coverage for special education advocates / IEP advocates as a distinct line, (3) what scope-of-services language an advocate should disclose to an underwriter (records review, IEP meeting attendance, school observation, mediation support, expert opinion), (4) typical coverage limits and premium ranges for solo advocates, (5) whether an existing employer-provided policy (e.g., from a public school district or cooperative) extends to outside private practice. Provide an introductory primer.

### Query 3 — Services and Fee Structure

> For a solo private-pay IEP advocate in Illinois (a BCBA pivoting from agency work), how should the services catalog and fee structure be designed? Cover: (1) standard service line items (initial consult, records review, IEP prep, IEP meeting attendance, school observation, follow-up correspondence, mediation/due process support, expert opinion); (2) typical hourly vs flat-fee vs retainer pricing models; (3) market hourly rate ranges for IEP advocates in suburban Illinois/Chicago vs other US regions; (4) how a BCBA credential affects pricing power; (5) scope-of-engagement boundaries advocates typically exclude (no legal representation, no clinical determinations, no insurance billing). Introductory primer.

*(First attempt of this query timed out at 60s with search_context_size=high. Retried at search_context_size=medium and succeeded.)*

### Query 4 — Backend Systems

> For a solo private-pay IEP advocate launching a practice, what backend operational systems are needed for file organization and contracts? Specifically: (1) cloud storage options that handle FERPA-regulated student records (Google Workspace Business vs Microsoft 365 Business — encryption, access controls, sharing model), (2) recommended folder structure for an advocacy practice with multiple ongoing clients, (3) document retention policy norms for advocacy records (typical 7-year baseline, when longer applies), (4) e-signature tools for the services agreement (Google native, DocuSign, PandaDoc, HelloSign) and what features matter for a solo practice, (5) calendar/scheduling tools (Calendly, Google Appointments) and how they integrate with intake, (6) practical secure-deletion practices for cloud storage at the end of retention. Provide an introductory overview.

### Query 5 — Intake Process

> For a solo IEP advocate building a custom client intake process, what is the standard workflow from first parent inquiry to signed engagement? Specifically: (1) the discovery / fit call — purpose, length, free vs paid, what to screen for (advocate-side conflicts of interest, scope fit, capacity), (2) intake form content (family contact, student basics, presenting concern, current supports, records to gather, referral source) and how to collect it securely, (3) the welcome packet — what expectations to set (modality, communication norms, response times, what the advocate does and does not do), (4) the services agreement — what an advocate needs in it before sending to an attorney for review (parties, scope of services, fees, cancellation, confidentiality, liability, governing law), (5) practical steps from agreement signature to first paid session, (6) common pitfalls in advocate intake (mismatched expectations, FERPA records handling, conflict-of-interest screening). Provide an introductory primer.

---

## 3. Perplexity Raw Responses

→ See **[02-perplexity-raw-responses.md](02-perplexity-raw-responses.md)**

---

## 4. Final Synthesized Response (delivered in chat)

→ See **[03-final-synthesis.md](03-final-synthesis.md)**

---

## 5. Open Idea — "Questions for the Live Call" companion block

Floated by Taylor after seeing the synthesized output: in addition to the introductory research paragraph, surface a short list of **suggested questions Rylee could bring to Dr. Annie's group call or to her professional gates (attorney, CPA, IDFPR, insurance underwriter)**. Each question gets a Rylee-side approve/deny so she can:

- mark "ask in class" — the question stays as an open item for the next live call
- mark "already know this" — short reason, question is dropped (signals where the research overshot her existing expertise)
- mark "ask my [attorney / CPA / IDFPR / underwriter]" — routes to the correct professional gate

This converts the initial-research block from one-way reading material into an interactive triage that calibrates how deep future research needs to go. Useful side effect: tracks which subjects Rylee is already strong in, so subsequent module research can compress those sections.

Example shape (per H2 heading, appended after the works cited):

```markdown
**Suggested questions to bring to the live call / professional**

- [ ] Q: Does IDFPR currently treat BCBA-owned non-clinical advocacy entities as requiring PLLC, or is LLC sufficient? *(IDFPR)*
- [ ] Q: For a single-member LLC, does Illinois require a separate registered agent, or can I serve as my own? *(known / drop)*
- [ ] Q: Does Dr. Annie recommend a name that signals BCBA credentials, or stay credential-neutral? *(live call)*
```

Not implemented in this test. Up to Taylor whether to wire it into the dashboard template + scrape format.

---

## 6. Notes on the workflow itself

**What worked**
- 5 parallel Perplexity calls returned usable material in ~60-90 seconds total (1 retry needed at lower context size).
- Citation-per-sentence in the final synthesis is feasible without sounding stilted.
- The research stayed clearly bounded to "introductory primer" — didn't drift into prescription.

**What to watch**
- Source quality varies. Some Perplexity citations are marketing pages (CM&F, CPH) — fine for "what carriers exist" but not for legal/regulatory claims. IL-specific authoritative sources (IDFPR, IL SOS, ILABA) anchor the riskier claims.
- Cost: high search_context_size on 5 simultaneous queries is non-trivial. Medium worked fine for the retry — may be the right default.
- One query timed out at 60s with high context — retry policy needed if this gets automated.

**Decision Taylor is testing**
Whether automated pre-module research is worth wiring into the dashboard scaffold at all, or whether the cost/noise outweighs Rylee's own ability to ask Dr. Annie directly. Adding the "suggested questions" companion is one way to make the auto-research earn its keep — it converts passive intro material into an active checklist.
