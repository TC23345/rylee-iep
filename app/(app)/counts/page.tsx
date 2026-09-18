import { requireSignedInUser } from "@/lib/authz";
import { todayIso } from "@/lib/dates";
import { getDailyCounts, getDailyTypeMix, type DailyCount, type DailyTypeMixRow } from "@/lib/entries";
import { DailyCountsTable } from "@/components/DailyCountsTable";
import { DbNotice } from "@/components/DbNotice";

export const dynamic = "force-dynamic";

// Case Counts: the workbook's "Daily Case Counts" sheet. Every logged day,
// newest first, with a stacked bar of time by type and a footer of totals.
export default async function CaseCountsPage() {
  const actor = await requireSignedInUser();
  const today = todayIso();

  let allDays: DailyCount[] = [];
  let dailyMix: DailyTypeMixRow[] = [];
  let dbError = false;

  try {
    [allDays, dailyMix] = await Promise.all([
      getDailyCounts(actor.orgId),
      getDailyTypeMix(actor.orgId),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-6">
      {dbError && <DbNotice />}

      <header>
        <h1 className="font-serif text-3xl font-bold">Case Counts</h1>
        <p className="text-sm text-muted-foreground">
          Every day logged so far, newest first. Bars show time by type; pick a date to open that day.
        </p>
      </header>

      <DailyCountsTable
        rows={[...allDays].reverse()}
        mix={dailyMix}
        highlight={today}
        emptyTitle="No days logged yet"
        emptyMessage="Open a month tab and add today's first case. This sheet fills in as the log grows."
      />
    </div>
  );
}
