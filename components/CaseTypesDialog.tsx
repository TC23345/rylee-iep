"use client";

import { useEffect, useState, useTransition } from "react";
import { GripVertical, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import {
  createCaseType,
  getCaseTypeUsage,
  removeCaseType,
  restoreCaseType,
  updateCaseType,
} from "@/app/actions/case-types";
import {
  CATEGORIES,
  COLOR_KEYS,
  PALETTE,
  type CaseCategory,
  type CaseTypeDef,
  type ColorKey,
} from "@/lib/case-types";
import { cn } from "@/lib/utils";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import { HoldToDeleteButton } from "@/components/HoldToDeleteButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

type Usage = Record<string, number>;

function Swatch({ color, className }: { color: ColorKey; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-3 shrink-0 rounded-full", PALETTE[color].bar, className)} />;
}

function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: ColorKey;
  onChange: (c: ColorKey) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ColorKey)} disabled={disabled}>
      <SelectTrigger size="sm" aria-label="Colour" title="Colour" className="w-auto px-2 [&_svg]:opacity-50">
        <Swatch color={value} />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {COLOR_KEYS.map((c) => (
          <SelectItem key={c} value={c}>
            <Swatch color={c} />
            {PALETTE[c].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CategoryPicker({
  value,
  onChange,
  disabled,
}: {
  value: CaseCategory;
  onChange: (c: CaseCategory) => void;
  disabled?: boolean;
}) {
  const current = CATEGORIES.find((c) => c.value === value);
  return (
    <Select value={value} onValueChange={(v) => onChange(v as CaseCategory)} disabled={disabled}>
      <SelectTrigger size="sm" aria-label="Category" className="w-32 shrink-0 text-xs">
        {current?.label}
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {CATEGORIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <span className="flex flex-col">
              <span>{c.label}</span>
              <span className="text-xs text-muted-foreground">{c.hint}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function rowsText(n: number | undefined): string {
  if (n === undefined) return "";
  return `${n} ${n === 1 ? "row" : "rows"}`;
}

/** dataTransfer type for a dragged case type row. */
const DRAG_TYPE = "application/x-case-type";

/**
 * One editable type: grip, colour, name (saves on blur or Enter) and remove,
 * which shows on hover. Drag the row (anywhere but the name box or colour) into
 * another section to change its category. Keyed on the stored label by its
 * parent, so a saved rename resets it.
 */
function TypeRow({ type, rows, onRemoved }: { type: CaseTypeDef; rows?: number; onRemoved: () => void }) {
  const [label, setLabel] = useState(type.label);
  const [pending, startTransition] = useTransition();
  // Only arm dragging when the press starts outside the inputs, so typing and
  // selecting text in the name box still work.
  const [armed, setArmed] = useState(false);
  const [dragging, setDragging] = useState(false);

  function save(patch: { label?: string; color?: ColorKey; category?: CaseCategory }) {
    startTransition(async () => {
      const res = await updateCaseType(type.key, patch);
      if (!res.ok) {
        toast.error(res.error);
        setLabel(type.label);
      }
    });
  }

  function commitLabel() {
    const next = label.trim();
    if (!next || next === type.label) {
      setLabel(type.label);
      return;
    }
    save({ label: next });
  }

  function remove() {
    startTransition(async () => {
      const res = await removeCaseType(type.key);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onRemoved();
      toast(res.outcome === "archived" ? `${type.label} archived` : `${type.label} removed`, {
        description:
          res.outcome === "archived"
            ? `${rowsText(res.rows)} still use it and keep its label. It is hidden from the pickers.`
            : "No rows used it.",
        duration: 8000,
        action: {
          label: "Undo",
          onClick: () => {
            void restoreCaseType(type.key).then((r) => {
              if (r.ok) toast.success(`${type.label} restored.`);
              else toast.error(r.error);
            });
          },
        },
      });
    });
  }

  return (
    <li
      draggable={armed}
      onPointerDown={(e) => setArmed(!(e.target as HTMLElement).closest("input, button"))}
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_TYPE, type.key);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
        setArmed(false);
      }}
      className={cn(
        "group flex items-center gap-2 rounded-md py-1.5 pr-1",
        armed && "cursor-grabbing",
        dragging && "opacity-40",
        pending && "opacity-60"
      )}
    >
      <GripVertical
        aria-hidden
        className="size-4 shrink-0 cursor-grab text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
      />
      <ColorPicker value={type.color} onChange={(color) => save({ color })} disabled={pending} />
      <Input
        value={label}
        aria-label={`Name of ${type.label}`}
        maxLength={40}
        className="h-7 min-w-0 flex-1"
        onChange={(e) => setLabel(e.target.value)}
        onBlur={commitLabel}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setLabel(type.label);
            e.currentTarget.blur();
          }
        }}
      />
      <HoldToDeleteButton
        label={
          rows
            ? `Hold to archive ${type.label} (${rowsText(rows)} keep it)`
            : `Hold to remove ${type.label}`
        }
        onHold={remove}
        disabled={pending}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      />
    </li>
  );
}

/**
 * A full-width "Add New Case Type" button that turns into the add row: colour,
 * name, category and Add. Escape or the X folds it back; a successful add does too.
 */
function AddTypeForm({ usedColors }: { usedColors: Set<ColorKey> }) {
  const firstFree = COLOR_KEYS.find((c) => !usedColors.has(c)) ?? COLOR_KEYS[0];
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState<ColorKey | null>(null);
  const [category, setCategory] = useState<CaseCategory>("case");
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setLabel("");
    setColor(null);
    setCategory("case");
  }

  function add() {
    const name = label.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await createCaseType({ label: name, color: color ?? firstFree, category });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${name} added.`);
      close();
    });
  }

  if (!open) {
    return (
      <div className="border-t border-border pt-3">
        <Button type="button" className="btn-primary btn-soft w-full gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add New Case Type
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2 border-t border-border pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <ColorPicker value={color ?? firstFree} onChange={setColor} disabled={pending} />
      <Input
        autoFocus
        value={label}
        placeholder="New type"
        aria-label="New type name"
        maxLength={40}
        className="h-7 min-w-0 flex-1"
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            // Fold the row back instead of closing the whole dialog.
            e.preventDefault();
            e.stopPropagation();
            close();
          }
        }}
      />
      <CategoryPicker value={category} onChange={setCategory} disabled={pending} />
      <Button type="submit" size="sm" className="btn-primary btn-soft gap-1" disabled={pending || !label.trim()}>
        <Plus className="size-3.5" /> Add
      </Button>
      <button
        type="button"
        onClick={close}
        aria-label="Cancel adding a type"
        title="Cancel"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <X className="size-4" />
      </button>
    </form>
  );
}

/**
 * Add, rename, recolour, recategorise and remove the log's case types. Opened
 * from the pencil on the day table's Type header. Every change saves at once and
 * reaches every row, chip and count through the layout's revalidation.
 */
export function CaseTypesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const types = useCaseTypes();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [restoring, startRestore] = useTransition();

  function loadUsage() {
    void getCaseTypeUsage().then((r) => {
      if (r.ok) setUsage(r.usage);
    });
  }

  useEffect(() => {
    if (open) loadUsage();
  }, [open]);

  const archived = types.all.filter((t) => t.archived);
  const usedColors = new Set(types.active.map((t) => t.color));

  // Dragging a row into another section changes its category. The move shows at
  // once; the override clears when the saved list comes back from the server.
  const [moved, setMoved] = useState<Record<string, CaseCategory>>({});
  const [over, setOver] = useState<CaseCategory | null>(null);
  const [, startMove] = useTransition();
  const categoryOf = (t: CaseTypeDef) => moved[t.key] ?? t.category;

  function moveTo(key: string, to: CaseCategory) {
    const t = types.get(key);
    if (!t || categoryOf(t) === to) return;
    setMoved((m) => ({ ...m, [key]: to }));
    startMove(async () => {
      const res = await updateCaseType(key, { category: to });
      if (res.ok) {
        toast.success(`${t.label} moved to ${CATEGORIES.find((c) => c.value === to)?.label}.`);
      } else {
        toast.error(res.error);
      }
      setMoved((m) => {
        const next = { ...m };
        delete next[key];
        return next;
      });
    });
  }

  function restore(t: CaseTypeDef) {
    startRestore(async () => {
      const res = await restoreCaseType(t.key);
      if (res.ok) toast.success(`${t.label} restored.`);
      else toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="font-serif text-xl">Case Types</DialogTitle>
          <DialogDescription>Create a new or edit an existing case type below</DialogDescription>
        </DialogHeader>

        <div className="-mx-1 max-h-[60vh] space-y-4 overflow-y-auto px-1">
          {CATEGORIES.map((c) => {
            const list = types.active.filter((t) => categoryOf(t) === c.value);
            return (
              <section
                key={c.value}
                aria-label={c.label}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (over !== c.value) setOver(c.value);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  const key = e.dataTransfer.getData(DRAG_TYPE);
                  if (key) moveTo(key, c.value);
                }}
                className={cn(
                  "rounded-lg border border-dashed border-transparent px-1.5 py-1 transition-colors",
                  over === c.value && "border-brand/60 bg-brand/5"
                )}
              >
                <h3 className="flex items-baseline gap-2 pb-1 text-xs text-muted-foreground">
                  <span className="font-serif text-base font-semibold text-foreground">{c.label}</span>
                  <span>{c.hint}</span>
                </h3>
                {list.length === 0 ? (
                  <p className="py-2 text-xs text-muted-foreground/70">Drag a type here.</p>
                ) : (
                  <ul>
                    {list.map((t) => (
                      <TypeRow
                        key={`${t.key}:${t.label}`}
                        type={t}
                        rows={usage ? usage[t.key] ?? 0 : undefined}
                        onRemoved={loadUsage}
                      />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          {archived.length > 0 && (
            <section aria-label="Archived">
              <h3 className="flex items-baseline gap-2 pb-1 text-xs text-muted-foreground">
                <span className="font-serif text-base font-semibold text-foreground">Archived</span>
                <span>Hidden from the pickers; old rows keep them</span>
              </h3>
              <ul>
                {archived.map((t) => (
                  <li key={t.key} className="flex items-center gap-2 py-1.5 text-sm">
                    <Swatch color={t.color} />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{t.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {usage ? rowsText(usage[t.key] ?? 0) : ""}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      disabled={restoring}
                      onClick={() => restore(t)}
                    >
                      <RotateCcw className="size-3.5" /> Restore
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <AddTypeForm usedColors={usedColors} />
      </DialogContent>
    </Dialog>
  );
}
