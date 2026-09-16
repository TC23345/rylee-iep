"use client";

import { useEffect, useTransition } from "react";
import { useForm, useWatch, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  CASE_TYPE_LABELS,
  caseTypes,
  entryFormSchema,
  type EntryFormValues,
} from "@/lib/entry-schema";
import { formatDuration, minutesBetween, nowTime } from "@/lib/dates";
import type { EntryActionResult } from "@/app/actions/entries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntryFormProps {
  defaultValues: EntryFormValues;
  action: (values: EntryFormValues) => Promise<EntryActionResult>;
  submitLabel: string;
  successMessage: string;
  /** Show the date picker (edit dialog, or logging a past day). */
  showDate?: boolean;
  /** Fill an empty start / end time with the current clock once mounted. */
  nowStart?: boolean;
  nowEnd?: boolean;
  /** Clear the row-specific fields after a successful save (add form). */
  resetOnSuccess?: boolean;
  autoFocus?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function TimeField({
  control,
  name,
  label,
  onNow,
}: {
  control: Control<EntryFormValues>;
  name: "startTime" | "endTime";
  label: string;
  onNow: () => void;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-1.5">
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onNow}>
              Now
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function EntryForm({
  defaultValues,
  action,
  submitLabel,
  successMessage,
  showDate = false,
  nowStart = false,
  nowEnd = false,
  resetOnSuccess = false,
  autoFocus = false,
  onSuccess,
  onCancel,
}: EntryFormProps) {
  const [pending, startTransition] = useTransition();
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const control = form.control as Control<EntryFormValues>;

  // Clock defaults are applied after mount so server and client markup match.
  useEffect(() => {
    if (nowStart && !form.getValues("startTime")) form.setValue("startTime", nowTime());
    if (nowEnd && !form.getValues("endTime")) form.setValue("endTime", nowTime());
  }, [nowStart, nowEnd, form]);

  const [startTime, endTime] = useWatch({ control, name: ["startTime", "endTime"] });
  const duration = minutesBetween(startTime, endTime);

  function onSubmit(values: EntryFormValues) {
    startTransition(async () => {
      const res = await action(values);
      if (res.ok) {
        toast.success(successMessage);
        if (resetOnSuccess) {
          // Next row starts where this one ended.
          form.reset({
            ...defaultValues,
            caseType: values.caseType,
            caseNumber: "",
            note: "",
            startTime: values.endTime,
            endTime: "",
          });
          form.setFocus("caseNumber");
        }
        onSuccess?.();
      } else {
        toast.error(res.error);
        if (res.field) {
          form.setError(res.field as FieldPath<EntryFormValues>, { message: res.error });
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className={`grid grid-cols-1 gap-3 ${showDate ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
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
                <FormLabel>Case #</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="262104140"
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
                <FormLabel>Case type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {caseTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {CASE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
            onNow={() => form.setValue("endTime", nowTime(), { shouldValidate: true })}
          />
          <div className="pb-2 font-mono text-sm text-muted-foreground sm:w-24">
            {duration === null ? "Duration —" : `Duration ${formatDuration(duration)}`}
          </div>
        </div>

        <FormField
          control={control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
