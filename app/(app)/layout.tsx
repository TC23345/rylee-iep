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
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Case Log home">
            <span className="inline-flex shrink-0 items-center rounded-md bg-ink px-2 py-1">
              <Image
                src="/brand/acentra-logo.webp"
                alt="Acentra Health"
                width={330}
                height={94}
                priority
                className="h-5 w-auto"
              />
            </span>
            <span aria-hidden className="h-6 w-px bg-border" />
            <span className="truncate font-serif text-lg font-bold leading-tight">Case Log</span>
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
