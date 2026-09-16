import { notFound } from "next/navigation";
import { requireSignedInUser } from "@/lib/authz";
import { formatDuration, isIsoDate, isIsoMonth, monthLabel, monthOf, monthRange, todayIso } from "@/lib/dates";
import { getDailyCounts, listEntriesForDate, type CaseEntry, type DailyCount } from "@/lib/entries";
import { DailyCountsTable } from "@/components/DailyCountsTable";
import { DayPanel } from "@/components/DayPanel";
import { DbNotice } from "@/components/DbNotice";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

// One workbook sheet: the month's daily counts plus the full log for a chosen day.
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
  let counts: DailyCount[] = [];
  let dbError = false;

  try {
    counts = await getDailyCounts(actor.orgId, range);
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

  return (
    <div className="space-y-6">
      {dbError && <DbNotice />}

      <header>
        <h1 className="font-serif text-2xl font-bold">{monthLabel(ym)}</h1>
        <p className="text-sm text-muted-foreground">
          Pick a day on the left to see or edit its rows.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Cases" value={totalCases} />
        <StatTile label="Days logged" value={daysLogged} />
        <StatTile label="Avg per day" value={avg} hint="on logged days" />
        <StatTile label="Case time" value={formatDuration(totalMinutes)} hint="hours:minutes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-label="Daily case counts" className="space-y-2">
          <h2 className="font-serif text-base font-semibold">Daily case counts</h2>
          <DailyCountsTable
            rows={counts}
            highlight={selected}
            emptyMessage={`Nothing logged in ${monthLabel(ym)} yet.`}
          />
        </section>

        <DayPanel date={selected} today={today} entries={entries} />
      </div>
    </div>
  );
}
