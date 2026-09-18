"use client";

import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Eye, Moon, Sun, Undo2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { setViewAs } from "@/app/actions/view-as";
import type { WorkspaceMember } from "@/lib/users";

interface AccountMenuProps {
  /** Other workspace members an admin may view as; empty for everyone else. */
  members: WorkspaceMember[];
  selfId: string;
  /** Whose log is showing right now. */
  currentId: string;
}

/**
 * Clerk's account button. The menu carries the light / dark switch, and for
 * admins the "View as" entries, so both live behind the avatar instead of on
 * the page.
 */
export function AccountMenu({ members, selfId, currentId }: AccountMenuProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const others = members.filter((m) => m.id !== selfId);
  const viewingOther = currentId !== selfId;

  function go(id: string | null) {
    void setViewAs(id).then((res) => {
      if (!res.ok) {
        toast.error(res.error ?? "Could not switch.");
        return;
      }
      router.refresh();
    });
  }

  const actions = [
    <UserButton.Action
      key="theme"
      label={isDark ? "Light mode" : "Dark mode"}
      labelIcon={isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />,
    ...(viewingOther
      ? [
          <UserButton.Action
            key="self"
            label="Back to my log"
            labelIcon={<Undo2 className="size-4" />}
            onClick={() => go(null)}
          />,
        ]
      : []),
    ...others.map((m) => (
      <UserButton.Action
        key={m.id}
        label={currentId === m.id ? `Viewing ${m.name}` : `View as ${m.name}`}
        labelIcon={<Eye className="size-4" />}
        onClick={() => go(currentId === m.id ? null : m.id)}
      />
    )),
  ];

  return (
    <UserButton>
      <UserButton.MenuItems>{actions}</UserButton.MenuItems>
    </UserButton>
  );
}
