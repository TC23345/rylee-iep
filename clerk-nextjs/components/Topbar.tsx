"use client";

import { usePathname } from "next/navigation";
import { getModule } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

function titleFor(pathname: string): string {
  if (pathname === "/") return "PIVOT into IEP Advocacy® — Summer 2026";
  if (pathname.startsWith("/business")) return "Business decisions";
  if (pathname.startsWith("/clients")) return "Client folders";
  if (pathname.startsWith("/artifacts")) return "Artifacts";
  if (pathname.startsWith("/archive")) return "Archive";
  const mod = pathname.match(/^\/module\/(\d+)/);
  if (mod) {
    const m = getModule(Number(mod[1]));
    return m ? `Module ${m.n} — ${m.short}` : `Module ${mod[1]}`;
  }
  const skill = pathname.match(/^\/skill\/([\w-]+)/);
  if (skill) return skill[1];
  return "Workspace";
}

export function Topbar() {
  const pathname = usePathname();
  return (
    <div className="flex flex-1 items-center justify-between gap-3">
      <h1 className="truncate font-serif text-base font-semibold italic text-foreground">
        {titleFor(pathname)}
      </h1>
      <div className="hidden items-center gap-2 sm:flex">
        <Badge className="border-transparent bg-gold/20 text-gold-dim">Pre-cohort</Badge>
        <Badge className="border-transparent bg-secondary/15 text-secondary">Jun 1 Start</Badge>
      </div>
    </div>
  );
}
