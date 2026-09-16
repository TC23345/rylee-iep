import { requireSignedInUser } from "@/lib/authz";
import { addDays, formatDuration, monthLabel, monthOf, monthRange, todayIso } from "@/lib/dates";
import {
  getDailyCounts,
  getDailyTypeMix,
  getMonthlySummaries,
  type DailyCount,
  type DailyTypeMixRow,
  type MonthSummary,
} from "@/lib/entries";
import { DailyCountsTable } from "@/components/DailyCountsTable";
import { DbNotice } from "@/components/DbNotice";
import { MonthInsightCards } from "@/components/MonthInsightCards";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

// Home: the overview. Headline numbers, one card per month with its calendar,
// totals and type mix, then the "Daily Case Counts" sheet. Day-by-day logging
// lives under the month tabs.
export default async function OverviewPage() {
  const actor = await requireSignedInUser();
  const today = todayIso();
  const ym = monthOf(today);
  const weekStart = addDays(today, -6);

  let allDays: DailyCount[] = [];
  let months: MonthSummary[] = [];
  let dailyMix: DailyTypeMixRow[] = [];
  let dbError = false;

  try {
    [allDays, months, dailyMix] = await Promise.all([
      getDailyCounts(actor.orgId),
      getMonthlySummaries(actor.orgId),
      getDailyTypeMix(actor.orgId),
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

      <MonthInsightCards months={months} days={allDays} />

      <section aria-label="Daily case counts" className="space-y-2">
        <h2 className="font-serif text-xl font-semibold">Daily case counts</h2>
        <p className="text-sm text-muted-foreground">
          Every day logged so far, newest first. Bars show time by type; pick a date to open that day.
        </p>
        <DailyCountsTable
          rows={[...allDays].reverse()}
          mix={dailyMix}
          highlight={today}
          emptyTitle="No days logged yet"
          emptyMessage="Open a month tab and add today's first case. This sheet fills in as the log grows."
        />
      </section>
    </div>
  );
}
