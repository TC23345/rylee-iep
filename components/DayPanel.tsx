import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { addDays, dayLabel, monthDayOrdinal, monthOf } from "@/lib/dates";
import type { CaseEntry } from "@/lib/entries";
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
  const isToday = date === today;
  const canGoForward = date < today;

  // The new row starts where the latest row ended.
  const byEnd = [...entries]
    .filter((e) => e.endTime)
    .sort((a, b) => ((a.endTime ?? "") < (b.endTime ?? "") ? 1 : -1));
  const last = byEnd[0] ?? null;

  return (
    <section aria-label={`Cases for ${dayLabel(date)}`} className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            aria-label="Previous day"
            asChild
          >
            <Link href={dayHref(addDays(date, -1))}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="min-w-0 flex-1 font-serif text-2xl font-semibold leading-tight">
            {isToday ? `Today, ${monthDayOrdinal(date)}` : dayLabel(date)}
          </h2>
          {canGoForward ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
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
              className="shrink-0"
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
            />
          </div>
          {actions}
        </div>
      </header>

      <DayLog entries={entries} />
    </section>
  );
}
