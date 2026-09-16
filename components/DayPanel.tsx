import { dayLabel, formatDuration, formatTime12 } from "@/lib/dates";
import type { CaseEntry } from "@/lib/entries";
import { countsAsCase } from "@/lib/entry-schema";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { EntryTable } from "@/components/EntryTable";
import { TypeMix, mixFromEntries } from "@/components/TypeMix";

interface DayPanelProps {
  date: string;
  today: string;
  entries: CaseEntry[];
  /** Extra buttons shown beside "Add a row" (the month tabs add import / export). */
  actions?: React.ReactNode;
}

export function DayPanel({ date, today, entries, actions }: DayPanelProps) {
  const cases = entries.filter((e) => countsAsCase(e.caseType, e.caseNumber));
  const caseMinutes = cases.reduce((sum, e) => sum + (e.durationMin ?? 0), 0);
  const isToday = date === today;

  const starts = entries.map((e) => e.startTime).filter((t): t is string => !!t);
  const ends = entries.map((e) => e.endTime).filter((t): t is string => !!t);
  const firstStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : null;
  const lastEnd = ends.length ? ends.reduce((a, b) => (a > b ? a : b)) : null;

  // The new row starts where the latest row ended.
  const last = entries.reduce<CaseEntry | null>((best, e) => {
    if (!e.endTime) return best;
    if (!best || !best.endTime || e.endTime >= best.endTime) return e;
    return best;
  }, null);

  const summary =
    cases.length === 0
      ? isToday
        ? "Nothing logged yet."
        : "No cases logged."
      : `${cases.length} ${cases.length === 1 ? "case" : "cases"} in ${formatDuration(caseMinutes)}` +
        (firstStart && lastEnd
          ? `, ${formatTime12(firstStart)} to ${formatTime12(lastEnd)}`
          : "");

  return (
    <section aria-label={`Cases for ${dayLabel(date)}`} className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-semibold leading-tight">
            {isToday ? "Today" : dayLabel(date)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isToday ? `${dayLabel(date)}. ` : ""}
            {summary}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <AddEntryDialog
            date={date}
            isToday={isToday}
            lastEnd={last?.endTime ?? null}
            lastType={last?.caseType ?? null}
          />
          {actions}
        </div>
      </header>

      <TypeMix mix={mixFromEntries(entries)} />

      <EntryTable entries={entries} />
    </section>
  );
}
