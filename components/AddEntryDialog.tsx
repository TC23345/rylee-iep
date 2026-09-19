"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createEntry } from "@/app/actions/entries";
import { emptyEntryValues } from "@/lib/entry-schema";
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
  /** End time of the last row that day; the new row starts there. */
  lastEnd: string | null;
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
}: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  // Reconsideration (Rylee's most common), or the first case type if it was removed.
  const { defaultKey } = useCaseTypes();

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
              key={`${date}:${lastEnd ?? ""}`}
              defaultValues={emptyEntryValues(date, {
                startTime: lastEnd ?? "",
                caseType: defaultKey,
              })}
              action={createEntry}
              submitLabel="Add case"
              successMessage="Case added."
              stepped
              showDate={!isToday}
              nowStart={isToday && !lastEnd}
              nowEnd={isToday}
              autoFocus
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
