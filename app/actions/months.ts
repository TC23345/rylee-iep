"use server";

import { revalidatePath } from "next/cache";
import { requireSignedInUser } from "@/lib/authz";
import { addNextMonthTab, renameMonthTab as renameMonthTabDoc, type MonthTab } from "@/lib/months";
import { tryWriteAuditEvent } from "@/lib/audit";

export type MonthTabResult = { ok: true; tab: MonthTab } | { ok: false; error: string };

/** Adds the month after the latest tab. */
export async function addMonthTab(): Promise<MonthTabResult> {
  let user;
  try {
    user = await requireSignedInUser();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }
  try {
    const tab = await addNextMonthTab(user.orgId);
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "month_tab.added",
      metadata: { ym: tab.ym },
      createdAt: new Date(),
    });
    revalidatePath("/", "layout");
    return { ok: true, tab };
  } catch {
    return { ok: false, error: "Could not add the month. Check the database connection." };
  }
}

export async function renameMonthTab(ym: string, label: string): Promise<MonthTabResult> {
  let user;
  try {
    user = await requireSignedInUser();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }
  try {
    const tab = await renameMonthTabDoc(user.orgId, ym, label);
    await tryWriteAuditEvent({
      orgId: user.orgId,
      userId: user.userId,
      type: "month_tab.renamed",
      metadata: { ym, label: tab.label },
      createdAt: new Date(),
    });
    revalidatePath("/", "layout");
    return { ok: true, tab };
  } catch {
    return { ok: false, error: "Could not rename the month. Check the database connection." };
  }
}
