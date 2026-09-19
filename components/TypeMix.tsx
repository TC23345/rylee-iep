import { formatDuration } from "@/lib/dates";
import type { CaseEntry, TypeMixRow } from "@/lib/entries";
import { typeLabel, typeStyle, type CaseType } from "@/lib/entry-schema";
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

export type TypeFilter = "all" | CaseType;

/** One bar, one segment per type, sized by minutes. */
export function TypeBar({
  mix,
  size = "md",
  className,
}: {
  mix: TypeMixRow[];
  size?: "sm" | "md";
  className?: string;
}) {
  const total = mix.reduce((sum, m) => sum + m.minutes, 0);
  if (total === 0) return null;
  return (
    <div
      role="img"
      aria-label={mix.map((m) => `${typeLabel(m.caseType)} ${formatDuration(m.minutes)}`).join(", ")}
      className={cn(
        "flex w-full overflow-hidden rounded-full bg-muted",
        size === "sm" ? "h-2" : "h-3",
        className
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
  );
}

interface TypeMixProps {
  mix: TypeMixRow[];
  size?: "sm" | "md";
  className?: string;
  /**
   * When both are given, the legend becomes a row of filter chips (dot · label ·
   * count) with an "All" chip first. Without them it is a plain legend.
   */
  filter?: TypeFilter;
  onFilterChange?: (next: TypeFilter) => void;
  /** Show the stacked bar above the legend (default true). */
  showBar?: boolean;
}

/**
 * How the time was spent: the stacked bar plus a legend that doubles as the
 * per-type tally, or as filter chips when a handler is supplied.
 */
export function TypeMix({
  mix,
  size = "md",
  className,
  filter,
  onFilterChange,
  showBar = true,
}: TypeMixProps) {
  const total = mix.reduce((sum, m) => sum + m.minutes, 0);
  const rows = mix.reduce((sum, m) => sum + m.rows, 0);
  if (mix.length === 0 || total === 0) return null;

  const chips = Boolean(onFilterChange);

  return (
    <div className={cn("space-y-2", className)}>
      {showBar && <TypeBar mix={mix} size={size} />}

      {chips ? (
        <div
          className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 py-0.5"
          style={{ scrollbarWidth: "none" }}
          role="group"
          aria-label="Filter rows by type"
        >
          <Chip
            active={filter === "all" || filter === undefined}
            label="All"
            count={rows}
            onClick={() => onFilterChange?.("all")}
          />
          {mix.map((m) => (
            <Chip
              key={m.caseType}
              active={filter === m.caseType}
              dot={typeStyle(m.caseType).bar}
              label={typeLabel(m.caseType)}
              count={m.rows}
              hint={formatDuration(m.minutes)}
              onClick={() => onFilterChange?.(filter === m.caseType ? "all" : m.caseType)}
            />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}

function Chip({
  active,
  dot,
  label,
  count,
  hint,
  onClick,
}: {
  active: boolean;
  dot?: string;
  label: string;
  count: number;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={hint}
      className={cn(
        "flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-[background-color,box-shadow,color] duration-200",
        active
          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />}
      {label}
      <span
        className={cn(
          "rounded px-1 text-[10.5px] tabular-nums",
          active ? "bg-muted text-muted-foreground" : "text-muted-foreground/70"
        )}
      >
        {count}
      </span>
    </button>
  );
}
