"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export const HOLD_MS = 1500;

/**
 * Press and hold for 1.5 s to delete; letting go early cancels, and a red fill
 * shows the progress. Keyboard users delete with Enter or Space. There is no
 * confirm dialog: callers announce the deletion in a toast with an Undo.
 */
export function HoldToDeleteButton({
  label,
  onHold,
  disabled = false,
  className,
}: {
  /** Accessible name, e.g. "Hold to delete case 262433772". */
  label: string;
  onHold: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancel() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setHolding(false);
  }

  function begin() {
    if (disabled || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onHold();
    }, HOLD_MS);
  }

  return (
    <button
      type="button"
      aria-label={label}
      title="Hold 1.5 s to delete"
      disabled={disabled}
      onPointerDown={(e) => {
        if (e.button === 0) begin();
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onHold();
        }
      }}
      className={cn(
        "relative inline-flex size-7 shrink-0 touch-none select-none items-center justify-center overflow-hidden rounded-md text-muted-foreground transition-opacity hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50",
        className
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-destructive/25 transition-[width] ease-linear"
        style={{ width: holding ? "100%" : 0, transitionDuration: holding ? `${HOLD_MS}ms` : "150ms" }}
      />
      <Trash2 className="relative size-4" />
    </button>
  );
}
