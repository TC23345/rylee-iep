"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceAdmin } from "@/lib/authz";
import {
  clientIndexInputSchema,
  deriveClientId,
  deriveDisplayName,
  type ClientIndexInput,
} from "@/lib/client-schema";
import {
  insertClientIndex,
  type ClientIndexDoc,
} from "@/lib/clients";
import { tryWriteAuditEvent } from "@/lib/audit";

export type CreateClientResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string; field?: string };

export async function createClient(values: ClientIndexInput): Promise<CreateClientResult> {
  let actor;
  try {
    actor = await requireWorkspaceAdmin();
  } catch {
    return { ok: false, error: "You do not have permission to add clients." };
  }

  const parsed = clientIndexInputSchema.safeParse(values);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid input.",
      field: first?.path.join("."),
    };
  }

  const v = parsed.data;
  // Re-derive ids server-side — never trust client-sent ids.
  const clientId = deriveClientId(v.firstName, v.lastInitial, v.districtAbbr);
  const clientDisplayName = deriveDisplayName(v.firstName, v.lastInitial);
  const now = new Date();

  const doc: ClientIndexDoc = {
    orgId: actor.orgId,
    clientId,
    clientDisplayName,
    districtAbbr: v.districtAbbr.toUpperCase(),
    status: v.status,
    createdBy: actor.userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await insertClientIndex(doc);
    await tryWriteAuditEvent({
      orgId: actor.orgId,
      userId: actor.userId,
      type: "client_index.created",
      metadata: {
        clientId,
        districtAbbr: doc.districtAbbr,
        status: doc.status,
      },
      createdAt: now,
    });
  } catch (err: unknown) {
    // Duplicate clientId → unique index violation.
    if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
      return {
        ok: false,
        error: `A client with id "${clientId}" already exists.`,
        field: "districtAbbr",
      };
    }
    return { ok: false, error: "Could not save client. Check the database connection." };
  }

  revalidatePath("/clients");
  return { ok: true, clientId };
}
