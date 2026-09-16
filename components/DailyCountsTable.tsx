import Link from "next/link";
import { formatDuration, monthOf, numericDate, shortDayLabel } from "@/lib/dates";
import type { DailyCount } from "@/lib/entries";

interface DailyCountsTableProps {
  rows: DailyCount[];
  /** Date to highlight (the selected or current day). */
  highlight?: string | null;
  emptyMessage: string;
}

/** The "Daily Case Counts" sheet: one row per logged day. */
export function DailyCountsTable({ rows, highlight, emptyMessage }: DailyCountsTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 text-right font-medium">Case count</th>
            <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.date}
              className={`border-b border-border last:border-0 ${r.date === highlight ? "bg-gold/10" : ""}`}
            >
              <td className="px-4 py-2">
                <Link href={`/month/${monthOf(r.date)}?d=${r.date}`} className="hover:underline">
                  <span className="font-mono tabular-nums">{numericDate(r.date)}</span>
                  <span className="ml-2 text-muted-foreground">{shortDayLabel(r.date).slice(0, 3)}</span>
                </Link>
              </td>
              <td className="px-4 py-2 text-right font-serif text-lg font-semibold tabular-nums">
                {r.count}
              </td>
              <td className="hidden px-4 py-2 text-right font-mono tabular-nums text-muted-foreground sm:table-cell">
                {r.minutes ? formatDuration(r.minutes) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
