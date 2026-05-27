---
name: backend-systems
description: Designs the back-end operational systems for a private IEP advocacy practice — cloud storage and folder structure, document retention policy, e-signature tooling for the services agreement, calendar/scheduling, and email setup. Use when the user asks about practice infrastructure, file organization, Google Drive setup, document retention, e-signature, DocuSign, scheduling tools, or how to organize client records. Hands contract language to intake-process; hands EIN/banking to entity-setup.
---

# backend-systems

Source module: **Module 1 — Business of Private Pay** (deliverable: set up back-end systems for file organization and contracts).

## I produce

- A folder convention for Rylee's cloud drive that mirrors the `workspace/clients/<id>/` shape used in this repo
- A document retention policy (how long to keep records after a client ends, where they live during retention, who can access)
- A short list of e-signature tools appropriate for a solo practice, with the trade-offs
- Recommendations for scheduling, email, and calendar that support the intake workflow without overbuilding
- A populated `workspace/business/backend-systems.md` capturing her choices

## I do not produce

- A binding services agreement — that's `intake-process` plus her attorney
- Specific contract clauses for data handling — that's her attorney; the retention policy here is operational, not legal
- HIPAA or FERPA compliance certification — Rylee is generally not a HIPAA covered entity in this role (no insurance billing, no provider relationship), but FERPA touches the records she handles; defer specifics to her attorney
- Banking setup, EIN — those live in `entity-setup`
- Practice-management SaaS recommendations beyond what fits a solo private-pay advocacy practice (no need for SimplePractice or TheraNest scale at week one)

## Procedure

1. Read `workspace/business/backend-systems.md` if present. Continue.

2. **Cloud storage choice**. Walk Rylee through:
   - **Google Workspace** (Business Starter or higher) — strong default. Docs, Sheets, Drive, Gmail at her domain, Calendar, Meet. Pairs cleanly with most e-signature tools. The Business Starter tier is fine for solo.
   - **Microsoft 365 Business** — equivalent stack. Choose based on what she already uses personally and what her likely referral partners use.
   - **iCloud + Apple** — adequate for storage but weaker for client-facing scheduling/email at a domain. Not recommended as the sole stack.
   - **Dropbox + email at domain** — workable but adds tool sprawl.

   The recommendation skews to Google Workspace unless she has a strong existing preference. The reason is integration with the e-signature tools and scheduling tools in steps 4 and 5.

3. **Folder convention** on her cloud drive. Mirror the `workspace/clients/<id>/` shape from this repo so the mental model is the same:

   ```
   Drive/
   ├── 00-Business/
   │   ├── Entity (filed Articles, EIN letter — store the EIN letter in password manager, not here)
   │   ├── Insurance (declarations page, policy doc)
   │   ├── Contracts (services agreement template, signed copies)
   │   └── Marketing
   ├── 01-Clients/
   │   ├── <ClientId>/  (e.g., marcus-t-d214 — same convention as this repo)
   │   │   ├── Intake (signed intake form, welcome packet acknowledgment, signed services agreement)
   │   │   ├── Records (IEPs, evaluations, PWNs — district-provided documents)
   │   │   ├── Notes (session notes, prep notes — per session)
   │   │   ├── Correspondence (emails with district, copies of letters sent)
   │   │   └── Billing (invoices, payment receipts)
   │   └── ...
   ├── 02-Templates/ (intake-form blank, welcome-packet blank, etc.)
   ├── 03-Course/ (Rylee's PIVOT course materials, workbook scans, group call recordings)
   └── 99-Archive/ (closed clients — see retention policy below)
   ```

   **Why this shape**: client_id matches what Codex uses in `workspace/clients/`, so when Rylee references "marcus-t-d214" in either system, she means the same client. Reduces mental switching.

4. **E-signature tooling**. Solo-practice options:
   - **DocuSign** — industry standard, ~$15–25/mo. Overkill for low signature volume but solid integrations.
   - **HelloSign / Dropbox Sign** — comparable, simpler UI.
   - **PandaDoc** — adds proposal/contract editor; useful if Rylee wants to send service quotes with the agreement.
   - **Google Workspace + eSignature** (now native in Google Docs for paid tiers) — simplest if she's on Google already.

   The recommendation: start with Google's native eSignature if she's on Workspace; upgrade to DocuSign/PandaDoc only if volume justifies it (5+ signatures/month).

5. **Calendar and scheduling**:
   - **Calendar**: Google Calendar (or Outlook) at her domain — the *email at her domain* matters more than the calendar tool itself
   - **Scheduling page**: Calendly, SavvyCal, or Cal.com. Use a free tier for screening calls; paid tier (~$10/mo) for managing the multiple service types in `services-fees`
   - **Pre-call form** integrated into the scheduling link — capture parent name, student grade, district, and one-line concern before the call

6. **Email at her domain**. Mailbox at the business domain Rylee chose in `business-name` (e.g., `rylee@<practice-domain>.com`). Set this up *before* sending the welcome packet to her first client — sending from a personal gmail signals not-quite-real to wary parents.

7. **Document retention policy**. State it as a policy decision, not a legal requirement (she ratifies with her attorney for the actual contract language):
   - **Active client**: all records in `01-Clients/<ClientId>/`
   - **Client ends (services concluded)**: move folder to `99-Archive/<year-ended>/<ClientId>/`
   - **Retention period**: minimum 7 years from last service date (a common professional standard; her attorney confirms whether IL or her policy requires longer)
   - **At end of retention**: secure delete (not just trash — purge from Drive's deleted-items too); document the deletion date in `workspace/business/backend-systems.md`
   - **Earlier deletion only if**: client requests it in writing and the request doesn't conflict with any pending dispute Rylee should preserve records for

8. **Access controls**. Solo practice = Rylee is the only account. But:
   - 2FA on the Workspace admin account (hardware key recommended for the admin account, even if she only uses TOTP on the day-to-day account)
   - Separate the Workspace admin from her day-to-day email (best practice — Google nudges this)
   - If she contracts with a VA later, scope their access to specific folders, not the whole Drive

9. **Append to** `workspace/business/backend-systems.md`:

   ```markdown
   ---
   client_id: none
   created: <today>
   last_updated: <today>
   module_context: module-1
   ---

   ## Cloud stack

   - **Provider**: Google Workspace | Microsoft 365 | other (___)
   - **Domain**: ...
   - **Business email**: ...
   - **2FA**: [ ] enabled on admin | [ ] enabled on day-to-day | [ ] hardware key for admin

   ## Folder structure

   - [ ] 00-Business created
   - [ ] 01-Clients created
   - [ ] 02-Templates seeded (intake-form, welcome-packet, services-agreement)
   - [ ] 03-Course created
   - [ ] 99-Archive created

   ## E-signature

   - **Tool**: ...
   - **First contract signed via tool**: [ ]

   ## Scheduling

   - **Scheduling page URL**: ...
   - **Pre-call form fields confirmed**: [ ]

   ## Retention policy

   - **Active retention location**: 01-Clients/<ClientId>/
   - **Archive location**: 99-Archive/<year>/<ClientId>/
   - **Retention period**: 7 years from last service date (ratify with attorney)
   - **Secure deletion procedure**: ___

   ## Open questions for attorney (-> intake-process services-agreement checklist)

   - Required retention period under IL law / her policy
   - Data-handling clause for the services agreement (consent, breach notification, etc.)
   ```

## Cross-references

- **Contract language for data handling** → `intake-process` services-agreement checklist (attorney input)
- **EIN and banking** → `entity-setup`
- **Domain purchase tied to business name** → `business-name`
- **Per-service intake fields** → `intake-process`
- **Fee invoicing cadence** → `services-fees`

## What Rylee already knows

- File organization at the agency/school level — the new framing is a *solo-practice* shape where she's the only admin and the only backup person
- The sensitivity of student educational records — FERPA's framing from the school side. The new question is how those records are handled when she holds them as an advocate, not as a school employee.
