import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { MonthNav } from "@/components/MonthNav";
import { requireSignedInUser } from "@/lib/authz";
import { trackedMonths } from "@/lib/dates";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSignedInUser();
  const months = trackedMonths();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-lg font-bold leading-tight">
            Rylee&apos;s <span className="text-gold">Case</span> Log
          </Link>
          <UserButton />
        </div>
        <MonthNav months={months} />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
