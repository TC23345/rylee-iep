"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { monthLabel } from "@/lib/dates";

/** Tab strip that mirrors the workbook's sheet tabs. */
export function MonthNav({ months }: { months: string[] }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Daily Case Counts", active: pathname === "/" },
    ...months.map((ym) => ({
      href: `/month/${ym}`,
      label: monthLabel(ym),
      active: pathname === `/month/${ym}`,
    })),
  ];

  return (
    <nav aria-label="Sheets" className="overflow-x-auto">
      <ul className="mx-auto flex max-w-5xl gap-1 px-4">
        {tabs.map((t) => (
          <li key={t.href} className="shrink-0">
            <Link
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={`inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                t.active
                  ? "border-gold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
