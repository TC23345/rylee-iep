import "server-only";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/** Cookie an admin sets to browse the log as another user. */
export const VIEW_AS_COOKIE = "case_log_view_as";

export interface WorkspaceUser {
  /** The signed-in Clerk user. */
  userId: string;
  /** Whose rows are read and written. Normally the user's own id. */
  orgId: string;
  orgRole: string | null;
  isAdmin: boolean;
  /** Set when an admin is viewing someone else's log. */
  viewingAs: string | null;
}

function configuredAdminIds(): Set<string> {
  return new Set(
    (process.env.RYLEE_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

function isAdmin(userId: string, orgRole: string | null): boolean {
  const adminIds = configuredAdminIds();
  const hasExplicitAdminList = adminIds.size > 0;
  const isOrgAdmin = orgRole === "org:admin";
  const isConfiguredAdmin = adminIds.has(userId);
  const isSoloWorkspace = !orgRole && !hasExplicitAdminList;
  return isOrgAdmin || isConfiguredAdmin || isSoloWorkspace;
}

/**
 * The signed-in user plus the data scope to use. An admin with the view-as
 * cookie set reads and writes another user's log; everyone else gets their own.
 */
export async function requireSignedInUser(): Promise<WorkspaceUser> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId;
  const orgRole = session.orgRole ?? null;
  const ownScope = session.orgId ?? userId;
  const admin = isAdmin(userId, orgRole);

  let viewingAs: string | null = null;
  if (admin) {
    const jar = await cookies();
    const target = jar.get(VIEW_AS_COOKIE)?.value?.trim();
    if (target && target !== userId) viewingAs = target;
  }

  return {
    userId,
    orgId: viewingAs ?? ownScope,
    orgRole,
    isAdmin: admin,
    viewingAs,
  };
}

export async function requireWorkspaceAdmin(): Promise<WorkspaceUser> {
  const user = await requireSignedInUser();
  if (!user.isAdmin) throw new Error("Forbidden");
  return user;
}
