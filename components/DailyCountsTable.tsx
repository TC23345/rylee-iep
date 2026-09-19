"use client";

import Link from "next/link";
import { formatDuration, monthOf, numericDate, shortDayLabel } from "@/lib/dates";
import type { DailyCount, DailyTypeMixRow } from "@/lib/entries";
import { cn } from "@/lib/utils";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyCountsTableProps {
  rows: DailyCount[];
  /** Per-day, per-type minutes; when given, each row's bar is stacked by type. */
  mix?: DailyTypeMixRow[];
  /** Date to highlight (the selected or current day). */
  highlight?: string | null;
  emptyTitle: string;
  emptyMessage: string;
}

/**
 * The "Daily Case Counts" sheet: one row per logged day, a bar scaled to the
 * busiest day (stacked by type when the mix is supplied), and a footer of totals.
 */
export function DailyCountsTable({ rows, mix, highlight, emptyTitle, emptyMessage }: DailyCountsTableProps) {
  const { label: typeLabel, style: typeStyle, isBreak } = useCaseTypes();
  if (rows.length === 0) {
    return (
      <Empty className="border border-dashed border-border py-10">
        <EmptyHeader>
          <EmptyTitle className="font-serif">{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const mixByDate = new Map<string, DailyTypeMixRow[]>();
  for (const m of mix ?? []) {
    if (isBreak(m.caseType)) continue;
    mixByDate.set(m.date, [...(mixByDate.get(m.date) ?? []), m]);
  }
  const barMax = mix
    ? Math.max(1, ...rows.map((r) => (mixByDate.get(r.date) ?? []).reduce((s, m) => s + m.minutes, 0)))
    : Math.max(1, ...rows.map((r) => r.count));

  const totalCases = rows.reduce((s, r) => s + r.count, 0);
  const totalMinutes = rows.reduce((s, r) => s + r.minutes, 0);
  const avg = (totalCases / rows.length).toFixed(1);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-36">Date</TableHead>
            <TableHead className="w-16 text-right">Cases</TableHead>
            <TableHead className="hidden sm:table-cell">
              <span className="sr-only">Time by type, relative to the busiest day</span>
            </TableHead>
            <TableHead className="w-20 text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const segments = mixByDate.get(r.date) ?? [];
            const dayMinutes = segments.reduce((s, m) => s + m.minutes, 0);
            return (
              <TableRow key={r.date} className={cn(r.date === highlight && "bg-accent/25")}>
                <TableCell>
                  <Link
                    href={`/month/${monthOf(r.date)}?d=${r.date}`}
                    className="inline-flex items-baseline gap-2 hover:underline"
                  >
                    <span className="tabular-nums">{numericDate(r.date)}</span>
                    <span className="text-xs text-muted-foreground">
                      {shortDayLabel(r.date).slice(0, 3)}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-serif text-lg font-semibold tabular-nums">
                  {r.count}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {mix ? (
                    <div
                      className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={segments
                        .map((m) => `${typeLabel(m.caseType)} ${formatDuration(m.minutes)}`)
                        .join(", ")}
                    >
                      {segments.map((m) => (
                        <span
                          key={m.caseType}
                          title={`${typeLabel(m.caseType)} · ${formatDuration(m.minutes)}`}
                          className={cn("h-full", typeStyle(m.caseType).bar)}
                          style={{ width: `${(m.minutes / barMax) * 100}%` }}
                        />
                      ))}
                      {dayMinutes === 0 && <span className="sr-only">No timed rows</span>}
                    </div>
                  ) : (
                    <div className="h-2 w-full rounded-full bg-muted" aria-hidden>
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${(r.count / barMax) * 100}%` }}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.minutes ? formatDuration(r.minutes) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell className="text-muted-foreground">
              {rows.length} {rows.length === 1 ? "day" : "days"}
            </TableCell>
            <TableCell className="text-right tabular-nums">{totalCases}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {avg} per day
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {totalMinutes ? formatDuration(totalMinutes) : "—"}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
