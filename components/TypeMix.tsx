import { formatDuration } from "@/lib/dates";
import type { CaseEntry, TypeMixRow } from "@/lib/entries";
import { typeLabel, typeStyle } from "@/lib/entry-schema";
import { cn } from "@/lib/utils";

/** Fold a day's rows into per-type totals, most minutes first. */
export function mixFromEntries(entries: CaseEntry[]): TypeMixRow[] {
  const byType = new Map<string, TypeMixRow>();
  for (const e of entries) {
    const cur = byType.get(e.caseType) ?? { caseType: e.caseType, rows: 0, minutes: 0 };
    cur.rows += 1;
    cur.minutes += e.durationMin ?? 0;
    byType.set(e.caseType, cur);
  }
  return [...byType.values()].sort((a, b) => b.minutes - a.minutes || b.rows - a.rows);
}

interface TypeMixProps {
  mix: TypeMixRow[];
  /** Bar height; the legend is the same either way. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * How the time was spent: one bar, one segment per case type, sized by minutes,
 * with a legend that doubles as the per-type tally.
 */
export function TypeMix({ mix, size = "md", className }: TypeMixProps) {
  const total = mix.reduce((sum, m) => sum + m.minutes, 0);
  if (mix.length === 0 || total === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="img"
        aria-label={mix
          .map((m) => `${typeLabel(m.caseType)} ${formatDuration(m.minutes)}`)
          .join(", ")}
        className={cn(
          "flex w-full overflow-hidden rounded-full bg-muted",
          size === "sm" ? "h-2" : "h-3"
        )}
      >
        {mix.map((m) => (
          <span
            key={m.caseType}
            className={cn("h-full", typeStyle(m.caseType).bar)}
            style={{ width: `${(m.minutes / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {mix.map((m) => (
          <li key={m.caseType} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn("inline-block size-2.5 rounded-full", typeStyle(m.caseType).bar)}
            />
            <span>{typeLabel(m.caseType)}</span>
            <span className="tabular-nums text-muted-foreground">
              {m.rows} · {formatDuration(m.minutes)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
