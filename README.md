# Rylee's Case Log

A private, phone-friendly case log for Rylee's workday. It replaces the Excel workbook she kept by hand: a **Daily Case Counts** sheet plus one sheet per month with every case she touched.

Live at https://acentra-case-tracker.up.railway.app (Clerk sign-in required).

## What it does

The app opens on **today's log**: the site root (and the wordmark) goes to the current month's Case Tracker page, which selects today when no day is given.

### Calendar (`/calendar`)

- Three headline tiles: today, the last seven days, and the month so far.
- A **month card** with a `<` `>` pager: a calendar where each day's shade shows how busy it was on a five-step green ramp (tap a day to open it), four totals underneath (cases, days logged, case time, minutes per case), the stacked **time-by-type bar**, and a collapsible per-type table (rows, time, share).

### Case Counts

The workbook's "Daily Case Counts" sheet on its own tab: every logged day, newest first, with a stacked bar of time by type and a footer of totals.

### Case Tracker (month pages)

The **Case Tracker** tab opens a menu of months, newest first, with a check on the one you are viewing. Months appear on their own: the list runs from July 2026 through the current month, so a new month shows up on its 1st. There is nothing to add by hand. A month added early with the old + button stays hidden until its 1st; older custom month names in the `month_tabs` collection still show.

A month page shows four tiles for the **selected day** (cases, with the month's cases-per-day average underneath; case time; minutes per case; rows logged) and then **that day's log**:

- `<` `>` arrows beside the day title step through days; forward stops at today, where an empty day is ready for its first row.
- **Pages of rows.** The log shows as many rows as fit the window (5 to 15), with a "1–11 of 33" pager underneath, so the page itself never scrolls. It goes back to page 1 when the sort, filter or day changes, or when a row is added.
- **Running clock.** A row logged today with a start and no end is still open: its End cell shows a live `0:07:32` clock. Click it to stop, which stamps End with the current time. Several cases can run at once; nothing stops on its own.
- A row of **filter chips** (All, then one per type with its count). A chip collapses the other rows with an animation; rows stay mounted so nothing is lost.
- Rows are listed **newest first**: the latest start time on top, so a row just added appears at the top of the table.
- **Sortable columns.** Click Case #, Start, End, or Length to sort by it; click again to reverse. The first click gives the lowest case number, or the latest start / end, or the longest length. Rows missing that value sort last. The sort resets to newest first on reload.
- **Rows edit in place.** Click a case number, type chip, start, end, or note and change it; it saves when the field loses focus (type saves on pick). Length is recomputed.
- **Delete** by holding the trash icon (visible on the hovered row) for 1.5 s. A toast at the bottom offers **Undo**, which recreates the row.
- **Add a row** opens a two-step dialog.
  - Step one is the case number, with a calendar icon at its right end for logging a different day. Below it are "Used today" type chips, then the Type, which starts on the last row's type, or Reconsideration on the first row of a day.
  - The case number must be exactly **9 digits**. While typing, up to five recent case numbers (from the last 30 days) that contain the typed digits are suggested; pick one with the arrow keys and Enter, or click.
  - Step two is start and end, each with a clock icon that stamps the current time, plus an optional note. On today Start is the current time and End is left blank, so the case runs as a clock in the log. On a past day Start picks up where that day's last row ended.
  - The 9-digit rule applies to new rows and to changing a row's number. Older rows keep their numbers when other fields are edited, and so do Undo and spreadsheet imports.
- **Time follows the user's machine.** "Now" is the browser's clock, and the server learns the browser's timezone from a `tz` cookie (`components/TimeZoneCookie.tsx`, `lib/timezone.ts`). Rylee's Eastern PC therefore shows Eastern time; before the cookie arrives the server falls back to `America/Chicago`.
- **Import Excel** and **Export to .xlsx** icons next to Add a row. Import reads a workbook in the layout below and skips rows already logged; export writes the month back in the same layout.

### Case types

Every log starts with eleven types, matching the workbook's dropdown, in three categories. **Case Work** (needs a case number and counts as a case): Reconsideration, Recon Reply, Continuation, BCBA Reply, Authorization Revision, Additional Info, Initial. **Other Time** (counts as a case only when a case number is given): Phone Call, Meeting, Admin Tasks. **Break** (never counts): Lunch.

The **pencil on the day table's Type header** opens the Case Types dialog: rename or recolour a type, drag it between the Case Work, Other Time and Break sections to change its category, add one with **+ Add New Case Type**, or remove one by holding the trash icon that shows on hover (the same 1.5 s hold as rows, `components/HoldToDeleteButton.tsx`). Changes save as you go and reach every row, chip and count at once, since rows store a stable key and look up the label. Removing a type no row uses deletes it; removing one that rows use archives it (hidden from the pickers, still labelling those rows), with Restore in the dialog and Undo in the toast. Types are per log. Built-ins live in `lib/case-types.ts`; overrides and added types in the `case_types` collection.

### Accounts, viewing as, dark mode

- Each Clerk user sees only their own log. Rylee's data is scoped to her user id.
- Admins (ids in `RYLEE_ADMIN_USER_IDS`) get **View as …** entries inside the Clerk avatar menu to browse and edit another user's log; **Back to my log** returns. Nothing about this shows on the page for other users.
- The avatar menu holds a Dark mode / Light mode switch; Clerk's sign-in card and menu follow the theme.
- Branding follows Acentra Health (green wordmark, Roboto and Lato, pill buttons); see `docs/acentra-design.md`.

## Spreadsheet format

`docs/import-format.md` documents the workbook layout the importer expects (sheet names, headers, cell types, type labels and aliases, dedupe). `docs/import-samples/` holds three reference workbooks, regenerated by `node scripts/make-sample-workbooks.mjs`. Use them as the target format when converting Rylee's own spreadsheets.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · next-themes · MongoDB · Clerk (+ `@clerk/themes`) · SheetJS · Railway (Railpack).

| Path | Purpose |
|---|---|
| `app/(app)/page.tsx` | Site root: redirects to today's log (`/month/<current month>`) |
| `app/(app)/calendar/page.tsx` | Calendar: tiles and the month card |
| `app/(app)/counts/page.tsx` | Case Counts: the daily sheet |
| `app/(app)/month/[ym]/page.tsx` | Month tab (`/month/2026-08?d=2026-08-17`) |
| `app/(app)/layout.tsx` | Header: wordmark, tabs, account menu |
| `app/actions/entries.ts` | Server actions: create / update / delete a row |
| `app/actions/import.ts`, `app/api/export/[ym]/route.ts` | Workbook import and export |
| `lib/months.ts` | The months the Case Tracker menu lists |
| `app/actions/view-as.ts`, `lib/authz.ts` | Sign-in check, admin list, view-as cookie |
| `lib/entries.ts` | MongoDB access for `case_entries` and the daily / monthly aggregates |
| `lib/entry-schema.ts` | Zod row schema |
| `lib/case-types.ts`, `lib/case-types-db.ts`, `app/actions/case-types.ts` | Built-in types, colour palette and category rules; per-log overrides; the dialog's server actions |
| `components/CaseTypesProvider.tsx`, `CaseTypesDialog.tsx` | The log's types for every client component (`useCaseTypes()`); the edit dialog |
| `lib/spreadsheet.ts` | Workbook parser used by the import dialog |
| `lib/dates.ts` | Date helpers; `nowTime` / `localTodayIso` read the browser clock, `todayIso(now, tz)` the server's view |
| `lib/timezone.ts`, `components/TimeZoneCookie.tsx` | The browser reports its timezone in the `tz` cookie; `userToday()` gives the server "today" |
| `components/DayPanel.tsx`, `DayLog.tsx`, `EntryTable.tsx` | The day header, filter chips, and inline-editable rows |
| `components/AddEntryDialog.tsx`, `EntryForm.tsx` | The two-step add dialog and the shared form |
| `components/MonthInsightCards.tsx`, `DailyCountsTable.tsx`, `TypeMix.tsx` | Calendar card, daily sheet, type bar and chips |
| `components/MonthNav.tsx`, `AccountMenu.tsx`, `ClerkAppearanceProvider.tsx` | Header pieces: Calendar, Case Counts and the Case Tracker month menu; the account menu carries the theme switch and View as |
| `proxy.ts` | Clerk middleware; everything except `/sign-in` and `/api/health` requires sign-in |

MongoDB collections: `case_entries` (rows), `month_tabs` (added or renamed tabs), `case_types` (renamed, recoloured, archived, removed or added types), `audit_events`. All are scoped by `orgId`, which is the Clerk user id unless an admin is viewing as someone else.

## Local development

```bash
pnpm install
cp .env.example .env.local   # MONGODB_URI, MONGODB_DB, Clerk keys, RYLEE_ADMIN_USER_IDS
pnpm dev
```

On Windows machines where Node cannot resolve `mongodb+srv://` hosts, add `MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8` to `.env.local`. It is a no-op when unset.

To drive a signed-in browser without Google OAuth (screenshots, checks), mint a Clerk sign-in token (`clerk api /sign_in_tokens`) and open `/sign-in?__clerk_ticket=<token>&redirect_url=/`.

Checks: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`. If a change to `app/globals.css` does not show up, restart `pnpm dev` after deleting `.next`.

## Deploy

Railway builds from the `master` branch with Railpack (`pnpm build` / `pnpm start`, health check at `/api/health`). Every push to master deploys. Environment variables live on the Railway service: `MONGODB_URI`, `MONGODB_DB`, the Clerk keys, and `RYLEE_ADMIN_USER_IDS`.

## Claude Code harness

The `.claude/` folder, `modules.md`, `profile.md`, `content/` and `workspace/` belong to the separate Claude Code harness for Rylee's IEP advocacy course work. They are not served by the web app. See `CLAUDE.md`.
