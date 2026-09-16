import { notFound } from "next/navigation";
import { requireSignedInUser } from "@/lib/authz";
import { formatDuration, isIsoDate, isIsoMonth, monthLabel, monthOf, monthRange, todayIso } from "@/lib/dates";
import {
  getDailyCounts,
  listEntriesForDate,
  type CaseEntry,
  type DailyCount,
} from "@/lib/entries";
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
  const today = todayIso();
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
  if (!dbError) {
    try {
      entries = await listEntriesForDate(actor.orgId, selected);
    } catch {
      dbError = true;
    }
  }

  const totalCases = counts.reduce((sum, c) => sum + c.count, 0);
  const totalMinutes = counts.reduce((sum, c) => sum + c.minutes, 0);
  const daysLogged = counts.length;
  const avg = daysLogged ? (totalCases / daysLogged).toFixed(1) : "0";
  const perCase = totalCases ? Math.round(totalMinutes / totalCases) : 0;

  return (
    <div className="space-y-8">
      {dbError && <DbNotice />}

      <header className="space-y-4">
        <h1 className="font-serif text-3xl font-bold">{title}</h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Cases"
            value={totalCases}
            hint={`${daysLogged} ${daysLogged === 1 ? "day" : "days"} logged`}
          />
          <StatTile label="Case time" value={formatDuration(totalMinutes)} hint="hours:minutes" />
          <StatTile label="Cases per day" value={avg} hint="on logged days" />
          <StatTile label="Minutes per case" value={perCase} hint="average" />
        </div>
      </header>

      <DayPanel
        date={selected}
        today={today}
        entries={entries}
        actions={<SpreadsheetActions ym={ym} />}
      />

    </div>
  );
}
