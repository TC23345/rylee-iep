import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { MonthNav } from "@/components/MonthNav";
import { requireSignedInUser } from "@/lib/authz";
import { trackedMonths } from "@/lib/dates";
import { listWorkspaceMembers, type WorkspaceMember } from "@/lib/users";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireSignedInUser();
  const months = trackedMonths();

  // Only admins get "View as" entries; a failed Clerk lookup just hides them.
  let members: WorkspaceMember[] = [];
  if (actor.isAdmin) {
    try {
      members = await listWorkspaceMembers();
    } catch {
      members = [];
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="font-serif text-lg font-bold leading-tight">
            Rylee&apos;s <span className="text-gold">Case</span> Log
          </Link>
          <AccountMenu members={members} selfId={actor.userId} currentId={actor.orgId} />
        </div>
        <MonthNav months={months} />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
