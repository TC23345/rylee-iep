import "server-only";

import { auth } from "@clerk/nextjs/server";

export interface WorkspaceUser {
  userId: string;
  orgId: string;
  orgRole: string | null;
}

function configuredAdminIds(): Set<string> {
  return new Set(
    (process.env.RYLEE_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

export async function requireSignedInUser(): Promise<WorkspaceUser> {
  const session = await auth();
  if (!session.userId) {
    throw new Error("Unauthorized");
  }

  return {
    userId: session.userId,
    orgId: session.orgId ?? session.userId,
    orgRole: session.orgRole ?? null,
  };
}

export async function requireWorkspaceAdmin(): Promise<WorkspaceUser> {
  const user = await requireSignedInUser();
  const adminIds = configuredAdminIds();
  const hasExplicitAdminList = adminIds.size > 0;
  const isOrgAdmin = user.orgRole === "org:admin";
  const isConfiguredAdmin = adminIds.has(user.userId);
  const isSoloWorkspace = !user.orgRole && !hasExplicitAdminList;

  if (isOrgAdmin || isConfiguredAdmin || isSoloWorkspace) {
    return user;
  }

  throw new Error("Forbidden");
}
