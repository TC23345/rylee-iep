import { z } from "zod";

// Client-safe schema for one row of the case log. Mirrors the columns of Rylee's
// spreadsheet: Date, Case #, Case Type, Start Time, End Time, (Duration), Notes.

// The eleven picks in the spreadsheet's Case Type dropdown, grouped the way the
// form shows them: case work first, then the other things a workday holds.
export const caseTypes = [
  "reconsideration",
  "recon_reply",
  "continuation",
  "bcba_reply",
  "authorization_revision",
  "additional_info",
  "initial",
  "phone_call",
  "meeting",
  "admin_tasks",
  "lunch",
] as const;

export type CaseType = (typeof caseTypes)[number];

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  reconsideration: "Reconsideration",
  recon_reply: "Recon Reply",
  continuation: "Continuation",
  bcba_reply: "BCBA Reply",
  authorization_revision: "Authorization Revision",
  additional_info: "Additional Info",
  initial: "Initial",
  phone_call: "Phone Call",
  meeting: "Meeting",
  admin_tasks: "Admin Tasks",
  lunch: "Lunch",
};

/** Types that are a case review and therefore need a case number. */
const CASE_WORK: ReadonlySet<CaseType> = new Set<CaseType>([
  "reconsideration",
  "recon_reply",
  "continuation",
  "bcba_reply",
  "authorization_revision",
  "additional_info",
  "initial",
]);

export const CASE_TYPE_GROUPS: { label: string; types: CaseType[] }[] = [
  { label: "Case work", types: caseTypes.filter((t) => CASE_WORK.has(t)) },
  { label: "Other time", types: caseTypes.filter((t) => !CASE_WORK.has(t)) },
];

export function requiresCaseNumber(type: CaseType): boolean {
  return CASE_WORK.has(type);
}

/**
 * A row counts toward the daily case count when it is tied to a case number.
 * Lunch never counts. A phone call or meeting counts only if it was about a
 * specific case and the number was logged.
 */
export function countsAsCase(type: CaseType, caseNumber: string): boolean {
  return type !== "lunch" && caseNumber.trim() !== "";
}

/** Colour coding that matches the spreadsheet's cell fills (chip + bar segment). */
export const CASE_TYPE_STYLES: Record<CaseType, { chip: string; bar: string }> = {
  reconsideration: { chip: "bg-amber-100 text-amber-900", bar: "bg-amber-400" },
  recon_reply: { chip: "bg-lime-100 text-lime-900", bar: "bg-lime-400" },
  continuation: { chip: "bg-fuchsia-100 text-fuchsia-900", bar: "bg-fuchsia-400" },
  bcba_reply: { chip: "bg-sky-100 text-sky-900", bar: "bg-sky-400" },
  authorization_revision: { chip: "bg-emerald-100 text-emerald-900", bar: "bg-emerald-400" },
  additional_info: { chip: "bg-yellow-100 text-yellow-900", bar: "bg-yellow-300" },
  initial: { chip: "bg-indigo-100 text-indigo-900", bar: "bg-indigo-400" },
  phone_call: { chip: "bg-orange-100 text-orange-900", bar: "bg-orange-400" },
  meeting: { chip: "bg-violet-100 text-violet-900", bar: "bg-violet-400" },
  admin_tasks: { chip: "bg-stone-200 text-stone-800", bar: "bg-stone-400" },
  lunch: { chip: "bg-muted text-muted-foreground", bar: "bg-stone-300" },
};

const FALLBACK_STYLE = { chip: "bg-muted text-foreground", bar: "bg-stone-300" };

/** Tolerates a type that is no longer in the list (older rows). */
export function typeLabel(type: string): string {
  return CASE_TYPE_LABELS[type as CaseType] ?? type;
}
export function typeStyle(type: string): { chip: string; bar: string } {
  return CASE_TYPE_STYLES[type as CaseType] ?? FALLBACK_STYLE;
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
    if (requiresCaseNumber(v.caseType) && !v.caseNumber) {
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

/**
 * Starter text dropped into the Notes field when a note is added to a row of
 * this type. One template per type; only Reconsideration has one so far.
 */
export const NOTE_TEMPLATES: Partial<Record<CaseType, string>> = {
  reconsideration: [
    "# Reconsideration Notes",
    "",
    "---",
    "",
    ">  Reason for Denial",
    "",
    ">  New Info Requested",
    "",
    ">  Decision:",
    "",
    ">  Next steps",
    "",
  ].join("\n"),
};

export function noteTemplate(type: CaseType): string {
  return NOTE_TEMPLATES[type] ?? "";
}
