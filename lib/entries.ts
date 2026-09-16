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
  /** Rows that count as cases (breaks excluded). */
  count: number;
  /** Minutes across case rows (breaks excluded). */
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

export async function listEntriesForDate(orgId: string, date: string): Promise<CaseEntry[]> {
  const col = await getEntriesCollection();
  const docs = await col
    .find({ orgId, date })
    .sort({ startTime: 1, createdAt: 1 })
    .toArray();
  return docs.map(toEntry);
}

/** Per-day case counts, ascending by date. Omit the range for every day ever logged. */
export async function getDailyCounts(
  orgId: string,
  range?: { from: string; to: string }
): Promise<DailyCount[]> {
  const col = await getEntriesCollection();
  const isCase = { $ne: ["$caseType", "lunch"] };
  const rows = await col
    .aggregate<{ _id: string; count: number; minutes: number }>([
      {
        $match: range
          ? { orgId, date: { $gte: range.from, $lte: range.to } }
          : { orgId },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: { $cond: [isCase, 1, 0] } },
          minutes: { $sum: { $cond: [isCase, { $ifNull: ["$durationMin", 0] }, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return rows.map((r) => ({ date: r._id, count: r.count, minutes: r.minutes }));
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
