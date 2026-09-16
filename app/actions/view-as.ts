"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireWorkspaceAdmin, VIEW_AS_COOKIE } from "@/lib/authz";
import { tryWriteAuditEvent } from "@/lib/audit";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Admin only: browse the log as `userId`, or pass null to return to your own. */
export async function setViewAs(userId: string | null): Promise<{ ok: boolean; error?: string }> {
  let admin;
  try {
    admin = await requireWorkspaceAdmin();
  } catch {
    return { ok: false, error: "Only an admin can switch views." };
  }

  const jar = await cookies();
  if (!userId || userId === admin.userId) {
    jar.delete(VIEW_AS_COOKIE);
  } else {
    if (!/^user_[A-Za-z0-9]+$/.test(userId)) return { ok: false, error: "Unknown user." };
    jar.set(VIEW_AS_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }

  await tryWriteAuditEvent({
    orgId: admin.userId,
    userId: admin.userId,
    type: "view_as.changed",
    metadata: { target: userId ?? null },
    createdAt: new Date(),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
