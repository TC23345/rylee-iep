import { requireSignedInUser } from "@/lib/authz";
import { addDays, formatDuration, monthLabel, monthOf, monthRange, todayIso } from "@/lib/dates";
import {
  getDailyCounts,
  getMonthlySummaries,
  type DailyCount,
  type MonthSummary,
} from "@/lib/entries";
import { DbNotice } from "@/components/DbNotice";
import { MonthInsightCards } from "@/components/MonthInsightCards";
import { StatTile } from "@/components/StatTile";

export const dynamic = "force-dynamic";

// Calendar: the overview. Headline numbers and one card per month with its
// calendar, totals and type mix. The daily sheet lives at /counts; day-by-day
// logging lives under the month tabs.
export default async function CalendarPage() {
  const actor = await requireSignedInUser();
  const today = todayIso();
  const ym = monthOf(today);
  const weekStart = addDays(today, -6);

  let allDays: DailyCount[] = [];
  let months: MonthSummary[] = [];
  let dbError = false;

  try {
    [allDays, months] = await Promise.all([
      getDailyCounts(actor.orgId),
      getMonthlySummaries(actor.orgId),
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

    </div>
  );
}
