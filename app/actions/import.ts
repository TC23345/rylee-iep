"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/authz";
import { minutesBetween } from "@/lib/dates";
import { insertEntries, type EntryPatch } from "@/lib/entries";
import { importRowSchema, type ImportRow } from "@/lib/spreadsheet";
import { getCaseTypes } from "@/lib/case-types-db";
import { tryWriteAuditEvent } from "@/lib/audit";

export type ImportResult =
  | { ok: true; inserted: number; skipped: number; invalid: number }
  | { ok: false; error: string };

const MAX_ROWS = 5000;
const batchSchema = z.array(importRowSchema).max(MAX_ROWS);

/**
 * Store rows parsed from a spreadsheet. Rows already in the log (same day, case
 * number and start time) are skipped so a workbook can be imported twice safely.
 */
export async function importEntries(rows: ImportRow[]): Promise<ImportResult> {
  let user;
  try {
    user = await requireSignedInUser();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }

  const parsed = batchSchema.safeParse(rows);
  if (!parsed.success) {
    return { ok: false, error: `Could not read the rows (${parsed.error.issues[0]?.message ?? "invalid"}).` };
  }

  // Only types this log has; the browser resolved them, the server double-checks.
  let known: Set<string>;
  try {
    known = new Set((await getCaseTypes(user.orgId)).map((t) => t.key));
  } catch {
    return { ok: false, error: "Could not save. Check the database connection." };
  }
  const usable = parsed.data.filter((r) => known.has(r.caseType));

  const patches: EntryPatch[] = usable.map((r) => ({
    date: r.date,
    caseNumber: r.caseNumber,
    caseType: r.caseType,
    startTime: r.startTime,
    endTime: r.endTime,
    durationMin: r.startTime && r.endTime ? minutesBetween(r.startTime, r.endTime) : null,
    note: r.note,
  }));

  try {
    const { inserted, skipped } = await insertEntries(user.orgId, user.userId, patches);
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "case_entry.imported",
      metadata: { inserted, skipped, rows: patches.length },
      createdAt: new Date(),
    });
    revalidatePath("/", "layout");
    return { ok: true, inserted, skipped, invalid: rows.length - usable.length };
  } catch {
    return { ok: false, error: "Could not save. Check the database connection." };
  }
}
