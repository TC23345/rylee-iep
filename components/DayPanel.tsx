import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { addDays, dayLabel, formatDuration, formatTime12, monthOf } from "@/lib/dates";
import type { CaseEntry } from "@/lib/entries";
import { countsAsCase, type CaseType } from "@/lib/entry-schema";
import { AddEntryDialog } from "@/components/AddEntryDialog";
import { DayLog } from "@/components/DayLog";
import { Button } from "@/components/ui/button";

interface DayPanelProps {
  date: string;
  today: string;
  entries: CaseEntry[];
  /** Extra buttons shown beside "Add a row" (the month tabs add import / export). */
  actions?: React.ReactNode;
}

function dayHref(date: string): string {
  return `/month/${monthOf(date)}?d=${date}`;
}

export function DayPanel({ date, today, entries, actions }: DayPanelProps) {
  const cases = entries.filter((e) => countsAsCase(e.caseType, e.caseNumber));
  const caseMinutes = cases.reduce((sum, e) => sum + (e.durationMin ?? 0), 0);
  const isToday = date === today;
  const canGoForward = date < today;

  const starts = entries.map((e) => e.startTime).filter((t): t is string => !!t);
  const ends = entries.map((e) => e.endTime).filter((t): t is string => !!t);
  const firstStart = starts.length ? starts.reduce((a, b) => (a < b ? a : b)) : null;
  const lastEnd = ends.length ? ends.reduce((a, b) => (a > b ? a : b)) : null;

  // The new row starts where the latest row ended.
  const byEnd = [...entries]
    .filter((e) => e.endTime)
    .sort((a, b) => ((a.endTime ?? "") < (b.endTime ?? "") ? 1 : -1));
  const last = byEnd[0] ?? null;

  // Types used most recently today, for one-tap picking in the add dialog.
  const recentTypes: CaseType[] = [];
  for (const e of byEnd) {
    if (e.caseType === "lunch" || recentTypes.includes(e.caseType)) continue;
    recentTypes.push(e.caseType);
    if (recentTypes.length === 4) break;
  }

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
        <div className="flex min-w-0 items-start gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="mt-1 shrink-0 text-muted-foreground"
            aria-label="Previous day"
            asChild
          >
            <Link href={dayHref(addDays(date, -1))}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-2xl font-semibold leading-tight">
              {isToday ? "Today" : dayLabel(date)}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isToday ? `${dayLabel(date)}. ` : ""}
              {summary}
            </p>
          </div>
          {canGoForward ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="mt-1 shrink-0 text-muted-foreground"
              aria-label="Next day"
              asChild
            >
              <Link href={dayHref(addDays(date, 1))}>
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              className="mt-1 shrink-0"
              aria-label="Next day"
              disabled
            >
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex-1 sm:flex-none [&>button]:w-full sm:[&>button]:w-auto">
            <AddEntryDialog
              date={date}
              isToday={isToday}
              lastEnd={last?.endTime ?? null}
              lastType={last?.caseType ?? null}
              recentTypes={recentTypes}
            />
          </div>
          {actions}
        </div>
      </header>

      <DayLog entries={entries} />
    </section>
  );
}
