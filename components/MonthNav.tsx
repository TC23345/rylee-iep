"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Check, ChevronDown, ClipboardList } from "lucide-react";

import type { MonthTab } from "@/lib/months";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tabs fill the header's height so the active underline sits on its bottom edge.
const TAB =
  "inline-flex h-full items-center gap-1.5 border-b-2 px-2.5 text-sm font-medium transition-colors sm:px-3";
/** Labels hide on phones, where the icons carry the tabs (names stay for screen readers). */
const LABEL = "sr-only sm:not-sr-only";
const ACTIVE = "border-brand text-foreground";
const IDLE = "border-transparent text-muted-foreground hover:text-foreground";

/**
 * Case Tracker (first), Calendar and Case Counts. Case Tracker's menu lists the month sheets
 * newest first. Months appear on their own: the list runs from the first
 * tracked month through the current one, so a new month shows up on its 1st.
 */
export function MonthNav({ months }: { months: MonthTab[] }) {
  const pathname = usePathname();
  const currentYm = pathname.startsWith("/month/") ? pathname.slice("/month/".length, "/month/".length + 7) : null;
  const newestFirst = [...months].reverse();

  return (
    <nav aria-label="Sheets" className="min-w-0 self-stretch overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <ul className="flex h-full items-stretch gap-0.5 sm:gap-1">
        <li className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              title="Case Tracker"
              className={cn(
                TAB,
                "group/tracker outline-none focus-visible:text-foreground",
                currentYm ? ACTIVE : IDLE
              )}
            >
              <ClipboardList className="size-4" aria-hidden />
              <span className={LABEL}>Case Tracker</span>
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
        <li className="shrink-0">
          <Link
            href="/calendar"
            title="Calendar"
            aria-current={pathname === "/calendar" ? "page" : undefined}
            className={cn(TAB, pathname === "/calendar" ? ACTIVE : IDLE)}
          >
            <CalendarDays className="size-4" aria-hidden />
            <span className={LABEL}>Calendar</span>
          </Link>
        </li>
        <li className="shrink-0">
          <Link
            href="/counts"
            title="Case Counts"
            aria-current={pathname === "/counts" ? "page" : undefined}
            className={cn(TAB, pathname === "/counts" ? ACTIVE : IDLE)}
          >
            <BarChart3 className="size-4" aria-hidden />
            <span className={LABEL}>Case Counts</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
