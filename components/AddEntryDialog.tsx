"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createEntry } from "@/app/actions/entries";
import { emptyEntryValues, type CaseType, type RecentCase } from "@/lib/entry-schema";
import { cn } from "@/lib/utils";
import { EntryForm } from "@/components/EntryForm";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddEntryDialogProps {
  date: string;
  isToday: boolean;
  /** End time of the last row that day; on a past day the new row starts there. */
  lastEnd: string | null;
  /** Case type of the latest row that day; the picker starts on it. */
  lastType: CaseType | null;
  /** Types used most recently that day, offered as one-tap picks on step one. */
  recentTypes: CaseType[];
  /** Case numbers worked lately, suggested while typing the number. */
  recentCases: RecentCase[];
}

const STEP_HINTS: Record<1 | 2, string> = {
  1: "Which case, and what kind of work.",
  2: "When it started and ended.",
};

/** "Add a row" button that opens the two-step add form. */
export function AddEntryDialog({
  date,
  isToday,
  lastEnd,
  lastType,
  recentTypes,
  recentCases,
}: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const types = useCaseTypes();
  // The last row's type if it is still offered; else Reconsideration (Rylee's
  // most common), or the first case type if that was removed.
  const lastUsable = lastType && types.get(lastType) && !types.get(lastType)?.archived ? lastType : null;
  const startType = lastUsable ?? types.defaultKey;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setStep(1);
  }

  return (
    <>
      <Button className="btn-primary btn-soft gap-1.5" onClick={() => onOpenChange(true)}>
        <Plus className="size-4" /> Add a row
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 pr-6">
              <DialogTitle className="font-serif text-xl">Add a case</DialogTitle>
              <span className="flex items-center gap-2" aria-label={`Step ${step} of 2`}>
                <span className="flex gap-1" aria-hidden>
                  {([1, 2] as const).map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "h-1.5 w-4 rounded-full transition-colors",
                        s <= step ? "bg-brand" : "bg-muted"
                      )}
                    />
                  ))}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {step} / 2
                </span>
              </span>
            </div>
            <DialogDescription>{STEP_HINTS[step]}</DialogDescription>
          </DialogHeader>
          {open && (
            <EntryForm
              key={`${date}:${lastEnd ?? ""}:${startType}`}
              defaultValues={emptyEntryValues(date, {
                // Today a case starts now and its End stays open (the day log
                // runs a clock); a past day picks up where its last row ended.
                startTime: isToday ? "" : lastEnd ?? "",
                caseType: startType,
              })}
              action={createEntry}
              submitLabel="Add case"
              successMessage="Case added."
              stepped
              nowStart={isToday}
              autoFocus
              recentTypes={recentTypes}
              recentCases={recentCases}
              onStepChange={setStep}
              onSuccess={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
