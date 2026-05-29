import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ClientStatus } from "@/lib/client-schema";

// V1 is intentionally metadata-only. Full intake persistence requires a later
// encryption, consent, and retention pass.

export interface ClientIndexDoc {
  orgId: string;
  clientId: string;
  clientDisplayName: string;
  districtAbbr: string;
  status: ClientStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

export async function getClientIndexCollection(): Promise<Collection<ClientIndexDoc>> {
  const db = await getDb();
  return db.collection<ClientIndexDoc>("client_index");
}

let indexesEnsured = false;

export async function ensureClientIndexIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getClientIndexCollection();
  await col.createIndex(
    { orgId: 1, clientId: 1 },
    { unique: true, name: "org_clientId_unique" }
  );
  await col.createIndex(
    { orgId: 1, status: 1, updatedAt: -1 },
    { name: "org_status_updatedAt" }
  );
  indexesEnsured = true;
}

export async function getClientIndex(orgId: string): Promise<ClientIndexDoc[]> {
  const col = await getClientIndexCollection();
  return col
    .find({ orgId })
    .project<ClientIndexDoc>({ _id: 0 })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function insertClientIndex(doc: ClientIndexDoc): Promise<void> {
  await ensureClientIndexIndexes();
  const col = await getClientIndexCollection();
  await col.insertOne(doc);
}
