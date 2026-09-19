"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Check, ChevronDown } from "lucide-react";

import type { MonthTab } from "@/lib/months";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TAB =
  "inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition-colors";
const ACTIVE = "border-brand text-foreground";
const IDLE = "border-transparent text-muted-foreground hover:text-foreground";

/**
 * Calendar, Case Counts, and Case Tracker, whose menu lists the month sheets
 * newest first. Months appear on their own: the list runs from the first
 * tracked month through the current one, so a new month shows up on its 1st.
 */
export function MonthNav({ months }: { months: MonthTab[] }) {
  const pathname = usePathname();
  const currentYm = pathname.startsWith("/month/") ? pathname.slice("/month/".length, "/month/".length + 7) : null;
  const newestFirst = [...months].reverse();

  return (
    <nav aria-label="Sheets" className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <ul className="mx-auto flex max-w-5xl items-center gap-1 px-4">
        <li className="shrink-0">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(TAB, "inline-flex items-center gap-1.5", pathname === "/" ? ACTIVE : IDLE)}
          >
            <CalendarDays className="size-4" aria-hidden />
            Calendar
          </Link>
        </li>
        <li className="shrink-0">
          <Link
            href="/counts"
            aria-current={pathname === "/counts" ? "page" : undefined}
            className={cn(TAB, pathname === "/counts" ? ACTIVE : IDLE)}
          >
            Case Counts
          </Link>
        </li>
        <li className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                TAB,
                "group/tracker inline-flex items-center gap-1 outline-none focus-visible:text-foreground",
                currentYm ? ACTIVE : IDLE
              )}
            >
              Case Tracker
              <ChevronDown
                className="size-3.5 opacity-60 transition-transform group-data-[state=open]/tracker:rotate-180"
                aria-hidden
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              {newestFirst.map((tab) => {
                const active = tab.ym === currentYm;
                return (
                  <DropdownMenuItem key={tab.ym} asChild>
                    <Link
                      href={`/month/${tab.ym}`}
                      aria-current={active ? "page" : undefined}
                      className={cn("justify-between", active && "font-medium")}
                    >
                      {tab.label}
                      {active && <Check className="size-4 text-brand" aria-hidden />}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}
