import Image from "next/image";
import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { CaseTypesProvider } from "@/components/CaseTypesProvider";
import { BUILTIN_CASE_TYPES, type CaseTypeDef } from "@/lib/case-types";
import { getCaseTypes } from "@/lib/case-types-db";
import { MonthNav } from "@/components/MonthNav";
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
          <AccountMenu members={members} selfId={actor.userId} currentId={actor.orgId} />
        </div>
        <MonthNav months={months} />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <CaseTypesProvider types={caseTypes}>{children}</CaseTypesProvider>
      </main>
    </div>
  );
}
