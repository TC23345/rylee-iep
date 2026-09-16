"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteEntry, updateEntry } from "@/app/actions/entries";
import type { CaseEntry } from "@/lib/entries";
import { typeLabel, typeStyle, type EntryFormValues } from "@/lib/entry-schema";
import { formatDuration, formatTime12 } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { EntryForm } from "@/components/EntryForm";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

// Case # · Type · Start · End · Length · Notes · menu
const COLUMNS =
  "grid-cols-[7.5rem_minmax(9.5rem,1.1fr)_5.5rem_5.5rem_4.5rem_minmax(10rem,2fr)_2.5rem]";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

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

function EditEntryDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: CaseEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Edit row</DialogTitle>
          <DialogDescription>Change any field, then save.</DialogDescription>
        </DialogHeader>
        <EntryForm
          defaultValues={toFormValues(entry)}
          action={(values) => updateEntry(entry.id, values)}
          submitLabel="Save changes"
          successMessage="Row updated."
          showDate
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
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

function RowMenu({ entry }: { entry: CaseEntry }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Actions for ${entry.caseNumber || typeLabel(entry.caseType)}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil /> Edit row
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <Trash2 /> Delete row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditEntryDialog entry={entry} open={editing} onOpenChange={setEditing} />
      <DeleteEntryDialog entry={entry} open={deleting} onOpenChange={setDeleting} />
    </>
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
      className={cn("flex min-w-0 items-center px-3 py-2 text-sm", className)}
    >
      {children}
    </div>
  );
}

/**
 * One row, wrapped in a grid whose single track collapses to 0fr when the row
 * is filtered out. The row stays mounted so its dialogs keep their state.
 */
function EntryRow({ entry, shown }: { entry: CaseEntry; shown: boolean }) {
  const isBreak = entry.caseType === "lunch";

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
            "grid border-b border-border transition-colors duration-100 hover:bg-muted/40",
            COLUMNS,
            isBreak && "bg-muted/40 text-muted-foreground"
          )}
        >
          <Cell className="font-mono tabular-nums">{entry.caseNumber || "—"}</Cell>
          <Cell>
            <Badge
              variant="secondary"
              className={cn("font-medium", typeStyle(entry.caseType).chip)}
            >
              {typeLabel(entry.caseType)}
            </Badge>
          </Cell>
          <Cell className="tabular-nums">{entry.startTime ? formatTime12(entry.startTime) : "—"}</Cell>
          <Cell className="tabular-nums">{entry.endTime ? formatTime12(entry.endTime) : "—"}</Cell>
          <Cell className="tabular-nums text-muted-foreground">
            {entry.durationMin === null ? "—" : formatDuration(entry.durationMin)}
          </Cell>
          <Cell className="whitespace-normal text-foreground/80">{entry.note}</Cell>
          <Cell className="justify-end px-1 py-1">
            {shown && <RowMenu entry={entry} />}
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
      aria-label="Rows for this day"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm"
      style={{ scrollbarWidth: "none" }}
    >
      <div role="table" className="min-w-[44rem]">
        <div
          role="row"
          className={cn("grid border-b border-border text-muted-foreground", COLUMNS)}
        >
          <Cell header className="text-xs font-medium">Case #</Cell>
          <Cell header className="text-xs font-medium">Type</Cell>
          <Cell header className="text-xs font-medium">Start</Cell>
          <Cell header className="text-xs font-medium">End</Cell>
          <Cell header className="text-xs font-medium">Length</Cell>
          <Cell header className="text-xs font-medium">Notes</Cell>
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
