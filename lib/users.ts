import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

/** A workspace member as shown in the view-as switcher. */
export interface WorkspaceMember {
  id: string;
  /** "Rylee C." style display name; never the full last name. */
  name: string;
  email: string | null;
  imageUrl: string | null;
}

function displayName(first: string | null, last: string | null, fallback: string): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (f && l) return `${f} ${l[0]}.`;
  return f || l || fallback;
}

/** Every Clerk user in this app, alphabetical by display name. */
export async function listWorkspaceMembers(): Promise<WorkspaceMember[]> {
  const client = await clerkClient();
  const page = await client.users.getUserList({ limit: 100, orderBy: "+first_name" });
  return page.data
    .map((u) => {
      const email =
        u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null;
      return {
        id: u.id,
        name: displayName(u.firstName, u.lastName, email ?? u.id),
        email,
        imageUrl: u.imageUrl ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
