import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { CaseTypesProvider } from "@/components/CaseTypesProvider";
import { BUILTIN_CASE_TYPES, type CaseTypeDef } from "@/lib/case-types";
import { getCaseTypes } from "@/lib/case-types-db";
import { MonthNav } from "@/components/MonthNav";
import { requireSignedInUser } from "@/lib/authz";
import { TimeZoneCookie } from "@/components/TimeZoneCookie";
import { getMonthTabs, type MonthTab } from "@/lib/months";
import { timeZoneCookie, userToday } from "@/lib/timezone";
import { listWorkspaceMembers, type WorkspaceMember } from "@/lib/users";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireSignedInUser();

  let months: MonthTab[] = [];
  try {
    months = await getMonthTabs(actor.orgId, await userToday());
  } catch {
    months = [];
  }

  // The viewed log's case types; a failed lookup falls back to the built-ins.
  let caseTypes: CaseTypeDef[] = BUILTIN_CASE_TYPES;
  try {
    caseTypes = await getCaseTypes(actor.orgId);
  } catch {
    caseTypes = BUILTIN_CASE_TYPES;
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
      <TimeZoneCookie current={await timeZoneCookie()} />
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur">
        {/* One line: wordmark, the tabs, then the avatar pushed to the right. */}
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Case Log home">
            <Image
              src="/brand/acentra-wordmark.png"
              alt="Acentra"
              width={330}
              height={57}
              priority
              className="h-5 w-auto sm:h-6"
            />
          </Link>
          <MonthNav months={months} />
          <div className="ml-auto flex shrink-0 items-center">
            <AccountMenu members={members} selfId={actor.userId} currentId={actor.orgId} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <CaseTypesProvider types={caseTypes}>{children}</CaseTypesProvider>
      </main>
    </div>
  );
}
