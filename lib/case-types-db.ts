import "server-only";

import { cache } from "react";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import {
  BUILTIN_CASE_TYPES,
  type CaseCategory,
  type CaseTypeDef,
  type ColorKey,
} from "@/lib/case-types";

// One document per (org, type) that differs from the built-in list: a built-in
// the user renamed, recoloured, archived or removed, or a type they added.
// Removal is a flag, not a delete, so Undo can always bring a type back.

interface CaseTypeDoc {
  orgId: string;
  key: string;
  label: string;
  color: ColorKey;
  category: CaseCategory;
  archived: boolean;
  deleted: boolean;
  builtin: boolean;
  /** Sort position for added types (built-ins keep the spreadsheet's order). */
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getCaseTypesCollection(): Promise<Collection<CaseTypeDoc>> {
  const db = await getDb();
  return db.collection<CaseTypeDoc>("case_types");
}

let indexesEnsured = false;

async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getCaseTypesCollection();
  await col.createIndex({ orgId: 1, key: 1 }, { name: "org_key", unique: true });
  indexesEnsured = true;
}

function toDef(d: Pick<CaseTypeDoc, "key" | "label" | "color" | "category" | "archived" | "builtin">): CaseTypeDef {
  return {
    key: d.key,
    label: d.label,
    color: d.color,
    category: d.category,
    archived: d.archived,
    builtin: d.builtin,
  };
}

/**
 * The log's types: built-ins (with any overrides) in the spreadsheet's order,
 * then added types oldest first. Removed types are left out; archived ones stay
 * so old rows keep their label and colour. Cached per request.
 */
export const getCaseTypes = cache(async (orgId: string): Promise<CaseTypeDef[]> => {
  const col = await getCaseTypesCollection();
  const docs = await col.find({ orgId }).sort({ order: 1, createdAt: 1 }).toArray();
  const byKey = new Map(docs.map((d) => [d.key, d]));

  const builtins = BUILTIN_CASE_TYPES.flatMap((b) => {
    const d = byKey.get(b.key);
    if (!d) return [b];
    return d.deleted ? [] : [toDef({ ...d, builtin: true })];
  });
  const added = docs.filter((d) => !d.builtin && !d.deleted).map(toDef);
  return [...builtins, ...added];
});

/** Keys whose rows never count as cases, for the aggregation pipelines. */
export async function getBreakKeys(orgId: string): Promise<string[]> {
  const types = await getCaseTypes(orgId);
  return types.filter((t) => t.category === "break").map((t) => t.key);
}

/** How many rows use each type in this log. */
export async function getCaseTypeUsage(orgId: string): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = await db
    .collection("case_entries")
    .aggregate<{ _id: string; rows: number }>([
      { $match: { orgId } },
      { $group: { _id: "$caseType", rows: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((r) => [r._id, r.rows]));
}

export class CaseTypeError extends Error {}

function cleanLabel(label: string): string {
  const trimmed = label.replace(/\s+/g, " ").trim().slice(0, 40);
  if (!trimmed) throw new CaseTypeError("Give the type a name.");
  return trimmed;
}

async function assertLabelFree(orgId: string, label: string, exceptKey?: string): Promise<void> {
  const types = await getCaseTypes(orgId);
  const clash = types.find(
    (t) => t.key !== exceptKey && t.label.toLowerCase() === label.toLowerCase()
  );
  if (clash) {
    throw new CaseTypeError(
      clash.archived
        ? `"${clash.label}" is an archived type. Restore it instead.`
        : `There is already a type called "${clash.label}".`
    );
  }
}

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "type";
}

export async function createCaseType(
  orgId: string,
  input: { label: string; color: ColorKey; category: CaseCategory }
): Promise<CaseTypeDef> {
  await ensureIndexes();
  const label = cleanLabel(input.label);
  await assertLabelFree(orgId, label);
  const col = await getCaseTypesCollection();
  // A random suffix keeps added keys apart from the built-ins and from each other.
  const key = `${slug(label)}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date();
  const doc: CaseTypeDoc = {
    orgId,
    key,
    label,
    color: input.color,
    category: input.category,
    archived: false,
    deleted: false,
    builtin: false,
    order: now.getTime(),
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(doc);
  return toDef(doc);
}

/** Write a type's full current state, creating the override for a built-in if needed. */
async function writeType(orgId: string, next: CaseTypeDef, flags: { deleted?: boolean } = {}): Promise<void> {
  await ensureIndexes();
  const col = await getCaseTypesCollection();
  const now = new Date();
  await col.updateOne(
    { orgId, key: next.key },
    {
      $set: {
        label: next.label,
        color: next.color,
        category: next.category,
        archived: next.archived,
        builtin: next.builtin,
        deleted: flags.deleted ?? false,
        updatedAt: now,
      },
      $setOnInsert: { orgId, key: next.key, order: 0, createdAt: now },
    },
    { upsert: true }
  );
}

async function findType(orgId: string, key: string): Promise<CaseTypeDef> {
  const t = (await getCaseTypes(orgId)).find((x) => x.key === key);
  if (!t) throw new CaseTypeError("That type no longer exists.");
  return t;
}

export async function updateCaseType(
  orgId: string,
  key: string,
  patch: { label?: string; color?: ColorKey; category?: CaseCategory }
): Promise<CaseTypeDef> {
  const current = await findType(orgId, key);
  const next: CaseTypeDef = { ...current };
  if (patch.label !== undefined) {
    next.label = cleanLabel(patch.label);
    if (next.label.toLowerCase() !== current.label.toLowerCase()) {
      await assertLabelFree(orgId, next.label, key);
    }
  }
  if (patch.color !== undefined) next.color = patch.color;
  if (patch.category !== undefined) next.category = patch.category;
  await writeType(orgId, next);
  return next;
}

/**
 * Remove a type. With no rows using it, it disappears everywhere. With rows
 * using it, it is archived: gone from the pickers, still labelling those rows.
 */
export async function removeCaseType(
  orgId: string,
  key: string
): Promise<{ outcome: "deleted" | "archived"; rows: number }> {
  const current = await findType(orgId, key);
  const rows = (await getCaseTypeUsage(orgId))[key] ?? 0;
  if (rows > 0) {
    await writeType(orgId, { ...current, archived: true });
    return { outcome: "archived", rows };
  }
  await writeType(orgId, current, { deleted: true });
  return { outcome: "deleted", rows: 0 };
}

/** Bring back an archived or removed type. */
export async function restoreCaseType(orgId: string, key: string): Promise<void> {
  await ensureIndexes();
  const col = await getCaseTypesCollection();
  const doc = await col.findOne({ orgId, key });
  if (!doc) throw new CaseTypeError("That type no longer exists.");
  await assertLabelFree(orgId, doc.label, key);
  const res = await col.updateOne(
    { orgId, key },
    { $set: { archived: false, deleted: false, updatedAt: new Date() } }
  );
  if (res.matchedCount === 0) throw new CaseTypeError("That type no longer exists.");
}
