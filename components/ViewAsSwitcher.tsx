"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye } from "lucide-react";
import { toast } from "sonner";

import { setViewAs } from "@/app/actions/view-as";
import type { WorkspaceMember } from "@/lib/users";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ViewAsSwitcherProps {
  members: WorkspaceMember[];
  /** The signed-in admin. */
  selfId: string;
  /** Whose log is showing right now. */
  currentId: string;
}

/** Admin control: pick whose log the whole app shows. */
export function ViewAsSwitcher({ members, selfId, currentId }: ViewAsSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = members.find((m) => m.id === currentId);
  const viewingOther = currentId !== selfId;

  function choose(id: string) {
    if (id === currentId) return;
    startTransition(async () => {
      const res = await setViewAs(id === selfId ? null : id);
      if (!res.ok) {
        toast.error(res.error ?? "Could not switch.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={viewingOther ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5"
          disabled={pending}
          aria-label="Choose whose log to view"
        >
          <Eye className="size-4" />
          <span className="hidden sm:inline">{viewingOther ? "Viewing as" : "View as"}</span>
          <span className="font-medium">{viewingOther ? (current?.name ?? "someone") : "me"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Show the log of</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {members.map((m) => {
          const active = m.id === currentId;
          return (
            <DropdownMenuItem key={m.id} onClick={() => choose(m.id)} className="gap-2">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">
                  {m.name}
                  {m.id === selfId && <span className="ml-1 text-muted-foreground">(you)</span>}
                </span>
                {m.email && (
                  <span className="truncate text-xs text-muted-foreground">{m.email}</span>
                )}
              </span>
              <Check className={cn("size-4", active ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
