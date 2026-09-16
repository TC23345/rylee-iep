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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function EntryRow({ entry }: { entry: CaseEntry }) {
  const isBreak = entry.caseType === "lunch";

  return (
    <TableRow className={cn(isBreak && "bg-muted/40 text-muted-foreground")}>
      <TableCell className="font-mono tabular-nums">{entry.caseNumber || "—"}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn("font-medium", typeStyle(entry.caseType).chip)}>
          {typeLabel(entry.caseType)}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums">
        {entry.startTime ? formatTime12(entry.startTime) : "—"}
      </TableCell>
      <TableCell className="tabular-nums">
        {entry.endTime ? formatTime12(entry.endTime) : "—"}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {entry.durationMin === null ? "—" : formatDuration(entry.durationMin)}
      </TableCell>
      <TableCell className="max-w-72 whitespace-normal text-foreground/80">{entry.note}</TableCell>
      <TableCell className="py-1 pr-2 text-right">
        <RowMenu entry={entry} />
      </TableCell>
    </TableRow>
  );
}

export function EntryTable({ entries }: { entries: CaseEntry[] }) {
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

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-32">Case #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-24">Start</TableHead>
            <TableHead className="w-24">End</TableHead>
            <TableHead className="w-20">Length</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
