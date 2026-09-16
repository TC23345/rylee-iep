import { dayLabel, formatDuration } from "@/lib/dates";
import type { CaseEntry } from "@/lib/entries";
import { countsAsCase } from "@/lib/entry-schema";
import { AddEntryCard } from "@/components/AddEntryCard";
import { EntryTable } from "@/components/EntryTable";

interface DayPanelProps {
  date: string;
  today: string;
  entries: CaseEntry[];
  /** Keep the add form expanded (Today page). */
  formOpen?: boolean;
}

export function DayPanel({ date, today, entries, formOpen = false }: DayPanelProps) {
  const cases = entries.filter((e) => countsAsCase(e.caseType));
  const minutes = cases.reduce((sum, e) => sum + (e.durationMin ?? 0), 0);
  const isToday = date === today;

  // The new row starts where the latest row ended.
  const last = entries.reduce<CaseEntry | null>((best, e) => {
    if (!e.endTime) return best;
    if (!best || !best.endTime || e.endTime >= best.endTime) return e;
    return best;
  }, null);

  const addCard = (
    <AddEntryCard
      date={date}
      isToday={isToday}
      lastEnd={last?.endTime ?? null}
      lastType={last?.caseType ?? null}
      defaultOpen={formOpen}
    />
  );

  return (
    <section aria-label={`Cases for ${dayLabel(date)}`} className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl font-semibold">
            {isToday ? "Today" : dayLabel(date)}
            {isToday && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {dayLabel(date)}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {cases.length} {cases.length === 1 ? "case" : "cases"}
            {minutes > 0 ? ` · ${formatDuration(minutes)} logged` : ""}
          </p>
        </div>
        {!formOpen && addCard}
      </header>
      {formOpen && addCard}
      <EntryTable entries={entries} />
    </section>
  );
}
