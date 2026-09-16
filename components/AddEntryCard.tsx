"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createEntry } from "@/app/actions/entries";
import { emptyEntryValues, type CaseType } from "@/lib/entry-schema";
import { EntryForm } from "@/components/EntryForm";
import { Button } from "@/components/ui/button";

interface AddEntryCardProps {
  date: string;
  isToday: boolean;
  /** End time of the last row that day; the new row starts there. */
  lastEnd: string | null;
  /** Case type of the last row that day; the picker defaults to it. */
  lastType: CaseType | null;
  /** Keep the form open (the Today page). */
  defaultOpen?: boolean;
}

export function AddEntryCard({
  date,
  isToday,
  lastEnd,
  lastType,
  defaultOpen = false,
}: AddEntryCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open) {
    return (
      <Button className="btn-primary gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add a row
      </Button>
    );
  }

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
      aria-label="Add a case"
    >
      <h3 className="mb-3 font-serif text-base font-semibold">Add a case</h3>
      <EntryForm
        key={`${date}:${lastEnd ?? ""}:${lastType ?? ""}`}
        defaultValues={emptyEntryValues(date, {
          startTime: lastEnd ?? "",
          caseType: lastType ?? "reconsideration",
        })}
        action={createEntry}
        submitLabel="Add case"
        successMessage="Case added."
        showDate={!isToday}
        nowStart={isToday && !lastEnd}
        nowEnd={isToday}
        resetOnSuccess
        autoFocus={defaultOpen}
        onCancel={defaultOpen ? undefined : () => setOpen(false)}
      />
    </section>
  );
}
