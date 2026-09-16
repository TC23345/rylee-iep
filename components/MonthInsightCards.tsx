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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [hover, setHover] = useState<DailyCount | null>(null);

  if (months.length === 0) return null;
  const month = months[Math.min(index, months.length - 1)];
  const monthDays = days.filter((d) => d.date.startsWith(month.ym));
  const byDate = new Map(monthDays.map((d) => [d.date, d]));
  const maxCount = Math.max(1, ...monthDays.map((d) => d.count));
  const allMinutes = month.mix.reduce((s, m) => s + m.minutes, 0);
  const top = month.mix.find((m) => m.caseType !== "lunch") ?? null;
  const perCase = month.cases ? Math.round(month.caseMinutes / month.cases) : 0;

  const [y, m] = month.ym.split("-").map(Number);
  const lead = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth(y, m) }, (_, i) => `${month.ym}-${String(i + 1).padStart(2, "0")}`),
  ];

  const caption = hover
    ? `${numericDate(hover.date)} · ${hover.count} ${hover.count === 1 ? "case" : "cases"} · ${
        hover.minutes ? formatDuration(hover.minutes) : "no time logged"
      }`
    : "Darker days were busier. Pick one to open it.";

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
          <div className="grid grid-cols-7 gap-1.5" onMouseLeave={() => setHover(null)}>
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
                  title={`${numericDate(date)} · ${day.count} cases`}
                  onMouseEnter={() => setHover(day)}
                  onFocus={() => setHover(day)}
                  className="relative flex h-9 items-center justify-center rounded-md text-xs font-medium text-foreground transition-transform hover:scale-105 sm:h-11"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-md bg-gold"
                    style={{ opacity: 0.25 + 0.75 * (day.count / maxCount) }}
                  />
                  <span className="relative">{dayNumber}</span>
                  <span className="relative ml-1 hidden text-[0.6rem] text-foreground/70 sm:inline">
                    {day.count}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {caption}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Cases" value={month.cases} />
          <StatTile label="Days logged" value={month.days} />
          <StatTile label="Case time" value={formatDuration(month.caseMinutes)} hint="hours:minutes" />
          <StatTile label="Minutes per case" value={perCase} hint="average" />
        </div>

        {allMinutes > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help" tabIndex={0} aria-label="Time by type; hover for the breakdown">
                <TypeBar mix={month.mix} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs p-3">
              <p className="mb-2">
                {month.cases} cases across {month.days} {month.days === 1 ? "day" : "days"},{" "}
                {formatDuration(month.caseMinutes)} of case time.
                {top && (
                  <>
                    {" "}
                    {typeLabel(top.caseType)} took the most time ({formatDuration(top.minutes)},{" "}
                    {Math.round((top.minutes / allMinutes) * 100)}%).
                  </>
                )}
              </p>
              <ul className="space-y-0.5">
                {month.mix.map((row) => (
                  <li key={row.caseType} className="flex items-center gap-1.5 tabular-nums">
                    <span aria-hidden className={cn("inline-block size-2 rounded-full", typeStyle(row.caseType).bar)} />
                    <span className="flex-1">{typeLabel(row.caseType)}</span>
                    <span>{row.rows}</span>
                    <span className="w-10 text-right">{formatDuration(row.minutes)}</span>
                    <span className="w-9 text-right opacity-70">
                      {Math.round((row.minutes / allMinutes) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </article>
    </section>
  );
}
