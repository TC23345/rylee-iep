import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { MonthNav } from "@/components/MonthNav";
import { ViewAsBanner } from "@/components/ViewAsBanner";
import { ViewAsSwitcher } from "@/components/ViewAsSwitcher";
import { requireSignedInUser } from "@/lib/authz";
import { trackedMonths } from "@/lib/dates";
import { listWorkspaceMembers, type WorkspaceMember } from "@/lib/users";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireSignedInUser();
  const months = trackedMonths();

  // Only admins get the switcher; a failed Clerk lookup just hides it.
  let members: WorkspaceMember[] = [];
  if (actor.isAdmin) {
    try {
      members = await listWorkspaceMembers();
    } catch {
      members = [];
    }
  }
  const viewing = actor.viewingAs ? members.find((m) => m.id === actor.viewingAs) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="font-serif text-lg font-bold leading-tight">
            Rylee&apos;s <span className="text-gold">Case</span> Log
          </Link>
          <div className="flex items-center gap-3">
            {actor.isAdmin && members.length > 1 && (
              <ViewAsSwitcher members={members} selfId={actor.userId} currentId={actor.orgId} />
            )}
            <UserButton />
          </div>
        </div>
        <MonthNav months={months} />
        {actor.viewingAs && <ViewAsBanner name={viewing?.name ?? "another user"} />}
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
