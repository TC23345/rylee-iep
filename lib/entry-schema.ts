import { z } from "zod";

// Client-safe schema for one row of the case log. Mirrors the columns of Rylee's
// spreadsheet: Date, Case #, Case Type, Start Time, End Time, (Duration), Notes.
// The case types themselves live per log; see lib/case-types.ts.

/** A case type's stable key (see CaseTypeDef.key). */
export type CaseType = string;

/** A case number worked recently, for the add dialog's suggestions. */
export interface RecentCase {
  caseNumber: string;
  /** Latest day it was logged. */
  lastDate: string;
  /** Its type on that latest row. */
  lastType: CaseType;
}

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const entryShape = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  caseNumber: z.string().trim().regex(/^\d{0,12}$/, "Digits only"),
  caseType: z.string().min(1, "Pick a type").max(64),
  startTime: z.string().regex(TIME, "Use HH:MM").or(z.literal("")),
  endTime: z.string().regex(TIME, "Use HH:MM").or(z.literal("")),
  note: z.string().trim().max(2000, "Keep notes under 2000 characters"),
});

export type EntryFormValues = z.infer<typeof entryShape>;

/** Every case number Rylee works is nine digits. */
export const CASE_NUMBER_LENGTH = 9;

/**
 * The row schema for one log. Whether a case number is required depends on the
 * type's category, which the log's own type list decides. `strictCaseNumber`
 * requires a given number to be exactly nine digits; it is off for rows kept
 * from older data (an edit that leaves the number alone, an Undo, an import).
 */
export function makeEntryFormSchema(
  requiresCaseNumber: (type: string) => boolean,
  { strictCaseNumber = true }: { strictCaseNumber?: boolean } = {}
) {
  return entryShape.superRefine((v, ctx) => {
    if (requiresCaseNumber(v.caseType) && !v.caseNumber) {
      ctx.addIssue({ code: "custom", path: ["caseNumber"], message: "Case # is required" });
    } else if (strictCaseNumber && v.caseNumber && v.caseNumber.length !== CASE_NUMBER_LENGTH) {
      ctx.addIssue({
        code: "custom",
        path: ["caseNumber"],
        message: `Case # is ${CASE_NUMBER_LENGTH} digits`,
      });
    }
    if (v.startTime && v.endTime && v.endTime < v.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time is before start time" });
    }
  });
}

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
