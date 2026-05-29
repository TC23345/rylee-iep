import "server-only";

import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";

type AuditMetadata = Record<string, string | number | boolean | null>;

export interface AuditEventDoc {
  orgId: string;
  userId: string;
  type: string;
  metadata: AuditMetadata;
  createdAt: Date;
}

async function getAuditCollection(): Promise<Collection<AuditEventDoc>> {
  const db = await getDb();
  return db.collection<AuditEventDoc>("audit_events");
}

let indexesEnsured = false;

async function ensureAuditIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const col = await getAuditCollection();
  await col.createIndex({ orgId: 1, createdAt: -1 }, { name: "org_createdAt" });
  await col.createIndex({ orgId: 1, type: 1, createdAt: -1 }, { name: "org_type_createdAt" });
  indexesEnsured = true;
}

export async function writeAuditEvent(event: AuditEventDoc): Promise<void> {
  await ensureAuditIndexes();
  const col = await getAuditCollection();
  await col.insertOne(event);
}

export async function tryWriteAuditEvent(event: AuditEventDoc): Promise<void> {
  try {
    await writeAuditEvent(event);
  } catch {
    // Audit failures should not expose database details or break completed mutations.
  }
}
