# PII Policy

Concrete rules for what goes in git, what stays in `workspace/`, and what never lands in any file. Referenced from `CLAUDE.md` and from the `intake-process` skill.

## The fence

- **In git** (tracked, public-if-published): `modules.md`, `CLAUDE.md`, `.claude/**`, `.gitignore`
- **Not in git** (gitignored): everything under `workspace/`
- **Not in any file** (password manager only): EIN, SSN, full bank/account numbers, child DOB exact dates, parent home addresses

`workspace/` is the only place client PII lives, and `workspace/` is gitignored. Period.

## Constructing a `client_id`

Pattern: `<first-name-lowercase>-<last-initial-lowercase>-<district-abbr-lowercase>`

Examples:
- Marcus Thompson at Township High School District 214 → `marcus-t-d214`
- Sarah Park-Williams at CCSD 93 → `sarah-p-ccsd93`

Rules:
- First name only (full first name is fine — it's not uniquely identifying without the rest)
- Last initial only — never the full last name in any committed or workspace file path
- District as the **official abbreviation** (look it up from the district's own communications; do not invent one)
- All lowercase, hyphen-separated, no spaces

## Constructing `{client_display_name}` (for the body of files)

Pattern: `<First Name> <Last Initial>.`

Examples:
- `Marcus T.`
- `Sarah P.`

This is what appears in the populated intake-form, welcome-packet, IEP checklist, and session-log — NOT the full last name.

## District names

- Use the abbreviation in any file: `D214`, `CCSD93`, `NSSD112`
- Never write out the full district name in a committed file (it indexes searchable)
- In conversation, Rylee can use full names freely — they just don't get written down

## Identifiers Claude must never write to a file

| Identifier | Where it lives |
|---|---|
| EIN (Federal Employer ID) | Password manager. The `entity-setup` skill explicitly enforces this. |
| SSN (Rylee's or anyone's) | Password manager. Never. |
| Child's full date of birth | Use year only (e.g., `DOB year: 2014`) in any committed file. Workspace files may use full DOB for accurate age calculations. |
| Parent's home address | Workspace only. Never committed. |
| Student's full name | Use `{client_display_name}` (first + last initial) instead. |
| Student's medical record numbers | Workspace only. |
| Insurance policy numbers | Workspace only. |
| Bank account / routing numbers | Password manager. Never. |

## Workspace file PII

Even inside `workspace/` (which is gitignored), apply the **principle of least PII**:

- Do not duplicate PII across files — keep parent contact in `intake.md`, not also in `session-log.md`
- Anonymize when a workspace file might be shared (e.g., a case summary Rylee shows a colleague) — copy → anonymize → share, never share the original

## Anonymization for course discussion

If Rylee wants to discuss a client case on a group call or in the graduate community:
- Replace `{client_display_name}` with `Student A` / `Student B`
- Replace the district abbreviation with `District 1` / `District 2`
- Remove dates of birth, replace with grade level only
- Remove dates of meetings, replace with relative timing ("last month," "two weeks ago")

This is the same standard most clinical case-discussion forums use.

## What about Rylee's own PII?

Her name, NSSEO affiliation, BCBA credential, and NPI are *already* in public registries (LinkedIn, NPI database, BACB). The course content discusses her openly. So `profile.md` (at the repo root) includes her name and role — that's intentional, not a leak.

What stays off-record even for Rylee:
- Her EIN (once she has one)
- Her bank account / routing numbers for the practice
- Her home address (if she's using it as a registered agent address, it'll be public on the IL SoS record — that's her choice; Claude doesn't *write* it into the repo regardless)
