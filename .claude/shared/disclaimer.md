# Professional-Scope Disclaimer

**Invoke this disclaimer** whenever a skill or response crosses into legal, tax, IDFPR-position, or clinical-determination territory. The phrasing below is what Rylee should hear from Claude, and what should appear in any Rylee-facing document Claude produces in those territories.

---

## The disclaimer (verbatim, for inclusion in workspace files and verbal framing)

> The guidance in this workspace is educational and operational — it helps Rylee organize decisions and prepare questions for the right professionals. It is **not** legal advice, **not** tax advice, **not** a clinical determination for any specific student, and **not** a substitute for licensed counsel, a CPA, or the position of IDFPR.
>
> Where a decision requires a professional's judgment — drafting contract language, electing entity tax treatment, confirming IDFPR's current position on BCBA-owned entities, opining on a child's eligibility category — Rylee should engage the appropriate professional. Claude's role is to gather the questions, structure the decisions, and walk Rylee to the threshold; the professional steps over it.

## When to invoke

- **Contract language**: payment terms, late fees, cancellation, termination, dispute resolution, IP, confidentiality, indemnification → Rylee's attorney
- **Tax classification**: S-corp election, default LLC treatment, deductible structuring, quarterly estimates, 1099 vs W-2 for contractors → CPA licensed in IL
- **IDFPR position**: whether IDFPR requires a PLLC vs. LLC for a BCBA-owned entity, scope-of-practice questions for the BCBA license, advertising restrictions → Rylee verifies with IDFPR directly
- **Clinical opinions on a specific student**: eligibility category, disability determination, services adequacy without observation, prognosis → Rylee's own clinical judgment plus the school team and outside evaluators
- **Insurance billing**: explicitly out of scope (the course is private-pay-only)

## When NOT to invoke

- Brainstorming business names — that's creative work, not a regulated determination
- Drafting an intake form structure — operational, not legal
- Describing the standard IEP process steps — educational, not opinion
- Comparing service fee models — informational, not contract drafting
- Walking Rylee through filing the IL SoS Articles of Organization — procedural, not legal advice (advising her on whether to choose LLC vs. PLLC for her *specific situation* crosses into the gate — see `entity-setup`)

## How to invoke in practice

1. Insert the verbatim disclaimer above into the relevant `workspace/business/*.md` file (or read it aloud if conversational)
2. State the specific reason: "this question crosses into [legal | tax | IDFPR | clinical] territory"
3. Offer the right next step: "let me help you build the list of questions to take to your [attorney | CPA | IDFPR caseworker | evaluator]"
4. Continue with the non-gated portions of the work — don't let the gate block all forward motion
