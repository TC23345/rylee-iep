"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  CASE_TYPE_GROUPS,
  CASE_TYPE_LABELS,
  entryFormSchema,
  noteTemplate,
  requiresCaseNumber,
  typeStyle,
  type EntryFormValues,
} from "@/lib/entry-schema";
import { formatDuration, minutesBetween, nowTime } from "@/lib/dates";
import type { EntryActionResult } from "@/app/actions/entries";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntryFormProps {
  defaultValues: EntryFormValues;
  action: (values: EntryFormValues) => Promise<EntryActionResult>;
  submitLabel: string;
  successMessage: string;
  /**
   * Two screens: what the row is (number, type), then when it happened (times,
   * note). Off for editing, where every field sits on one screen.
   */
  stepped?: boolean;
  /** Show the date picker (edit dialog, or logging a past day). */
  showDate?: boolean;
  /** Fill an empty start / end time with the current clock once mounted. */
  nowStart?: boolean;
  nowEnd?: boolean;
  autoFocus?: boolean;
  /** Called after a successful save; the caller decides whether to close. */
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Lets a dialog title reflect the current step ("Step 1 of 2"). */
  onStepChange?: (step: 1 | 2) => void;
}

/**
 * A time input whose clock icon stamps the current time. Clicking the field
 * itself opens the browser's time picker, and the digits can be typed over.
 */
function TimeField({
  control,
  name,
  label,
  trailing,
  onNow,
}: {
  control: Control<EntryFormValues>;
  name: "startTime" | "endTime";
  label: string;
  /** Small text shown at the right end of the label row. */
  trailing?: string;
  onNow: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-baseline justify-between">
            <FormLabel>{label}</FormLabel>
            {trailing && <span className="text-xs text-muted-foreground">{trailing}</span>}
          </div>
          <InputGroup>
            <FormControl>
              <InputGroupInput
                type="time"
                className="tabular-nums [&::-webkit-calendar-picker-indicator]:hidden"
                onClick={(event) => {
                  try {
                    event.currentTarget.showPicker?.();
                  } catch {
                    // Some browsers only allow the picker from certain gestures.
                  }
                }}
                {...field}
              />
            </FormControl>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                aria-label={`Set ${label.toLowerCase()} to now`}
                title="Set to now"
                onClick={onNow}
              >
                <Clock />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const STEP_ONE_FIELDS: FieldPath<EntryFormValues>[] = ["caseNumber", "caseType"];

export function EntryForm({
  defaultValues,
  action,
  submitLabel,
  successMessage,
  stepped = false,
  showDate = false,
  nowStart = false,
  nowEnd = false,
  autoFocus = false,
  onSuccess,
  onCancel,
  onStepChange,
}: EntryFormProps) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const control = form.control as Control<EntryFormValues>;

  // The note field stays hidden until asked for, unless the row already has one.
  const [noteOpen, setNoteOpen] = useState(defaultValues.note.trim() !== "");

  // Clock defaults are applied after mount so server and client markup match.
  useEffect(() => {
    if (nowStart && !form.getValues("startTime")) form.setValue("startTime", nowTime());
    if (nowEnd && !form.getValues("endTime")) form.setValue("endTime", nowTime());
  }, [nowStart, nowEnd, form]);

  const [startTime, endTime, caseType] = useWatch({
    control,
    name: ["startTime", "endTime", "caseType"],
  });
  const duration = minutesBetween(startTime, endTime);
  const needsCase = requiresCaseNumber(caseType);

  function goTo(next: 1 | 2) {
    setStep(next);
    onStepChange?.(next);
  }

  async function next() {
    const ok = await form.trigger(STEP_ONE_FIELDS);
    if (ok) goTo(2);
  }

  function openNote() {
    if (!form.getValues("note").trim()) form.setValue("note", noteTemplate(caseType));
    setNoteOpen(true);
  }

  function closeNote() {
    form.setValue("note", "");
    setNoteOpen(false);
  }

  function onSubmit(values: EntryFormValues) {
    startTransition(async () => {
      const res = await action(values);
      if (res.ok) {
        toast.success(successMessage);
        onSuccess?.();
      } else {
        toast.error(res.error);
        if (res.field) {
          form.setError(res.field as FieldPath<EntryFormValues>, { message: res.error });
          if (stepped && STEP_ONE_FIELDS.includes(res.field as FieldPath<EntryFormValues>)) {
            goTo(1);
          }
        }
      }
    });
  }

  const showIdentity = !stepped || step === 1;
  const showTiming = !stepped || step === 2;

  const identity = (
    <div className="space-y-3">
      {showDate && (
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="caseNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Case Number
              {!needsCase && (
                <span className="ml-1 font-normal text-muted-foreground">optional</span>
              )}
            </FormLabel>
            <FormControl>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={needsCase ? "262104140" : "If it was about a case"}
                autoComplete="off"
                autoFocus={autoFocus}
                className="font-mono"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="caseType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CASE_TYPE_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span
                          aria-hidden
                          className={cn("inline-block size-2.5 rounded-full", typeStyle(t).bar)}
                        />
                        {CASE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const timing = (
    <div className="space-y-3">
      <TimeField
        control={control}
        name="startTime"
        label="Start"
        onNow={() => form.setValue("startTime", nowTime(), { shouldValidate: true })}
      />
      <TimeField
        control={control}
        name="endTime"
        label="End"
        trailing={duration === null ? undefined : `Length ${formatDuration(duration)}`}
        onNow={() => form.setValue("endTime", nowTime(), { shouldValidate: true })}
      />
      {noteOpen ? (
        <FormField
          control={control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-baseline justify-between">
                <FormLabel>Note</FormLabel>
                <button
                  type="button"
                  onClick={closeNote}
                  className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" /> Remove note
                </button>
              </div>
              <FormControl>
                <Textarea
                  rows={6}
                  autoFocus
                  placeholder="Anything worth remembering"
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <button
          type="button"
          onClick={openNote}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3" /> Add a note
        </button>
      )}
    </div>
  );

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(event) => {
          // Enter on step one advances instead of submitting a half-filled row.
          if (stepped && step === 1 && event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            void next();
          }
        }}
      >
        {showIdentity && identity}
        {showTiming && timing}

        <div className="flex items-center justify-between gap-2">
          <div>
            {stepped && step === 2 && (
              <Button type="button" variant="ghost" onClick={() => goTo(1)}>
                <ArrowLeft /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {stepped && step === 1 ? (
              // Keyed so React never turns this node into the submit button
              // mid-click; a real click would otherwise submit the form.
              <Button
                key="next"
                type="button"
                className="btn-primary"
                onClick={(event) => {
                  event.preventDefault();
                  void next();
                }}
              >
                Next
              </Button>
            ) : (
              <Button key="submit" type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving..." : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
