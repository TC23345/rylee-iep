"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createEntry } from "@/app/actions/entries";
import { emptyEntryValues, type CaseType } from "@/lib/entry-schema";
import { EntryForm } from "@/components/EntryForm";
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
  /** Case type of the last row that day; the picker defaults to it. */
  lastType: CaseType | null;
}

const STEP_HINTS: Record<1 | 2, string> = {
  1: "Which case, and what kind of work.",
  2: "When it started and ended.",
};

/** "Add a row" button that opens the two-step add form. */
export function AddEntryDialog({ date, isToday, lastEnd, lastType }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) setStep(1);
  }

  return (
    <>
      <Button className="btn-primary gap-1.5" onClick={() => onOpenChange(true)}>
        <Plus className="size-4" /> Add a row
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add a case</DialogTitle>
            <DialogDescription>
              Step {step} of 2. {STEP_HINTS[step]}
            </DialogDescription>
          </DialogHeader>
          {open && (
            <EntryForm
              key={`${date}:${lastEnd ?? ""}:${lastType ?? ""}`}
              defaultValues={emptyEntryValues(date, {
                startTime: lastEnd ?? "",
                caseType: lastType ?? "reconsideration",
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
