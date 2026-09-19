"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarDays, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  CASE_NUMBER_LENGTH,
  makeEntryFormSchema,
  type CaseType,
  type EntryFormValues,
  type RecentCase,
} from "@/lib/entry-schema";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import {
  dayLabel,
  formatDuration,
  localTodayIso,
  minutesBetween,
  nowTime,
  shortDayLabel,
} from "@/lib/dates";
import type { EntryActionResult } from "@/app/actions/entries";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
  /** Fill an empty start time with the current clock once mounted. */
  nowStart?: boolean;
  autoFocus?: boolean;
  /** Types used recently that day, offered as one-tap picks above the Type select. */
  recentTypes?: CaseType[];
  /** Case numbers worked lately, suggested while the number is typed. */
  recentCases?: RecentCase[];
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

const STEP_ONE_FIELDS: FieldPath<EntryFormValues>[] = ["date", "caseNumber", "caseType"];

const MAX_SUGGESTIONS = 5;

/** Recent case numbers containing the typed digits anywhere, most recent first. */
function matchCases(recent: RecentCase[], typed: string): RecentCase[] {
  if (typed.length < 2) return [];
  return recent
    .filter((r) => r.caseNumber !== typed && r.caseNumber.includes(typed))
    .slice(0, MAX_SUGGESTIONS);
}

export function EntryForm({
  defaultValues,
  action,
  submitLabel,
  successMessage,
  stepped = false,
  nowStart = false,
  autoFocus = false,
  recentTypes = [],
  recentCases = [],
  onSuccess,
  onCancel,
  onStepChange,
}: EntryFormProps) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const types = useCaseTypes();
  const { requiresCaseNumber } = types;
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(makeEntryFormSchema(requiresCaseNumber)),
    defaultValues,
    mode: "onSubmit",
  });
  const control = form.control as Control<EntryFormValues>;

  // The note field stays hidden until asked for, unless the row already has one.
  const [noteOpen, setNoteOpen] = useState(defaultValues.note.trim() !== "");

  // The clock default is applied after mount so server and client markup match.
  useEffect(() => {
    if (nowStart && !form.getValues("startTime")) form.setValue("startTime", nowTime());
  }, [nowStart, form]);

  const [date, caseNumber, startTime, endTime, caseType] = useWatch({
    control,
    name: ["date", "caseNumber", "startTime", "endTime", "caseType"],
  });
  const duration = minutesBetween(startTime, endTime);
  const needsCase = requiresCaseNumber(caseType);

  const dateInput = useRef<HTMLInputElement>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const suggestions = suggestOpen ? matchCases(recentCases, caseNumber) : [];
  const today = localTodayIso();

  function pickCase(r: RecentCase) {
    form.setValue("caseNumber", r.caseNumber, { shouldValidate: true });
    setSuggestOpen(false);
    setHighlight(-1);
  }

  function openDatePicker() {
    try {
      dateInput.current?.showPicker?.();
    } catch {
      dateInput.current?.focus();
    }
  }

  function goTo(next: 1 | 2) {
    setStep(next);
    onStepChange?.(next);
  }

  async function next() {
    const ok = await form.trigger(STEP_ONE_FIELDS);
    if (ok) goTo(2);
  }

  function openNote() {
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

  // Recent types that are still offered: no breaks, nothing archived or removed.
  const typeChips = recentTypes
    .filter((t) => {
      const def = types.get(t);
      return def && !def.archived && !types.isBreak(t);
    })
    .slice(0, 4);

  const identity = (
    <div className="space-y-3">
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
            <div className="relative">
              {/* The date rides along as an icon: it is almost always today. */}
              <InputGroup>
                <FormControl>
                  <InputGroupInput
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={CASE_NUMBER_LENGTH}
                    autoComplete="off"
                    autoFocus={autoFocus}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={suggestions.length > 0}
                    aria-controls="case-suggestions"
                    aria-activedescendant={highlight >= 0 ? `case-suggestion-${highlight}` : undefined}
                    className="font-mono tabular-nums"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value.replace(/\D/g, ""));
                      setSuggestOpen(true);
                      setHighlight(-1);
                    }}
                    onBlur={() => {
                      field.onBlur();
                      setSuggestOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (suggestions.length === 0) return;
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const last = suggestions.length - 1;
                        setHighlight((h) =>
                          e.key === "ArrowDown" ? (h >= last ? 0 : h + 1) : h <= 0 ? last : h - 1
                        );
                      } else if (e.key === "Enter" && highlight >= 0) {
                        // Pick the suggestion rather than moving to step two.
                        e.preventDefault();
                        e.stopPropagation();
                        pickCase(suggestions[highlight]);
                      } else if (e.key === "Escape") {
                        e.stopPropagation();
                        setSuggestOpen(false);
                      }
                    }}
                  />
                </FormControl>
                <InputGroupAddon align="inline-end" className="relative">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    aria-label={`Date: ${dayLabel(date)}. Change the date`}
                    title={dayLabel(date)}
                    onClick={openDatePicker}
                  >
                    <CalendarDays />
                  </InputGroupButton>
                  {/* Invisible date input the icon opens; sits under the icon so the picker anchors there. */}
                  <input
                    ref={dateInput}
                    type="date"
                    tabIndex={-1}
                    aria-hidden
                    value={date}
                    max={today}
                    onChange={(e) => {
                      if (e.target.value) form.setValue("date", e.target.value, { shouldValidate: true });
                    }}
                    className="pointer-events-none absolute inset-0 opacity-0"
                  />
                </InputGroupAddon>
              </InputGroup>
              {suggestions.length > 0 && (
                <ul
                  id="case-suggestions"
                  role="listbox"
                  aria-label="Recent case numbers"
                  className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-md"
                >
                  {suggestions.map((r, i) => (
                    <li
                      key={r.caseNumber}
                      id={`case-suggestion-${i}`}
                      role="option"
                      aria-selected={i === highlight}
                      // mousedown, not click: it lands before the input's blur closes the list.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickCase(r);
                      }}
                      onMouseEnter={() => setHighlight(i)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm",
                        i === highlight && "bg-muted"
                      )}
                    >
                      <span className="font-mono tabular-nums">{r.caseNumber}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          types.style(r.lastType).chip
                        )}
                      >
                        {types.label(r.lastType)}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {r.lastDate === today ? "today" : shortDayLabel(r.lastDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {date !== defaultValues.date && (
              <p className="text-xs text-muted-foreground">
                Logging for <span className="font-medium text-foreground">{dayLabel(date)}</span>
                {" · "}
                <button
                  type="button"
                  className="underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => form.setValue("date", defaultValues.date, { shouldValidate: true })}
                >
                  back to {defaultValues.date === today ? "today" : dayLabel(defaultValues.date)}
                </button>
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      {typeChips.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Used today</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Recent types">
            {typeChips.map((t) => {
              const active = caseType === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => form.setValue("caseType", t, { shouldValidate: true })}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
                    active
                      ? "border-brand bg-brand/15 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-brand/60 hover:text-foreground"
                  )}
                >
                  <span aria-hidden className={cn("size-1.5 rounded-full", types.style(t).bar)} />
                  {types.label(t)}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
                {types.groups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        <span
                          aria-hidden
                          className={cn("inline-block size-2.5 rounded-full", types.style(t.key).bar)}
                        />
                        {t.label}
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
        trailing={
          duration !== null
            ? `Length ${formatDuration(duration)}`
            : !endTime && date === today
              ? "Leave blank to keep the clock running"
              : undefined
        }
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
                  className="text-sm"
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
                className="btn-primary btn-soft"
                onClick={(event) => {
                  event.preventDefault();
                  void next();
                }}
              >
                Next
              </Button>
            ) : (
              <Button key="submit" type="submit" className="btn-primary btn-soft" disabled={pending}>
                {pending ? "Saving..." : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
