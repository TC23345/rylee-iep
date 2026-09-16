"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { daysInMonth, formatDuration, monthLabel, numericDate } from "@/lib/dates";
import type { DailyCount, MonthSummary } from "@/lib/entries";
import { typeLabel, typeStyle } from "@/lib/entry-schema";
import { cn } from "@/lib/utils";
import { TypeBar } from "@/components/TypeMix";
import { Badge } from "@/components/ui/badge";
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
  /** Every logged day; the cards pick out their own month for the heat grid. */
  days: DailyCount[];
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function Metric({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] tabular-nums text-foreground">
      {children}
    </span>
  );
}

/** One month per card, paged newest first: headline, type bar, snapshot, day grid. */
export function MonthInsightCards({ months, days }: MonthInsightCardsProps) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState<DailyCount | null>(null);

  if (months.length === 0) return null;
  const month = months[Math.min(index, months.length - 1)];
  const monthDays = days.filter((d) => d.date.startsWith(month.ym));
  const byDate = new Map(monthDays.map((d) => [d.date, d]));
  const maxCount = Math.max(1, ...monthDays.map((d) => d.count));
  const top = month.mix.find((m) => m.caseType !== "lunch") ?? null;
  const allMinutes = month.mix.reduce((s, m) => s + m.minutes, 0);

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
    : `${month.days} ${month.days === 1 ? "day" : "days"} logged. Darker is busier.`;

  return (
    <section aria-label="Months" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
          Months
          <Badge variant="secondary" className="tabular-nums">{months.length}</Badge>
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
      </div>

      <article className="grid gap-6 rounded-lg border border-border bg-card p-5 shadow-sm lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <p className="font-serif text-lg leading-relaxed">
            <Link href={`/month/${month.ym}`} className="font-semibold hover:underline">
              {monthLabel(month.ym)}
            </Link>
            : <Metric>{month.cases} cases</Metric> across{" "}
            <Metric>
              {month.days} {month.days === 1 ? "day" : "days"}
            </Metric>
            , <Metric>{formatDuration(month.caseMinutes)}</Metric> of case time.
            {top && allMinutes > 0 && (
              <>
                {" "}
                {typeLabel(top.caseType)} took the most time (
                <Metric>{formatDuration(top.minutes)}</Metric>, {Math.round((top.minutes / allMinutes) * 100)}%).
              </>
            )}
          </p>

          <TypeBar mix={month.mix} />

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Snapshot</TableHead>
                  <TableHead className="w-16 text-right">Rows</TableHead>
                  <TableHead className="w-20 text-right">Time</TableHead>
                  <TableHead className="w-16 text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                      {allMinutes ? Math.round((row.minutes / allMinutes) * 100) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] text-muted-foreground">
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHover(null)}>
            {cells.map((date, i) => {
              if (!date) return <span key={`pad-${i}`} />;
              const day = byDate.get(date);
              const dayNumber = Number(date.slice(8));
              if (!day) {
                return (
                  <span
                    key={date}
                    className="flex aspect-square items-center justify-center rounded-md bg-muted/60 text-[0.65rem] text-muted-foreground/60"
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
                  className="flex aspect-square items-center justify-center rounded-md bg-gold text-[0.7rem] font-medium text-foreground transition-transform hover:scale-105"
                  style={{ opacity: 0.3 + 0.7 * (day.count / maxCount) }}
                >
                  {dayNumber}
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {caption}
          </p>
        </div>
      </article>
    </section>
  );
}
