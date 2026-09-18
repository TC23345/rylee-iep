"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";

import { addMonthTab, renameMonthTab } from "@/app/actions/months";
import type { MonthTab } from "@/lib/months";
import { cn } from "@/lib/utils";

const TAB =
  "inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition-colors";
const ACTIVE = "border-brand text-foreground";
const IDLE = "border-transparent text-muted-foreground hover:text-foreground";

/**
 * Tab strip that mirrors the workbook's sheet tabs. Double-click a month to
 * rename it (Enter or clicking away saves, Escape cancels); "+" adds the next
 * month after the last tab.
 */
export function MonthNav({ months }: { months: MonthTab[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function startEdit(tab: MonthTab) {
    setEditing(tab.ym);
    setDraft(tab.label);
  }

  function save(tab: MonthTab) {
    const ym = editing;
    setEditing(null);
    if (!ym || draft.trim() === tab.label) return;
    startTransition(async () => {
      const res = await renameMonthTab(ym, draft);
      if (!res.ok) toast.error(res.error);
      router.refresh();
    });
  }

  function add() {
    startTransition(async () => {
      const res = await addMonthTab();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      router.push(`/month/${res.tab.ym}`);
      router.refresh();
    });
  }

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
        {months.map((tab) => {
          const href = `/month/${tab.ym}`;
          const active = pathname === href;
          if (editing === tab.ym) {
            return (
              <li key={tab.ym} className="shrink-0">
                <input
                  autoFocus
                  value={draft}
                  aria-label={`Rename ${tab.label}`}
                  maxLength={40}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => save(tab)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") {
                      setDraft(tab.label);
                      setEditing(null);
                    }
                  }}
                  className={cn(
                    TAB,
                    ACTIVE,
                    "w-36 bg-transparent outline-none focus:bg-card"
                  )}
                />
              </li>
            );
          }
          return (
            <li key={tab.ym} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title="Double-click to rename"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  startEdit(tab);
                }}
                className={cn(TAB, active ? ACTIVE : IDLE)}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <button
            type="button"
            aria-label="Add the next month"
            title="Add the next month"
            disabled={pending}
            onClick={add}
            className="ml-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Plus className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
