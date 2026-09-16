import { z } from "zod";

// Client-safe schema for one row of the case log. Mirrors the columns of Rylee's
// spreadsheet: Date, Case #, Case Type, Start Time, End Time, (Duration), Notes.

export const caseTypes = [
  "reconsideration",
  "authorization_revision",
  "recon_reply",
  "continuation",
  "bcba_reply",
  "additional_info",
  "lunch",
  "other",
] as const;

export type CaseType = (typeof caseTypes)[number];

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  reconsideration: "Reconsideration",
  authorization_revision: "Authorization Revision",
  recon_reply: "Recon Reply",
  continuation: "Continuation",
  bcba_reply: "BCBA Reply",
  additional_info: "Additional Info",
  lunch: "Lunch / break",
  other: "Other",
};

/** Colour coding that matches the spreadsheet's cell fills. */
export const CASE_TYPE_STYLES: Record<CaseType, string> = {
  reconsideration: "bg-amber-100 text-amber-900",
  authorization_revision: "bg-emerald-100 text-emerald-900",
  recon_reply: "bg-lime-100 text-lime-900",
  continuation: "bg-fuchsia-100 text-fuchsia-900",
  bcba_reply: "bg-sky-100 text-sky-900",
  additional_info: "bg-yellow-100 text-yellow-900",
  lunch: "bg-muted text-muted-foreground",
  other: "bg-muted text-foreground",
};

/** Breaks are logged for the timeline but do not count as cases. */
export function countsAsCase(type: CaseType): boolean {
  return type !== "lunch";
}

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const entryFormSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    caseNumber: z.string().trim().regex(/^\d{0,12}$/, "Digits only"),
    caseType: z.enum(caseTypes),
    startTime: z.string().regex(TIME, "Use HH:MM").or(z.literal("")),
    endTime: z.string().regex(TIME, "Use HH:MM").or(z.literal("")),
    note: z.string().trim().max(2000, "Keep notes under 2000 characters"),
  })
  .superRefine((v, ctx) => {
    if (countsAsCase(v.caseType) && !v.caseNumber) {
      ctx.addIssue({ code: "custom", path: ["caseNumber"], message: "Case # is required" });
    }
    if (v.startTime && v.endTime && v.endTime < v.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time is before start time" });
    }
  });

export type EntryFormValues = z.infer<typeof entryFormSchema>;

export function emptyEntryValues(
  date: string,
  overrides: Partial<EntryFormValues> = {}
): EntryFormValues {
  return {
    date,
    caseNumber: "",
    caseType: "reconsideration",
    startTime: "",
    endTime: "",
    note: "",
    ...overrides,
  };
}
