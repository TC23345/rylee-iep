import Link from "next/link";
import { formatDuration, monthOf, numericDate, shortDayLabel } from "@/lib/dates";
import type { DailyCount } from "@/lib/entries";
import { cn } from "@/lib/utils";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DailyCountsTableProps {
  rows: DailyCount[];
  /** Date to highlight (the selected or current day). */
  highlight?: string | null;
  emptyTitle: string;
  emptyMessage: string;
}

/** The "Daily Case Counts" sheet: one row per logged day, with a bar scaled to the busiest day. */
export function DailyCountsTable({ rows, highlight, emptyTitle, emptyMessage }: DailyCountsTableProps) {
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

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-36">Date</TableHead>
            <TableHead className="w-16 text-right">Cases</TableHead>
            <TableHead className="hidden sm:table-cell">
              <span className="sr-only">Cases relative to the busiest day</span>
            </TableHead>
            <TableHead className="w-20 text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.date} className={cn(r.date === highlight && "bg-gold/10")}>
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
                <div className="h-2 w-full rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-2 rounded-full bg-gold"
                    style={{ width: `${(r.count / max) * 100}%` }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {r.minutes ? formatDuration(r.minutes) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
