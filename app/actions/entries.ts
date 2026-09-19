"use server";

import { revalidatePath } from "next/cache";
import { requireSignedInUser, type WorkspaceUser } from "@/lib/authz";
import { makeEntryFormSchema, type EntryFormValues } from "@/lib/entry-schema";
import { caseTypeHelpers } from "@/lib/case-types";
import { getCaseTypes } from "@/lib/case-types-db";
import { isIsoDate, minutesBetween } from "@/lib/dates";
import {
  deleteEntry as deleteEntryDoc,
  insertEntry,
  updateEntry as updateEntryDoc,
  type EntryPatch,
} from "@/lib/entries";
import { tryWriteAuditEvent } from "@/lib/audit";

export type EntryActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; field?: string };

async function actor(): Promise<WorkspaceUser | null> {
  try {
    return await requireSignedInUser();
  } catch {
    return null;
  }
}

/**
 * Validate a row against the log's own case types. Archived types are accepted
 * (the pickers hide them, but an edit or an Undo may carry one); removed or
 * unknown types are not.
 */
async function parse(
  orgId: string,
  values: EntryFormValues
): Promise<{ patch: EntryPatch } | { error: string; field?: string }> {
  const types = caseTypeHelpers(await getCaseTypes(orgId));
  const parsed = makeEntryFormSchema(types.requiresCaseNumber).safeParse(values);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input.", field: first?.path.join(".") };
  }
  const v = parsed.data;
  if (!types.get(v.caseType)) {
    return { error: "Pick a case type from the list.", field: "caseType" };
  }
  if (!isIsoDate(v.date)) return { error: "That date does not exist.", field: "date" };
  return {
    patch: {
      date: v.date,
      caseNumber: v.caseNumber,
      caseType: v.caseType,
      startTime: v.startTime || null,
      endTime: v.endTime || null,
      durationMin: minutesBetween(v.startTime, v.endTime),
      note: v.note,
    },
  };
}

function refresh() {
  revalidatePath("/", "layout");
}

const DB_ERROR = "Could not save. Check the database connection.";

export async function createEntry(values: EntryFormValues): Promise<EntryActionResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };

  try {
    const result = await parse(user.orgId, values);
    if ("error" in result) return { ok: false, error: result.error, field: result.field };
    const id = await insertEntry(user.orgId, user.userId, result.patch);
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "case_entry.created",
      metadata: { id, date: result.patch.date, caseType: result.patch.caseType },
      createdAt: new Date(),
    });
    refresh();
    return { ok: true, id };
  } catch {
    return { ok: false, error: DB_ERROR };
  }
}

export async function updateEntry(
  id: string,
  values: EntryFormValues
): Promise<EntryActionResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };

  try {
    const result = await parse(user.orgId, values);
    if ("error" in result) return { ok: false, error: result.error, field: result.field };
    const found = await updateEntryDoc(user.orgId, id, result.patch);
    if (!found) return { ok: false, error: "That row no longer exists." };
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "case_entry.updated",
      metadata: { id, date: result.patch.date, caseType: result.patch.caseType },
      createdAt: new Date(),
    });
    refresh();
    return { ok: true, id };
  } catch {
    return { ok: false, error: DB_ERROR };
  }
}

export async function deleteEntry(id: string): Promise<EntryActionResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };

  try {
    const found = await deleteEntryDoc(user.orgId, id);
    if (!found) return { ok: false, error: "That row no longer exists." };
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "case_entry.deleted",
      metadata: { id },
      createdAt: new Date(),
    });
    refresh();
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Could not delete. Check the database connection." };
  }
}
