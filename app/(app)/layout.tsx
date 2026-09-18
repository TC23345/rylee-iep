import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { MonthNav } from "@/components/MonthNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireSignedInUser } from "@/lib/authz";
import { todayIso } from "@/lib/dates";
import { getMonthTabs, type MonthTab } from "@/lib/months";
import { listWorkspaceMembers, type WorkspaceMember } from "@/lib/users";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireSignedInUser();

  let months: MonthTab[] = [];
  try {
    months = await getMonthTabs(actor.orgId, todayIso());
  } catch {
    months = [];
  }

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
          <Link href="/" className="flex min-w-0 items-center" aria-label="Case Log home">
            <Image
              src="/brand/acentra-wordmark.png"
              alt="Acentra"
              width={330}
              height={57}
              priority
              className="h-6 w-auto shrink-0"
            />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AccountMenu members={members} selfId={actor.userId} currentId={actor.orgId} />
          </div>
        </div>
        <MonthNav months={months} />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
