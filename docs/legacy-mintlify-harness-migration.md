# Legacy Mintlify Harness Migration

Date: 2026-07-04

This repo absorbed the useful internal material from `C:\Users\TC933\Projects\iep-harness`, the older Mintlify-based course/harness workspace for Rylee's PIVOT into IEP Advocacy course work.

## What moved here

- Module 1 private workspace notes now live under `workspace/course/`.
- Business setup workspace notes now live under `workspace/business/`.
- The legacy client-folder convention note now lives at `workspace/clients/README.md`.
- The `business-name` skill keeps the newer `rylee-iep` structure, with the older harness's explicit output boundaries merged in.

## What did not move

- Mintlify branding assets, starter logos, generated screenshots, and public docs shell files were not copied.
- Client-facing Shirley Road IEP Advocacy content should be drafted separately from this internal course workspace.
- Course/harness/workspace language remains private and should not be reused verbatim in the future public Mintlify site.

## Current source of truth

- Course context: `.claude/shared/course-context.md`
- Professional-scope gate: `.claude/shared/disclaimer.md`
- PII policy: `.claude/shared/pii-policy.md`
- Private working notes: `workspace/` (gitignored)
- Public/client education draft work: future Shirley Road Mintlify pass, separate from this migration