"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
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

/**
 * One editable type: colour, name (saves on blur or Enter), category, row count
 * and remove. Keyed on the stored label by its parent, so a saved rename resets it.
 */
function TypeRow({ type, rows, onRemoved }: { type: CaseTypeDef; rows?: number; onRemoved: () => void }) {
  const [label, setLabel] = useState(type.label);
  const [pending, startTransition] = useTransition();

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
    <li className={cn("flex items-center gap-2 py-1.5", pending && "opacity-60")}>
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
      <span className="hidden w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:inline">
        {rowsText(rows)}
      </span>
      <CategoryPicker value={type.category} onChange={(category) => save({ category })} disabled={pending} />
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label={`Remove ${type.label}`}
        title={rows ? "Archive (rows keep this type)" : "Remove"}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function AddTypeForm({ usedColors }: { usedColors: Set<ColorKey> }) {
  const firstFree = COLOR_KEYS.find((c) => !usedColors.has(c)) ?? COLOR_KEYS[0];
  const [label, setLabel] = useState("");
  const [color, setColor] = useState<ColorKey | null>(null);
  const [category, setCategory] = useState<CaseCategory>("case");
  const [pending, startTransition] = useTransition();

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
      setLabel("");
      setColor(null);
    });
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
        value={label}
        placeholder="New type"
        aria-label="New type name"
        maxLength={40}
        className="h-7 min-w-0 flex-1"
        onChange={(e) => setLabel(e.target.value)}
      />
      <CategoryPicker value={category} onChange={setCategory} disabled={pending} />
      <Button type="submit" size="sm" className="btn-primary btn-soft gap-1" disabled={pending || !label.trim()}>
        <Plus className="size-3.5" /> Add
      </Button>
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
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Case types</DialogTitle>
          <DialogDescription>
            Rename, recolour or add the types rows can use. Changes save as you go and apply to every row.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 max-h-[60vh] space-y-4 overflow-y-auto px-1">
          {CATEGORIES.map((c) => {
            const list = types.active.filter((t) => t.category === c.value);
            if (list.length === 0) return null;
            return (
              <section key={c.value} aria-label={c.label}>
                <h3 className="flex items-baseline gap-2 text-xs font-medium text-muted-foreground">
                  <span className="text-foreground">{c.label}</span>
                  <span>{c.hint}</span>
                </h3>
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
              </section>
            );
          })}

          {archived.length > 0 && (
            <section aria-label="Archived">
              <h3 className="flex items-baseline gap-2 text-xs font-medium text-muted-foreground">
                <span className="text-foreground">Archived</span>
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
