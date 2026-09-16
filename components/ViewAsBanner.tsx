"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";

import { setViewAs } from "@/app/actions/view-as";
import { Button } from "@/components/ui/button";

/** Reminds an admin that the log on screen belongs to someone else. */
export function ViewAsBanner({ name }: { name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-b border-gold/40 bg-gold/15">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-sm">
        <span className="flex items-center gap-2">
          <Eye className="size-4 text-gold-dim" />
          <span>
            You are viewing <strong>{name}</strong>&rsquo;s log. Rows you add or change go to
            their log.
          </span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setViewAs(null);
              router.refresh();
            })
          }
        >
          Back to my view
        </Button>
      </div>
    </div>
  );
}
