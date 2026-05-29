import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { WorkspaceUser } from "@/lib/authz";

export interface WorkspaceStateDoc<TValue = unknown> {
  orgId: string;
  userId: string;
  key: string;
  value: TValue;
  createdAt: Date;
  updatedAt: Date;
}

export type ChecklistState = Record<string, boolean>;
export type ModuleDeliverableState = ChecklistState;

async function getWorkspaceStateCollection(): Promise<Collection<WorkspaceStateDoc>> {
  const db = await getDb();
  return db.collection<WorkspaceStateDoc>("workspace_state");
}

let indexesEnsured = false;

export async function ensureWorkspaceStateIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getWorkspaceStateCollection();
  await col.createIndex(
    { orgId: 1, userId: 1, key: 1 },
    { unique: true, name: "org_user_key_unique" }
  );
  await col.createIndex({ orgId: 1, updatedAt: -1 }, { name: "org_updatedAt" });
  indexesEnsured = true;
}

export function moduleDeliverableKey(moduleNumber: number): string {
  return `module:${moduleNumber}:deliverables`;
}

export function readmeChecklistKey(): string {
  return "readme:checklist";
}

export async function getChecklistState(
  actor: WorkspaceUser,
  key: string
): Promise<ChecklistState> {
  const col = await getWorkspaceStateCollection();
  const doc = await col.findOne<WorkspaceStateDoc<ChecklistState>>(
    {
      orgId: actor.orgId,
      userId: actor.userId,
      key,
    },
    { projection: { _id: 0 } }
  );
  return doc?.value ?? {};
}

export async function setChecklistItemChecked(
  actor: WorkspaceUser,
  key: string,
  itemIndex: number,
  checked: boolean
): Promise<void> {
  await ensureWorkspaceStateIndexes();
  const col = await getWorkspaceStateCollection();
  const now = new Date();
  const field = `value.${itemIndex}`;

  await col.updateOne(
    {
      orgId: actor.orgId,
      userId: actor.userId,
      key,
    },
    {
      $set: {
        [field]: checked,
        updatedAt: now,
      },
      $setOnInsert: {
        orgId: actor.orgId,
        userId: actor.userId,
        key,
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export async function getReadmeChecklistState(actor: WorkspaceUser): Promise<ChecklistState> {
  return getChecklistState(actor, readmeChecklistKey());
}

export async function getModuleDeliverableState(
  actor: WorkspaceUser,
  moduleNumber: number
): Promise<ModuleDeliverableState> {
  return getChecklistState(actor, moduleDeliverableKey(moduleNumber));
}

export async function setModuleDeliverableChecked(
  actor: WorkspaceUser,
  moduleNumber: number,
  itemIndex: number,
  checked: boolean
): Promise<void> {
  await setChecklistItemChecked(actor, moduleDeliverableKey(moduleNumber), itemIndex, checked);
}

export async function setReadmeChecklistItemChecked(
  actor: WorkspaceUser,
  itemIndex: number,
  checked: boolean
): Promise<void> {
  await setChecklistItemChecked(actor, readmeChecklistKey(), itemIndex, checked);
}
