"use client";

import { useState } from "react";

import { formatDuration } from "@/lib/dates";
import type { CaseEntry } from "@/lib/entries";
import { typeLabel } from "@/lib/entry-schema";
import { EntryTable } from "@/components/EntryTable";
import { TypeMix, mixFromEntries, type TypeFilter } from "@/components/TypeMix";

/**
 * A day's rows with the type chips that filter them. Rows stay mounted while
 * filtered so an open edit or delete dialog survives a chip click.
 */
export function DayLog({ entries }: { entries: CaseEntry[] }) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const mix = mixFromEntries(entries);
  const active = filter === "all" ? null : mix.find((m) => m.caseType === filter) ?? null;
  const filterUsable = filter === "all" || Boolean(active);

  return (
    <div className="space-y-4">
      <TypeMix
        mix={mix}
        showBar={false}
        filter={filterUsable ? filter : "all"}
        onFilterChange={setFilter}
      />

      {active && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {active.rows} {typeLabel(active.caseType)}{" "}
          {active.rows === 1 ? "row" : "rows"} · {formatDuration(active.minutes)}
        </p>
      )}

      <EntryTable entries={entries} filter={filterUsable ? filter : "all"} />
    </div>
  );
}
