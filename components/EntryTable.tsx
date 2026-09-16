"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteEntry, updateEntry } from "@/app/actions/entries";
import type { CaseEntry } from "@/lib/entries";
import { CASE_TYPE_LABELS, CASE_TYPE_STYLES, type EntryFormValues } from "@/lib/entry-schema";
import { formatDuration, formatTime12 } from "@/lib/dates";
import { EntryForm } from "@/components/EntryForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function DeleteEntryButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setConfirming(true)}
        aria-label="Delete row"
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await deleteEntry(id);
            if (res.ok) toast.success("Row deleted.");
            else toast.error(res.error);
            setConfirming(false);
          })
        }
      >
        {pending ? "Deleting..." : "Delete"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </span>
  );
}

function EntryRow({ entry }: { entry: CaseEntry }) {
  const [editing, setEditing] = useState(false);
  const isBreak = entry.caseType === "lunch";

  return (
    <tr className={`border-b border-border last:border-0 ${isBreak ? "bg-muted/40" : ""}`}>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-sm">{entry.caseNumber || "—"}</td>
      <td className="px-3 py-2">
        <span
          className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${CASE_TYPE_STYLES[entry.caseType]}`}
        >
          {CASE_TYPE_LABELS[entry.caseType]}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-sm tabular-nums">
        {entry.startTime ? formatTime12(entry.startTime) : "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-sm tabular-nums">
        {entry.endTime ? formatTime12(entry.endTime) : "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-2 font-mono text-sm tabular-nums text-muted-foreground">
        {entry.durationMin === null ? "—" : formatDuration(entry.durationMin)}
      </td>
      <td className="min-w-40 max-w-md whitespace-pre-wrap px-3 py-2 text-sm text-foreground/80">
        {entry.note}
      </td>
      <td className="whitespace-nowrap px-1 py-1 text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
          aria-label="Edit row"
        >
          <Pencil className="size-4" />
        </Button>
        <DeleteEntryButton id={entry.id} />
        <EditEntryDialog entry={entry} open={editing} onOpenChange={setEditing} />
      </td>
    </tr>
  );
}

export function EntryTable({ entries }: { entries: CaseEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No rows for this day yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 font-medium">Case #</th>
            <th className="px-3 py-2 font-medium">Case type</th>
            <th className="px-3 py-2 font-medium">Start</th>
            <th className="px-3 py-2 font-medium">End</th>
            <th className="px-3 py-2 font-medium">Duration</th>
            <th className="px-3 py-2 font-medium">Notes</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
