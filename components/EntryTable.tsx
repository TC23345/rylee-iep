"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteEntry, updateEntry } from "@/app/actions/entries";
import type { CaseEntry } from "@/lib/entries";
import {
  CASE_TYPE_GROUPS,
  CASE_TYPE_LABELS,
  typeLabel,
  typeStyle,
  type CaseType,
  type EntryFormValues,
} from "@/lib/entry-schema";
import { formatDuration, formatTime12, minutesBetween } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { TypeFilter } from "@/components/TypeMix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none transition-colors hover:border-border focus:border-gold focus:bg-card";

type Draft = Omit<EntryFormValues, "date">;

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

function DeleteEntryDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: CaseEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const what = entry.caseNumber ? `case ${entry.caseNumber}` : typeLabel(entry.caseType).toLowerCase();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">Delete this row?</AlertDialogTitle>
          <AlertDialogDescription>
            The {what} row
            {entry.startTime ? ` starting ${formatTime12(entry.startTime)}` : ""} will be removed
            from the log. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep row</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const res = await deleteEntry(entry.id);
                if (res.ok) {
                  toast.success("Row deleted.");
                  onOpenChange(false);
                } else {
                  toast.error(res.error);
                }
              });
            }}
          >
            {pending ? "Deleting..." : "Delete row"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
function EntryRow({ entry, shown }: { entry: CaseEntry; shown: boolean }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(entry));
  const [deleting, setDeleting] = useState(false);
  const [saving, startTransition] = useTransition();
  const isBreak = draft.caseType === "lunch";

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
                className="h-7 w-auto gap-1 border-transparent bg-transparent px-1 shadow-none hover:border-border focus:border-gold data-[state=open]:border-gold"
              >
                <Badge variant="secondary" className={cn("font-medium", typeStyle(draft.caseType).chip)}>
                  {CASE_TYPE_LABELS[draft.caseType]}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {CASE_TYPE_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span aria-hidden className={cn("inline-block size-2.5 rounded-full", typeStyle(t).bar)} />
                        {CASE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
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
            <input
              type="time"
              value={draft.endTime}
              aria-label="End time"
              className={cn(FIELD, "tabular-nums [&::-webkit-calendar-picker-indicator]:hidden")}
              onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
              onBlur={(e) => commit({ endTime: e.target.value })}
            />
          </Cell>
          <Cell className="px-3 tabular-nums text-muted-foreground">
            {duration === null ? "—" : formatDuration(duration)}
          </Cell>
          <Cell>
            <input
              value={draft.note}
              placeholder="Add a note"
              aria-label="Notes"
              className={cn(FIELD, "text-foreground/80 placeholder:text-muted-foreground/50")}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              onBlur={(e) => commit({ note: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Cell>
          <Cell className="justify-end px-1">
            {shown && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${entry.caseNumber || typeLabel(entry.caseType)}`}
                  className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
                <DeleteEntryDialog entry={entry} open={deleting} onOpenChange={setDeleting} />
              </>
            )}
          </Cell>
        </div>
      </div>
    </div>
  );
}

interface EntryTableProps {
  entries: CaseEntry[];
  /** "all" or one case type; other rows collapse away. */
  filter?: TypeFilter;
}

export function EntryTable({ entries, filter = "all" }: EntryTableProps) {
  if (entries.length === 0) {
    return (
      <Empty className="border border-dashed border-border py-10">
        <EmptyHeader>
          <EmptyTitle className="font-serif">No rows for this day</EmptyTitle>
          <EmptyDescription>
            Add a row above and it will show up here, newest at the bottom.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const visible = entries.filter((e) => filter === "all" || e.caseType === filter).length;

  return (
    <div
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
          <Cell header className="px-3 text-xs font-medium">Case #</Cell>
          <Cell header className="px-3 text-xs font-medium">Type</Cell>
          <Cell header className="px-3 text-xs font-medium">Start</Cell>
          <Cell header className="px-3 text-xs font-medium">End</Cell>
          <Cell header className="px-3 text-xs font-medium">Length</Cell>
          <Cell header className="px-3 text-xs font-medium">Notes</Cell>
          <Cell header />
        </div>
        <div role="rowgroup" className="[&>[role=row]:last-child_.border-b]:border-0">
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} shown={filter === "all" || e.caseType === filter} />
          ))}
        </div>
        {visible === 0 && (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : typeLabel(filter) + " "}rows on this day.
          </p>
        )}
      </div>
    </div>
  );
}
