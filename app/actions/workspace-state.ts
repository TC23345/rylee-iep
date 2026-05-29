"use server";

import { z } from "zod";
import { requireSignedInUser } from "@/lib/authz";
import { tryWriteAuditEvent } from "@/lib/audit";
import {
  setModuleDeliverableChecked,
  setReadmeChecklistItemChecked,
} from "@/lib/workspace-state";

const checklistUpdateSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("module"),
    moduleNumber: z.number().int().min(1).max(8),
    itemIndex: z.number().int().min(0).max(100),
    checked: z.boolean(),
  }),
  z.object({
    source: z.literal("readme"),
    itemIndex: z.number().int().min(0).max(100),
    checked: z.boolean(),
  }),
]);

const moduleDeliverableUpdateSchema = z.object({
  moduleNumber: z.number().int().min(1).max(8),
  itemIndex: z.number().int().min(0).max(50),
  checked: z.boolean(),
});

export type UpdateWorkspaceStateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateChecklistItemChecked(
  input: z.input<typeof checklistUpdateSchema>
): Promise<UpdateWorkspaceStateResult> {
  const parsed = checklistUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid progress update." };
  }

  try {
    const actor = await requireSignedInUser();
    if (parsed.data.source === "module") {
      await setModuleDeliverableChecked(
        actor,
        parsed.data.moduleNumber,
        parsed.data.itemIndex,
        parsed.data.checked
      );
    } else {
      await setReadmeChecklistItemChecked(actor, parsed.data.itemIndex, parsed.data.checked);
    }

    await tryWriteAuditEvent({
      orgId: actor.orgId,
      userId: actor.userId,
      type:
        parsed.data.source === "module"
          ? "workspace_state.module_deliverable_updated"
          : "workspace_state.readme_checklist_updated",
      metadata: {
        source: parsed.data.source,
        moduleNumber: parsed.data.source === "module" ? parsed.data.moduleNumber : null,
        itemIndex: parsed.data.itemIndex,
        checked: parsed.data.checked,
      },
      createdAt: new Date(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save progress." };
  }
}

export async function updateModuleDeliverableChecked(
  input: z.input<typeof moduleDeliverableUpdateSchema>
): Promise<UpdateWorkspaceStateResult> {
  const parsed = moduleDeliverableUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid progress update." };
  }

  try {
    const actor = await requireSignedInUser();
    await setModuleDeliverableChecked(
      actor,
      parsed.data.moduleNumber,
      parsed.data.itemIndex,
      parsed.data.checked
    );
    await tryWriteAuditEvent({
      orgId: actor.orgId,
      userId: actor.userId,
      type: "workspace_state.module_deliverable_updated",
      metadata: {
        moduleNumber: parsed.data.moduleNumber,
        itemIndex: parsed.data.itemIndex,
        checked: parsed.data.checked,
      },
      createdAt: new Date(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save progress." };
  }
}
