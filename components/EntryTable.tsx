"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";

import { createEntry, deleteEntry, updateEntry } from "@/app/actions/entries";
import type { CaseEntry } from "@/lib/entries";
import { CASE_NUMBER_LENGTH, type CaseType, type EntryFormValues } from "@/lib/entry-schema";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import { CaseTypesDialog } from "@/components/CaseTypesDialog";
import { HoldToDeleteButton } from "@/components/HoldToDeleteButton";
import {
  formatDuration,
  formatElapsed,
  formatTime12,
  localTodayIso,
  minutesBetween,
  nowTime,
  secondsSince,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { TypeFilter } from "@/components/TypeMix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";

// Case # · Type · Start · End · Length · Notes · delete
const COLUMNS =
  "grid-cols-[7.5rem_minmax(10rem,1.1fr)_6rem_6rem_4.5rem_minmax(10rem,2fr)_2.5rem]";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** Borderless field that reveals its edge on hover and focus. */
const FIELD =
  "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none transition-colors hover:border-border focus:border-brand focus:bg-card";

type Draft = Omit<EntryFormValues, "date">;

// One shared one-second clock for every running row. On the server (and the
// first client render) it reads null, so nothing time-dependent is prerendered.
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;
let clockNow = 0;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** The current time, ticking every second; null until mounted in the browser. */
function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribeClock, () => clockNow, () => 0);
  return ms ? new Date(ms) : null;
}

const noSubscribe = () => () => {};

/** Today on this machine's clock; null on the server and during hydration. */
function useLocalToday(): string | null {
  return useSyncExternalStore(noSubscribe, () => localTodayIso(), () => null);
}

/**
 * The End cell of a case still in progress: a live clock that stamps the end
 * time when clicked.
 */
function RunningClock({ start, onStop }: { start: string; onStop: () => void }) {
  const now = useNow();
  const elapsed = now ? formatElapsed(secondsSince(start, now)) : "0:00:00";
  return (
    <button
      type="button"
      onClick={onStop}
      title="Running. Click to stop"
      aria-label={`Running for ${elapsed}. Click to stop and set the end time to now`}
      className="inline-flex items-center gap-1.5 rounded-md border border-brand/40 bg-brand/10 px-1.5 py-1 text-sm tabular-nums text-foreground transition-colors hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span aria-hidden className="size-1.5 shrink-0 animate-pulse rounded-full bg-brand" />
      {elapsed}
    </button>
  );
}

function toDraft(e: CaseEntry): Draft {
  return {
    caseNumber: e.caseNumber,
    caseType: e.caseType,
    startTime: e.startTime ?? "",
    endTime: e.endTime ?? "",
    note: e.note,
  };
}

function sameDraft(a: Draft, b: Draft): boolean {
  return (
    a.caseNumber === b.caseNumber &&
    a.caseType === b.caseType &&
    a.startTime === b.startTime &&
    a.endTime === b.endTime &&
    a.note === b.note
  );
}

function toFormValues(e: CaseEntry): EntryFormValues {
  return {
    date: e.date,
    caseNumber: e.caseNumber,
    caseType: e.caseType,
    startTime: e.startTime ?? "",
    endTime: e.endTime ?? "",
    note: e.note,
  };
}

/**
 * Hold the trash icon to delete the row. The deletion is announced in a toast
 * whose Undo puts the row back.
 */
function DeleteRowButton({ entry }: { entry: CaseEntry }) {
  const [pending, startTransition] = useTransition();
  const { label: typeLabel } = useCaseTypes();
  const what = entry.caseNumber ? `case ${entry.caseNumber}` : typeLabel(entry.caseType).toLowerCase();

  function remove() {
    startTransition(async () => {
      const res = await deleteEntry(entry.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast("Row deleted", {
        description: `${entry.caseNumber ? `Case ${entry.caseNumber} · ` : ""}${typeLabel(entry.caseType)}${
          entry.startTime ? ` · ${formatTime12(entry.startTime)}` : ""
        }`,
        duration: 8000,
        action: {
          label: "Undo",
          onClick: () => {
            void createEntry(toFormValues(entry), { restore: true }).then((r) => {
              if (r.ok) toast.success("Row restored.");
              else toast.error(r.error);
            });
          },
        },
      });
    });
  }

  return (
    <HoldToDeleteButton
      label={`Hold to delete ${what}`}
      onHold={remove}
      disabled={pending}
      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
    />
  );
}

function Cell({
  className,
  children,
  header = false,
}: {
  className?: string;
  children?: React.ReactNode;
  header?: boolean;
}) {
  return (
    <div
      role={header ? "columnheader" : "cell"}
      className={cn("flex min-w-0 items-center px-1.5 py-1 text-sm", className)}
    >
      {children}
    </div>
  );
}

/**
 * One row. Every field is editable in place: change a value and it saves when
 * the field loses focus (or, for the type, as soon as it is picked). A failed
 * save puts the old value back and says why.
 */
function EntryRow({
  entry,
  shown,
  today,
}: {
  entry: CaseEntry;
  shown: boolean;
  /** Today on this machine, or null before hydration. */
  today: string | null;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(entry));
  const [saving, startTransition] = useTransition();
  const types = useCaseTypes();
  const isBreak = types.isBreak(draft.caseType);
  // The picker offers active types, plus this row's own type if it was archived.
  const current = types.get(draft.caseType);
  const archivedCurrent = current?.archived ? current : null;

  // Pick up changes that arrive from the server (another tab, an import) by
  // resetting the draft whenever the row's stored values change.
  const serverKey = [entry.caseNumber, entry.caseType, entry.startTime, entry.endTime, entry.note].join("|");
  const [seenKey, setSeenKey] = useState(serverKey);
  if (seenKey !== serverKey) {
    setSeenKey(serverKey);
    setDraft(toDraft(entry));
  }

  function commit(patch: Partial<Draft>) {
    const next = { ...draft, ...patch };
    if (sameDraft(next, toDraft(entry)) && sameDraft(next, draft)) return;
    setDraft(next);
    if (sameDraft(next, toDraft(entry))) return;
    startTransition(async () => {
      const res = await updateEntry(entry.id, { date: entry.date, ...next });
      if (!res.ok) {
        toast.error(res.error);
        setDraft(toDraft(entry));
      }
    });
  }

  const duration = minutesBetween(draft.startTime, draft.endTime);
  // A case logged today with a start and no end is still in progress.
  const running = entry.date === today && Boolean(draft.startTime) && !draft.endTime;

  return (
    <div
      role="row"
      aria-hidden={!shown}
      className="grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none"
      style={{
        gridTemplateRows: shown ? "1fr" : "0fr",
        opacity: shown ? 1 : 0,
        transitionTimingFunction: EASE,
      }}
    >
      <div className="overflow-hidden">
        <div
          data-entry-row
          className={cn(
            "group grid border-b border-border transition-colors duration-100 hover:bg-muted/30",
            COLUMNS,
            isBreak && "bg-muted/40 text-muted-foreground",
            saving && "opacity-70"
          )}
        >
          <Cell>
            <input
              value={draft.caseNumber}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={Math.max(CASE_NUMBER_LENGTH, entry.caseNumber.length)}
              placeholder={isBreak ? "—" : "Case #"}
              aria-label="Case number"
              className={cn(FIELD, "font-mono tabular-nums")}
              onChange={(e) => setDraft({ ...draft, caseNumber: e.target.value.replace(/\D/g, "") })}
              onBlur={(e) => commit({ caseNumber: e.target.value.replace(/\D/g, "") })}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Cell>
          <Cell>
            <Select
              value={draft.caseType}
              onValueChange={(v) => commit({ caseType: v as CaseType })}
            >
              <SelectTrigger
                aria-label="Case type"
                title="Click to change the type"
                className="h-7 w-full cursor-pointer justify-start border-transparent bg-transparent px-1 shadow-none hover:border-border focus:border-brand data-[state=open]:border-brand [&_svg]:hidden"
              >
                <Badge variant="secondary" className={cn("font-medium", types.style(draft.caseType).chip)}>
                  {types.label(draft.caseType)}
                </Badge>
              </SelectTrigger>
              {/* Popper, not item-aligned: item-aligned mis-measures inside the
                  collapsing rows and lands the menu off-screen. */}
              <SelectContent position="popper" align="start">
                {types.groups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        <span aria-hidden className={cn("inline-block size-2.5 rounded-full", types.style(t.key).bar)} />
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                {archivedCurrent && (
                  <SelectGroup>
                    <SelectLabel>Archived</SelectLabel>
                    <SelectItem value={archivedCurrent.key}>
                      <span aria-hidden className={cn("inline-block size-2.5 rounded-full", types.style(archivedCurrent.key).bar)} />
                      {archivedCurrent.label}
                    </SelectItem>
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </Cell>
          <Cell>
            <input
              type="time"
              value={draft.startTime}
              aria-label="Start time"
              className={cn(FIELD, "tabular-nums [&::-webkit-calendar-picker-indicator]:hidden")}
              onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
              onBlur={(e) => commit({ startTime: e.target.value })}
            />
          </Cell>
          <Cell>
            {running ? (
              <RunningClock start={draft.startTime} onStop={() => commit({ endTime: nowTime() })} />
            ) : (
              <input
                type="time"
                value={draft.endTime}
                aria-label="End time"
                className={cn(FIELD, "tabular-nums [&::-webkit-calendar-picker-indicator]:hidden")}
                onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                onBlur={(e) => commit({ endTime: e.target.value })}
              />
            )}
          </Cell>
          <Cell className="px-3 tabular-nums text-muted-foreground">
            {duration === null ? "—" : formatDuration(duration)}
          </Cell>
          <Cell>
            <input
              value={draft.note}
              aria-label="Notes"
              className={cn(FIELD, "text-foreground/80")}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              onBlur={(e) => commit({ note: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Cell>
          <Cell className="justify-end px-1">
            {shown && <DeleteRowButton entry={entry} />}
          </Cell>
        </div>
      </div>
    </div>
  );
}

type SortKey = "case" | "start" | "end" | "length";
type SortDir = "asc" | "desc";
interface Sort {
  key: SortKey;
  dir: SortDir;
}

/** Newest first, the order the server sends. */
const DEFAULT_SORT: Sort = { key: "start", dir: "desc" };

/** First click on a column: latest times, longest length, lowest case number. */
const FIRST_DIR: Record<SortKey, SortDir> = { case: "asc", start: "desc", end: "desc", length: "desc" };

function sortValue(e: CaseEntry, key: SortKey): string | number | null {
  switch (key) {
    case "case":
      return e.caseNumber ? Number(e.caseNumber) : null;
    case "start":
      return e.startTime || null;
    case "end":
      return e.endTime || null;
    case "length":
      return minutesBetween(e.startTime ?? "", e.endTime ?? "");
  }
}

/** Rows missing the sorted value always go last; ties keep the server order. */
function sortEntries(entries: CaseEntry[], { key, dir }: Sort): CaseEntry[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...entries].sort((a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
    return va < vb ? -sign : va > vb ? sign : 0;
  });
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <div
      role="columnheader"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className="flex h-12 min-w-0 items-center px-1.5"
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        title={`Sort by ${label.toLowerCase()}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          active && "text-foreground"
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-40")} aria-hidden />
      </button>
    </div>
  );
}

interface EntryTableProps {
  entries: CaseEntry[];
  /** "all" or one case type; other rows collapse away. */
  filter?: TypeFilter;
}

/** Rows per page before the viewport is measured (about a 1080p desktop). */
const DEFAULT_PER_PAGE = 10;
const MIN_PER_PAGE = 5;
const MAX_PER_PAGE = 15;
/** Fallbacks for the measurement: one row, the column header, the pager. */
const ROW_PX = 45;
const HEADER_PX = 48;
const PAGER_PX = 44;
/** Breathing room kept under the table. */
const BOTTOM_PX = 24;

/**
 * How many rows fit between the table's top and the bottom of the window, so
 * the day's log sits on screen without scrolling.
 */
function useRowsPerPage(ref: React.RefObject<HTMLElement | null>, hasRows: boolean): number {
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  useLayoutEffect(() => {
    function measure() {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const row = el.querySelector<HTMLElement>("[data-entry-row]")?.offsetHeight || ROW_PX;
      const fit = Math.floor((window.innerHeight - top - HEADER_PX - PAGER_PX - BOTTOM_PX) / row);
      setPerPage(Math.min(MAX_PER_PAGE, Math.max(MIN_PER_PAGE, fit)));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref, hasRows]);

  return perPage;
}

export function EntryTable({ entries, filter = "all" }: EntryTableProps) {
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const [typesOpen, setTypesOpen] = useState(false);
  const [page, setPage] = useState(0);
  const { label: typeLabel } = useCaseTypes();
  const today = useLocalToday();
  const region = useRef<HTMLDivElement>(null);
  const perPage = useRowsPerPage(region, entries.length > 0);

  // Back to the first page when the view changes or a row is added (the new
  // row sorts to the top): a different sort, filter or day, or more rows.
  const viewKey = `${sort.key}:${sort.dir}|${filter}|${entries[0]?.date ?? ""}`;
  const [seen, setSeen] = useState({ viewKey, count: entries.length });
  if (seen.viewKey !== viewKey || seen.count !== entries.length) {
    if (seen.viewKey !== viewKey || entries.length > seen.count) setPage(0);
    setSeen({ viewKey, count: entries.length });
  }

  function onSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: FIRST_DIR[key] }
    );
  }

  if (entries.length === 0) {
    return (
      <Empty className="border border-dashed border-border py-10">
        <EmptyHeader>
          <EmptyTitle className="font-serif">No rows for this day</EmptyTitle>
          <EmptyDescription>
            Add a row above and it will show up here, newest at the top.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const sorted = sortEntries(entries, sort);
  const matching = sorted.filter((e) => filter === "all" || e.caseType === filter);
  const visible = matching.length;
  const pageCount = Math.max(1, Math.ceil(visible / perPage));
  // A deletion can leave the page past the end; show the last page instead.
  const current = Math.min(page, pageCount - 1);
  const first = current * perPage;
  const onPage = new Set(matching.slice(first, first + perPage).map((e) => e.id));

  return (
    <div className="space-y-2">
      <div
        ref={region}
        role="region"
        aria-label="Rows for this day. Click any field to edit it."
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm"
        style={{ scrollbarWidth: "none" }}
      >
        <div role="table" className="min-w-[46rem]">
          <div
            role="row"
            className={cn("grid border-b border-border text-muted-foreground", COLUMNS)}
          >
            <SortHeader label="Case #" column="case" sort={sort} onSort={onSort} />
            <div role="columnheader" className="flex h-12 min-w-0 items-center px-1.5">
              <button
                type="button"
                onClick={() => setTypesOpen(true)}
                title="Edit case types"
                aria-label="Type. Edit case types"
                className="group/types inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Type
                <Pencil className="size-3.5 opacity-50 transition-opacity group-hover/types:opacity-100" aria-hidden />
              </button>
            </div>
            <SortHeader label="Start" column="start" sort={sort} onSort={onSort} />
            <SortHeader label="End" column="end" sort={sort} onSort={onSort} />
            <SortHeader label="Length" column="length" sort={sort} onSort={onSort} />
            <Cell header className="h-12 px-3 text-xs font-medium">Notes</Cell>
            <Cell header className="h-12" />
          </div>
          <div role="rowgroup" className="[&>[role=row]:last-child_.border-b]:border-0">
            {/* Every row stays mounted so an edit in progress survives a filter
                or page change; rows off this page collapse away. */}
            {sorted.map((e) => (
              <EntryRow key={e.id} entry={e} shown={onPage.has(e.id)} today={today} />
            ))}
          </div>
          {visible === 0 && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "" : typeLabel(filter) + " "}rows on this day.
            </p>
          )}
        </div>
        <CaseTypesDialog open={typesOpen} onOpenChange={setTypesOpen} />
      </div>
      {pageCount > 1 && (
        <nav aria-label="Pages of rows" className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
          <span className="mr-2 tabular-nums" aria-live="polite">
            {first + 1}–{Math.min(first + perPage, visible)} of {visible}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
