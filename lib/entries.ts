import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { CaseType } from "@/lib/entry-schema";

export interface CaseEntryDoc {
  orgId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  caseNumber: string; // digits; empty for breaks
  caseType: CaseType;
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  durationMin: number | null; // derived from start/end at write time
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Serializable shape handed to components. */
export interface CaseEntry {
  id: string;
  date: string;
  caseNumber: string;
  caseType: CaseType;
  startTime: string | null;
  endTime: string | null;
  durationMin: number | null;
  note: string;
}

export interface DailyCount {
  date: string;
  /** Rows that count as cases (lunch and rows without a case number excluded). */
  count: number;
  /** Minutes across case rows. */
  minutes: number;
}

/** Rows and minutes per case type across a range; every row counts, breaks included. */
export interface TypeMixRow {
  caseType: CaseType;
  rows: number;
  minutes: number;
}

export type EntryPatch = Omit<CaseEntryDoc, "orgId" | "userId" | "createdAt" | "updatedAt">;

async function getEntriesCollection(): Promise<Collection<CaseEntryDoc>> {
  const db = await getDb();
  return db.collection<CaseEntryDoc>("case_entries");
}

let indexesEnsured = false;

async function ensureEntryIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getEntriesCollection();
  await col.createIndex({ orgId: 1, date: 1, startTime: 1 }, { name: "org_date_start" });
  indexesEnsured = true;
}

function toEntry(doc: WithId<CaseEntryDoc>): CaseEntry {
  return {
    id: doc._id.toHexString(),
    date: doc.date,
    caseNumber: doc.caseNumber,
    caseType: doc.caseType,
    startTime: doc.startTime,
    endTime: doc.endTime,
    durationMin: doc.durationMin,
    note: doc.note,
  };
}

function parseId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Mirrors countsAsCase() in entry-schema.ts for the aggregation pipeline.
const IS_CASE = {
  $and: [{ $ne: ["$caseType", "lunch"] }, { $ne: [{ $ifNull: ["$caseNumber", ""] }, ""] }],
};

function rangeMatch(orgId: string, range?: { from: string; to: string }) {
  return range ? { orgId, date: { $gte: range.from, $lte: range.to } } : { orgId };
}

export async function listEntriesForDate(orgId: string, date: string): Promise<CaseEntry[]> {
  const col = await getEntriesCollection();
  const docs = await col
    .find({ orgId, date })
    .sort({ startTime: 1, createdAt: 1 })
    .toArray();
  return docs.map(toEntry);
}

/** Every row in a date range, in the order the day unfolded. */
export async function listEntriesForRange(
  orgId: string,
  range: { from: string; to: string }
): Promise<CaseEntry[]> {
  const col = await getEntriesCollection();
  const docs = await col
    .find(rangeMatch(orgId, range))
    .sort({ date: 1, startTime: 1, createdAt: 1 })
    .toArray();
  return docs.map(toEntry);
}

/** Per-day case counts, ascending by date. Omit the range for every day ever logged. */
export async function getDailyCounts(
  orgId: string,
  range?: { from: string; to: string }
): Promise<DailyCount[]> {
  const col = await getEntriesCollection();
  const rows = await col
    .aggregate<{ _id: string; count: number; minutes: number }>([
      { $match: rangeMatch(orgId, range) },
      {
        $group: {
          _id: "$date",
          count: { $sum: { $cond: [IS_CASE, 1, 0] } },
          minutes: { $sum: { $cond: [IS_CASE, { $ifNull: ["$durationMin", 0] }, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return rows.map((r) => ({ date: r._id, count: r.count, minutes: r.minutes }));
}

/** Rows and minutes by case type across a range, most minutes first. */
export async function getTypeMix(
  orgId: string,
  range?: { from: string; to: string }
): Promise<TypeMixRow[]> {
  const col = await getEntriesCollection();
  const rows = await col
    .aggregate<{ _id: CaseType; rows: number; minutes: number }>([
      { $match: rangeMatch(orgId, range) },
      {
        $group: {
          _id: "$caseType",
          rows: { $sum: 1 },
          minutes: { $sum: { $ifNull: ["$durationMin", 0] } },
        },
      },
      { $sort: { minutes: -1, rows: -1 } },
    ])
    .toArray();
  return rows.map((r) => ({ caseType: r._id, rows: r.rows, minutes: r.minutes }));
}

export async function insertEntry(
  orgId: string,
  userId: string,
  patch: EntryPatch
): Promise<string> {
  await ensureEntryIndexes();
  const col = await getEntriesCollection();
  const now = new Date();
  const res = await col.insertOne({
    ...patch,
    orgId,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return res.insertedId.toHexString();
}

/**
 * Insert many rows, skipping any that already exist for the same day, case
 * number and start time. Lets a spreadsheet be imported more than once.
 */
export async function insertEntries(
  orgId: string,
  userId: string,
  patches: EntryPatch[]
): Promise<{ inserted: number; skipped: number }> {
  if (patches.length === 0) return { inserted: 0, skipped: 0 };
  await ensureEntryIndexes();
  const col = await getEntriesCollection();

  const dates = [...new Set(patches.map((p) => p.date))];
  const existing = await col
    .find({ orgId, date: { $in: dates } }, { projection: { date: 1, caseNumber: 1, startTime: 1 } })
    .toArray();
  const key = (p: { date: string; caseNumber: string; startTime: string | null }) =>
    `${p.date}|${p.caseNumber}|${p.startTime ?? ""}`;
  const seen = new Set(existing.map(key));

  const now = new Date();
  const docs: CaseEntryDoc[] = [];
  for (const p of patches) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    docs.push({ ...p, orgId, userId, createdAt: now, updatedAt: now });
  }
  if (docs.length) await col.insertMany(docs, { ordered: false });
  return { inserted: docs.length, skipped: patches.length - docs.length };
}

export async function updateEntry(
  orgId: string,
  id: string,
  patch: EntryPatch
): Promise<boolean> {
  const _id = parseId(id);
  if (!_id) return false;
  const col = await getEntriesCollection();
  const res = await col.updateOne({ _id, orgId }, { $set: { ...patch, updatedAt: new Date() } });
  return res.matchedCount === 1;
}

export async function deleteEntry(orgId: string, id: string): Promise<boolean> {
  const _id = parseId(id);
  if (!_id) return false;
  const col = await getEntriesCollection();
  const res = await col.deleteOne({ _id, orgId });
  return res.deletedCount === 1;
}
