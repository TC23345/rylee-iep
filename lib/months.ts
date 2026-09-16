import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { addMonths, isIsoMonth, monthLabel, todayIso, trackedMonths } from "@/lib/dates";

// Month tabs beyond the automatic range, and custom tab names. One document
// per (org, month); a null label means "use the default name".

interface MonthTabDoc {
  orgId: string;
  ym: string;
  label: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthTab {
  ym: string;
  label: string;
}

async function getMonthTabsCollection(): Promise<Collection<MonthTabDoc>> {
  const db = await getDb();
  return db.collection<MonthTabDoc>("month_tabs");
}

let indexesEnsured = false;

async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getMonthTabsCollection();
  await col.createIndex({ orgId: 1, ym: 1 }, { name: "org_ym", unique: true });
  indexesEnsured = true;
}

/** Automatic months (first month through today) plus any added ones, oldest first. */
export async function getMonthTabs(orgId: string, today = todayIso()): Promise<MonthTab[]> {
  const col = await getMonthTabsCollection();
  const stored = await col.find({ orgId }).toArray();
  const labels = new Map(stored.map((d) => [d.ym, d.label]));
  const all = new Set([...trackedMonths(today), ...stored.map((d) => d.ym)]);
  return [...all]
    .sort()
    .map((ym) => ({ ym, label: labels.get(ym) ?? monthLabel(ym) }));
}

export async function getMonthTabLabel(orgId: string, ym: string): Promise<string> {
  const col = await getMonthTabsCollection();
  const doc = await col.findOne({ orgId, ym });
  return doc?.label ?? monthLabel(ym);
}

/** Add the month after the latest tab and return it. */
export async function addNextMonthTab(orgId: string): Promise<MonthTab> {
  await ensureIndexes();
  const tabs = await getMonthTabs(orgId);
  const last = tabs.at(-1)?.ym ?? todayIso().slice(0, 7);
  const ym = addMonths(last, 1);
  const col = await getMonthTabsCollection();
  const now = new Date();
  await col.updateOne(
    { orgId, ym },
    { $setOnInsert: { orgId, ym, label: null, createdAt: now }, $set: { updatedAt: now } },
    { upsert: true }
  );
  return { ym, label: monthLabel(ym) };
}

/** Rename a tab. An empty name, or the default name, clears the override. */
export async function renameMonthTab(orgId: string, ym: string, label: string): Promise<MonthTab> {
  if (!isIsoMonth(ym)) throw new Error("Bad month");
  await ensureIndexes();
  const trimmed = label.trim().slice(0, 40);
  const stored = trimmed && trimmed !== monthLabel(ym) ? trimmed : null;
  const col = await getMonthTabsCollection();
  const now = new Date();
  await col.updateOne(
    { orgId, ym },
    { $setOnInsert: { orgId, ym, createdAt: now }, $set: { label: stored, updatedAt: now } },
    { upsert: true }
  );
  return { ym, label: stored ?? monthLabel(ym) };
}
