import { notFound } from "next/navigation";
import { requireSignedInUser } from "@/lib/authz";
import { addDays, formatDuration, isIsoDate, isIsoMonth, monthLabel, monthOf, monthRange } from "@/lib/dates";
import {
  getDailyCounts,
  listEntriesForDate,
  listRecentCaseNumbers,
  type CaseEntry,
  type DailyCount,
} from "@/lib/entries";
import type { RecentCase } from "@/lib/entry-schema";
import { userToday } from "@/lib/timezone";
import { getMonthTabLabel } from "@/lib/months";
import { DayPanel } from "@/components/DayPanel";
import { DbNotice } from "@/components/DbNotice";
import { SpreadsheetActions } from "@/components/SpreadsheetActions";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

// One workbook sheet: the month's totals, its logged days, and the full log for
// the chosen day.
export default async function MonthPage({
  params,
  searchParams,
}: {
  params: Promise<{ ym: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { ym } = await params;
  if (!isIsoMonth(ym)) notFound();

  const { d } = await searchParams;
  const today = await userToday();
  const range = monthRange(ym);

  const actor = await requireSignedInUser();
  let title = monthLabel(ym);
  let counts: DailyCount[] = [];
  let dbError = false;

  try {
    [counts, title] = await Promise.all([
      getDailyCounts(actor.orgId, range),
      getMonthTabLabel(actor.orgId, ym),
    ]);
  } catch {
    dbError = true;
  }

  // Selected day: ?d= if valid and inside this month; else today if this is the
  // current month; else the latest logged day; else the 1st.
  let selected = counts.at(-1)?.date ?? `${ym}-01`;
  if (d && isIsoDate(d) && monthOf(d) === ym) selected = d;
  else if (monthOf(today) === ym) selected = today;

  let entries: CaseEntry[] = [];
  let recentCases: RecentCase[] = [];
  if (!dbError) {
    try {
      [entries, recentCases] = await Promise.all([
        listEntriesForDate(actor.orgId, selected),
        // Suggestions for the add dialog: numbers worked in the last 30 days.
        listRecentCaseNumbers(actor.orgId, addDays(today, -30)),
      ]);
    } catch {
      dbError = true;
    }
  }

  // Tiles show the selected day; the month's cases-per-day is the yardstick.
  const monthCases = counts.reduce((sum, c) => sum + c.count, 0);
  const monthAvg = counts.length ? (monthCases / counts.length).toFixed(1) : "0";
  const day = counts.find((c) => c.date === selected);
  const dayCases = day?.count ?? 0;
  const dayMinutes = day?.minutes ?? 0;
  const dayPerCase = dayCases ? Math.round(dayMinutes / dayCases) : 0;
  const dayLabelShort = selected === today ? "today" : "this day";

  return (
    <div className="space-y-8">
      {dbError && <DbNotice />}

      {/* The tab strip already names the month; keep the heading for screen readers only. */}
      <h1 className="sr-only">{title}</h1>

      {/* Day header first, then the month's totals, then the day's rows. */}
      <DayPanel
        date={selected}
        today={today}
        entries={entries}
        recentCases={recentCases}
        actions={<SpreadsheetActions ym={ym} />}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Day totals">
          <StatTile label="Cases" value={dayCases} hint={`Month avg ${monthAvg} per day`} />
          <StatTile label="Case time" value={formatDuration(dayMinutes)} hint="hours:minutes" />
          <StatTile label="Minutes per case" value={dayPerCase} hint={`average ${dayLabelShort}`} />
          <StatTile label="Rows logged" value={entries.length} hint={dayLabelShort} />
        </div>
      </DayPanel>

    </div>
  );
}
