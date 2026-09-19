import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { monthLabel, todayIso, trackedMonths } from "@/lib/dates";

// Months appear automatically, from the first tracked month through the current
// one. This collection holds older additions (months added ahead of time before
// that button was removed) and custom names; a null label means "use the
// default name". Nothing writes to it any more.

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

/** Automatic months (first month through today) plus any added ones, oldest first. */
export async function getMonthTabs(orgId: string, today = todayIso()): Promise<MonthTab[]> {
  const col = await getMonthTabsCollection();
  const stored = await col.find({ orgId }).toArray();
  const labels = new Map(stored.map((d) => [d.ym, d.label]));
  // Future months stay hidden until their 1st, even if one was added early.
  const current = today.slice(0, 7);
  const all = new Set([
    ...trackedMonths(today),
    ...stored.map((d) => d.ym).filter((ym) => ym <= current),
  ]);
  return [...all]
    .sort()
    .map((ym) => ({ ym, label: labels.get(ym) ?? monthLabel(ym) }));
}

export async function getMonthTabLabel(orgId: string, ym: string): Promise<string> {
  const col = await getMonthTabsCollection();
  const doc = await col.findOne({ orgId, ym });
  return doc?.label ?? monthLabel(ym);
}
