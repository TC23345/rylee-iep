"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSignedInUser, type WorkspaceUser } from "@/lib/authz";
import { COLOR_KEYS, type CaseCategory, type ColorKey } from "@/lib/case-types";
import {
  CaseTypeError,
  createCaseType as createCaseTypeDoc,
  getCaseTypeUsage as getCaseTypeUsageDocs,
  removeCaseType as removeCaseTypeDoc,
  restoreCaseType as restoreCaseTypeDoc,
  updateCaseType as updateCaseTypeDoc,
} from "@/lib/case-types-db";
import { tryWriteAuditEvent } from "@/lib/audit";

export type CaseTypeResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const categorySchema = z.enum(["case", "other", "break"]);
const colorSchema = z.enum(COLOR_KEYS as [ColorKey, ...ColorKey[]]);
const keySchema = z.string().min(1).max(64);

async function actor(): Promise<WorkspaceUser | null> {
  try {
    return await requireSignedInUser();
  } catch {
    return null;
  }
}

function fail(err: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: err instanceof CaseTypeError ? err.message : fallback };
}

async function audit(user: WorkspaceUser, type: string, metadata: Record<string, string | number>) {
  await tryWriteAuditEvent({ orgId: user.orgId, userId: user.userId, type, metadata, createdAt: new Date() });
}

const DB_ERROR = "Could not save the type. Check the database connection.";

/** Rows per type in the viewed log, so the dialog can say what a removal will do. */
export async function getCaseTypeUsage(): Promise<CaseTypeResult<{ usage: Record<string, number> }>> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };
  try {
    return { ok: true, usage: await getCaseTypeUsageDocs(user.orgId) };
  } catch (err) {
    return fail(err, "Could not count rows by type.");
  }
}

export async function createCaseType(input: {
  label: string;
  color: ColorKey;
  category: CaseCategory;
}): Promise<CaseTypeResult<{ key: string }>> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = z
    .object({ label: z.string().max(80), color: colorSchema, category: categorySchema })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Pick a name, colour and category." };
  try {
    const type = await createCaseTypeDoc(user.orgId, parsed.data);
    await audit(user, "case_type.created", { key: type.key, label: type.label });
    revalidatePath("/", "layout");
    return { ok: true, key: type.key };
  } catch (err) {
    return fail(err, DB_ERROR);
  }
}

export async function updateCaseType(
  key: string,
  patch: { label?: string; color?: ColorKey; category?: CaseCategory }
): Promise<CaseTypeResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };
  const parsed = z
    .object({
      key: keySchema,
      label: z.string().max(80).optional(),
      color: colorSchema.optional(),
      category: categorySchema.optional(),
    })
    .safeParse({ key, ...patch });
  if (!parsed.success) return { ok: false, error: "That change could not be read." };
  const { key: k, ...fields } = parsed.data;
  try {
    const type = await updateCaseTypeDoc(user.orgId, k, fields);
    await audit(user, "case_type.updated", { key: type.key, label: type.label, category: type.category });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err, DB_ERROR);
  }
}

/** Removed outright when unused; archived (hidden from pickers) when rows use it. */
export async function removeCaseType(
  key: string
): Promise<CaseTypeResult<{ outcome: "deleted" | "archived"; rows: number }>> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };
  if (!keySchema.safeParse(key).success) return { ok: false, error: "Unknown type." };
  try {
    const res = await removeCaseTypeDoc(user.orgId, key);
    await audit(user, `case_type.${res.outcome}`, { key, rows: res.rows });
    revalidatePath("/", "layout");
    return { ok: true, ...res };
  } catch (err) {
    return fail(err, DB_ERROR);
  }
}

export async function restoreCaseType(key: string): Promise<CaseTypeResult> {
  const user = await actor();
  if (!user) return { ok: false, error: "Please sign in again." };
  if (!keySchema.safeParse(key).success) return { ok: false, error: "Unknown type." };
  try {
    await restoreCaseTypeDoc(user.orgId, key);
    await audit(user, "case_type.restored", { key });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err, DB_ERROR);
  }
}
