import { requireSignedInUser } from "@/lib/authz";
import { addDays, formatDuration, monthLabel, monthOf, monthRange, todayIso } from "@/lib/dates";
import { getDailyCounts, listEntriesForDate, type CaseEntry, type DailyCount } from "@/lib/entries";
import { DailyCountsTable } from "@/components/DailyCountsTable";
import { DayPanel } from "@/components/DayPanel";
import { DbNotice } from "@/components/DbNotice";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

// Home: today's log with the add form open, then the "Daily Case Counts" sheet
// (every logged day, newest first).
export default async function TodayPage() {
  const actor = await requireSignedInUser();
  const today = todayIso();
  const ym = monthOf(today);
  const weekStart = addDays(today, -6);

  let entries: CaseEntry[] = [];
  let allDays: DailyCount[] = [];
  let dbError = false;

  try {
    [entries, allDays] = await Promise.all([
      listEntriesForDate(actor.orgId, today),
      getDailyCounts(actor.orgId),
    ]);
  } catch {
    dbError = true;
  }

  const monthToDate = allDays.filter((d) => d.date >= monthRange(ym).from && d.date <= today);
  const lastSeven = allDays.filter((d) => d.date >= weekStart && d.date <= today);
  const todayRow = allDays.find((d) => d.date === today);

  return (
    <div className="space-y-8">
      {dbError && <DbNotice />}

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          label="Today"
          value={todayRow?.count ?? 0}
          hint={todayRow?.minutes ? `${formatDuration(todayRow.minutes)} of case time` : "cases"}
        />
        <StatTile
          label="Last 7 days"
          value={lastSeven.reduce((sum, d) => sum + d.count, 0)}
          hint={`${lastSeven.length} ${lastSeven.length === 1 ? "day" : "days"} logged`}
        />
        <StatTile
          label={monthLabel(ym, "short")}
          value={monthToDate.reduce((sum, d) => sum + d.count, 0)}
          hint={`${monthToDate.length} ${monthToDate.length === 1 ? "day" : "days"} logged`}
        />
      </div>

      <DayPanel date={today} today={today} entries={entries} />

      <section aria-label="Daily case counts" className="space-y-2">
        <h2 className="font-serif text-xl font-semibold">Daily case counts</h2>
        <p className="text-sm text-muted-foreground">
          Every day logged so far, newest first. Pick a date to open that day.
        </p>
        <DailyCountsTable
          rows={[...allDays].reverse()}
          highlight={today}
          emptyTitle="No days logged yet"
          emptyMessage="Add today's first case above and this sheet starts filling in."
        />
      </section>
    </div>
  );
}
