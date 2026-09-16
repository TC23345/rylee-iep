"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { daysInMonth, formatDuration, monthLabel, numericDate } from "@/lib/dates";
import type { DailyCount, MonthSummary } from "@/lib/entries";
import { typeLabel, typeStyle } from "@/lib/entry-schema";
import { cn } from "@/lib/utils";
import { StatTile } from "@/components/StatTile";
import { TypeBar } from "@/components/TypeMix";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MonthInsightCardsProps {
  months: MonthSummary[];
  /** Every logged day; the card picks out its own month for the calendar. */
  days: DailyCount[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * One month per card, paged newest first: the calendar on top, totals under
 * it, and the type bar whose hover shows the breakdown.
 */
export function MonthInsightCards({ months, days }: MonthInsightCardsProps) {
  const [index, setIndex] = useState(0);
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  if (months.length === 0) return null;
  const month = months[Math.min(index, months.length - 1)];
  const monthDays = days.filter((d) => d.date.startsWith(month.ym));
  const byDate = new Map(monthDays.map((d) => [d.date, d]));
  const maxCount = Math.max(1, ...monthDays.map((d) => d.count));
  const allMinutes = month.mix.reduce((s, m) => s + m.minutes, 0);
  const perCase = month.cases ? Math.round(month.caseMinutes / month.cases) : 0;

  const [y, m] = month.ym.split("-").map(Number);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth(y, m) }, (_, i) => `${month.ym}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <section aria-label="Months">
      <article className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
        <header className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">
            <Link href={`/month/${month.ym}`} className="hover:underline">
              {monthLabel(month.ym)}
            </Link>
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Newer month"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {index + 1} / {months.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Older month"
              disabled={index >= months.length - 1}
              onClick={() => setIndex((i) => Math.min(months.length - 1, i + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </header>

        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((date, i) => {
              if (!date) return <span key={`pad-${i}`} />;
              const day = byDate.get(date);
              const dayNumber = Number(date.slice(8));
              if (!day) {
                return (
                  <span
                    key={date}
                    className="flex h-9 items-center justify-center rounded-md bg-muted/50 text-xs text-muted-foreground/60 sm:h-11"
                  >
                    {dayNumber}
                  </span>
                );
              }
              return (
                <Link
                  key={date}
                  href={`/month/${month.ym}?d=${date}`}
                  title={`${numericDate(date)} · ${day.count} ${day.count === 1 ? "case" : "cases"}${
                    day.minutes ? ` · ${formatDuration(day.minutes)}` : ""
                  }`}
                  className="relative flex h-9 items-center justify-center rounded-md text-xs font-medium text-foreground transition-transform hover:scale-105 sm:h-11"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-md bg-gold"
                    style={{ opacity: 0.25 + 0.75 * (day.count / maxCount) }}
                  />
                  <span className="relative">{dayNumber}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Cases" value={month.cases} />
            <StatTile label="Days logged" value={month.days} />
            <StatTile label="Case time" value={formatDuration(month.caseMinutes)} hint="hours:minutes" />
            <StatTile label="Minutes per case" value={perCase} hint="average" />
          </div>
          {allMinutes > 0 && (
            <div className="space-y-3">
              <TypeBar mix={month.mix} />
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>
                      <button
                        type="button"
                        aria-expanded={breakdownOpen}
                        aria-controls={`breakdown-${month.ym}`}
                        onClick={() => setBreakdownOpen((o) => !o)}
                        className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-muted"
                      >
                        <ChevronRight
                          className={cn(
                            "size-3.5 text-muted-foreground transition-transform",
                            breakdownOpen && "rotate-90"
                          )}
                        />
                        Type
                      </button>
                    </TableHead>
                    <TableHead className="w-16 text-right">Rows</TableHead>
                    <TableHead className="w-20 text-right">Time</TableHead>
                    <TableHead className="w-16 text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody id={`breakdown-${month.ym}`} className={cn(!breakdownOpen && "hidden")}>
                  {month.mix.map((row) => (
                    <TableRow key={row.caseType}>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className={cn("inline-block size-2.5 rounded-full", typeStyle(row.caseType).bar)}
                          />
                          {typeLabel(row.caseType)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.rows}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatDuration(row.minutes)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {Math.round((row.minutes / allMinutes) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
