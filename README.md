# Rylee's Case Log

A private, phone-friendly case log for Rylee's workday. It replaces the Excel workbook she was keeping by hand: a **Daily Case Counts** sheet plus one sheet per month with every case she touched.

Live at https://rylee-iep-production.up.railway.app (Clerk sign-in required).

## What it does

- **Daily Case Counts** (home tab) — today's log with the add form always open, then a table of every logged day with its case count and case time, newest first.
- **Month tabs** (July 2026 onward, one per month through the current month) — that month's daily counts on the left and the full log for a chosen day on the right. Tap any date to switch days.
- **Rows** mirror the workbook columns: Date · Case # · Case Type · Start · End · Duration · Notes. Duration is computed from start and end.
- **Case types** and their colours match the workbook: Reconsideration, Authorization Revision, Recon Reply, Continuation, BCBA Reply, Additional Info, Lunch / break, Other. Breaks are logged for the timeline but never counted as cases.
- **Fast entry** — the new row's start time is prefilled from the previous row's end time, the end time defaults to now, and both fields have a **Now** button. Case type sticks to whatever was used last. After saving, focus jumps back to Case # for the next one.
- **Edit / delete** any row inline. Delete asks for a second tap.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · MongoDB · Clerk · Railway (Railpack).

| Path | Purpose |
|---|---|
| `app/(app)/page.tsx` | Home: today + Daily Case Counts |
| `app/(app)/month/[ym]/page.tsx` | Month sheet (`/month/2026-08?d=2026-08-17`) |
| `app/actions/entries.ts` | Server actions: create / update / delete a row |
| `lib/entries.ts` | MongoDB access for the `case_entries` collection and daily aggregates |
| `lib/entry-schema.ts` | Zod schema, case types, colours |
| `lib/dates.ts` | Date helpers; "today" resolves in `America/Chicago` |
| `components/EntryForm.tsx` | The add / edit form |
| `components/EntryTable.tsx` | The day's rows with edit and delete |
| `proxy.ts` | Clerk middleware; everything except `/sign-in` and `/api/health` requires sign-in |

Data is scoped per Clerk user (or organization), so each signed-in account sees only its own log.

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in MONGODB_URI, MONGODB_DB, Clerk keys
pnpm dev
```

On Windows machines where Node cannot resolve `mongodb+srv://` hosts, add `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` to `.env.local`. It is a no-op when unset.

Checks: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`.

## Deploy

Railway builds from the `nextjs-rebuild` branch with Railpack (`pnpm build` / `pnpm start`, health check at `/api/health`). Environment variables live on the Railway service.

## Claude Code harness

The `.claude/` folder, `modules.md`, `profile.md`, `content/` and `workspace/` belong to the separate Claude Code harness for Rylee's IEP advocacy course work. They are not served by the web app. See `CLAUDE.md`.
