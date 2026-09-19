// Client-safe case type registry. Each log (Clerk user id) starts with the eleven
// types from Rylee's spreadsheet dropdown and can rename, recolour, recategorise,
// add or remove them from the Type column's edit dialog. Rows store the type's
// `key`, which never changes, so a rename relabels every row at once.

/**
 * What a type means for the counts:
 * - case:  a case review; needs a case number and counts as a case
 * - other: other work time; counts as a case only when a case number is logged
 * - break: lunch and the like; never counts
 */
export type CaseCategory = "case" | "other" | "break";

export const CATEGORIES: { value: CaseCategory; label: string; hint: string }[] = [
  { value: "case", label: "Case Work", hint: "Needs a case number; counts as a case" },
  { value: "other", label: "Other Time", hint: "Counts as a case only with a case number" },
  { value: "break", label: "Break", hint: "Never counts" },
];

/**
 * Colour choices. Tailwind needs the class names spelled out in full, so each
 * swatch lists its chip (badge) and bar (dot and stacked-bar segment) classes.
 */
export const PALETTE = {
  amber: { label: "Amber", chip: "bg-amber-100 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200", bar: "bg-amber-400" },
  lime: { label: "Lime", chip: "bg-lime-100 text-lime-900 dark:bg-lime-400/20 dark:text-lime-200", bar: "bg-lime-400" },
  fuchsia: { label: "Fuchsia", chip: "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-400/20 dark:text-fuchsia-200", bar: "bg-fuchsia-400" },
  sky: { label: "Sky", chip: "bg-sky-100 text-sky-900 dark:bg-sky-400/20 dark:text-sky-200", bar: "bg-sky-400" },
  emerald: { label: "Emerald", chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-200", bar: "bg-emerald-400" },
  yellow: { label: "Yellow", chip: "bg-yellow-100 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-200", bar: "bg-yellow-300" },
  indigo: { label: "Indigo", chip: "bg-indigo-100 text-indigo-900 dark:bg-indigo-400/20 dark:text-indigo-200", bar: "bg-indigo-400" },
  orange: { label: "Orange", chip: "bg-orange-100 text-orange-900 dark:bg-orange-400/20 dark:text-orange-200", bar: "bg-orange-400" },
  violet: { label: "Violet", chip: "bg-violet-100 text-violet-900 dark:bg-violet-400/20 dark:text-violet-200", bar: "bg-violet-400" },
  rose: { label: "Rose", chip: "bg-rose-100 text-rose-900 dark:bg-rose-400/20 dark:text-rose-200", bar: "bg-rose-400" },
  teal: { label: "Teal", chip: "bg-teal-100 text-teal-900 dark:bg-teal-400/20 dark:text-teal-200", bar: "bg-teal-400" },
  cyan: { label: "Cyan", chip: "bg-cyan-100 text-cyan-900 dark:bg-cyan-400/20 dark:text-cyan-200", bar: "bg-cyan-400" },
  stone: { label: "Stone", chip: "bg-stone-200 text-stone-800 dark:bg-stone-500/25 dark:text-stone-200", bar: "bg-stone-400" },
  muted: { label: "Grey", chip: "bg-muted text-muted-foreground", bar: "bg-stone-300" },
} as const;

export type ColorKey = keyof typeof PALETTE;
export const COLOR_KEYS = Object.keys(PALETTE) as ColorKey[];

export function isColorKey(v: string): v is ColorKey {
  return v in PALETTE;
}

export interface CaseTypeDef {
  key: string;
  label: string;
  color: ColorKey;
  category: CaseCategory;
  /** Hidden from pickers because rows still use it; those rows keep its label. */
  archived: boolean;
  /** One of the eleven types every log starts with. */
  builtin: boolean;
}

/** The spreadsheet's dropdown, in its order: case work first, then other time. */
export const BUILTIN_CASE_TYPES: CaseTypeDef[] = (
  [
    ["reconsideration", "Reconsideration", "amber", "case"],
    ["recon_reply", "Recon Reply", "lime", "case"],
    ["continuation", "Continuation", "fuchsia", "case"],
    ["bcba_reply", "BCBA Reply", "sky", "case"],
    ["authorization_revision", "Authorization Revision", "emerald", "case"],
    ["additional_info", "Additional Info", "yellow", "case"],
    ["initial", "Initial", "indigo", "case"],
    ["phone_call", "Phone Call", "orange", "other"],
    ["meeting", "Meeting", "violet", "other"],
    ["admin_tasks", "Admin Tasks", "stone", "other"],
    ["lunch", "Lunch", "muted", "break"],
  ] as const
).map(([key, label, color, category]) => ({
  key,
  label,
  color,
  category,
  archived: false,
  builtin: true,
}));

/** The type the add dialog starts on; Rylee's most common. */
export const DEFAULT_CASE_TYPE = "reconsideration";

const FALLBACK_STYLE = { chip: "bg-muted text-foreground", bar: "bg-stone-300" };

export interface CaseTypeHelpers {
  /** Every type the log knows, archived ones included. */
  all: CaseTypeDef[];
  /** Types offered in pickers. */
  active: CaseTypeDef[];
  /** Active types grouped for a picker, in category order; empty groups dropped. */
  groups: { label: string; types: CaseTypeDef[] }[];
  get(key: string): CaseTypeDef | undefined;
  /** Tolerates a key the log no longer knows (shows the key itself). */
  label(key: string): string;
  style(key: string): { chip: string; bar: string };
  requiresCaseNumber(key: string): boolean;
  isBreak(key: string): boolean;
  /** Mirrors the counting rule used by the aggregates in lib/entries.ts. */
  countsAsCase(key: string, caseNumber: string): boolean;
  /** The add dialog's starting type: the default if still active, else the first active one. */
  defaultKey: string;
}

export function caseTypeHelpers(all: CaseTypeDef[]): CaseTypeHelpers {
  const byKey = new Map(all.map((t) => [t.key, t]));
  const active = all.filter((t) => !t.archived);
  const groups = CATEGORIES.map((c) => ({
    label: c.label,
    types: active.filter((t) => t.category === c.value),
  })).filter((g) => g.types.length > 0);

  return {
    all,
    active,
    groups,
    get: (key) => byKey.get(key),
    label: (key) => byKey.get(key)?.label ?? key,
    style: (key) => {
      const t = byKey.get(key);
      return t ? PALETTE[t.color] : FALLBACK_STYLE;
    },
    requiresCaseNumber: (key) => byKey.get(key)?.category === "case",
    isBreak: (key) => byKey.get(key)?.category === "break",
    countsAsCase: (key, caseNumber) =>
      byKey.get(key)?.category !== "break" && caseNumber.trim() !== "",
    defaultKey: active.some((t) => t.key === DEFAULT_CASE_TYPE)
      ? DEFAULT_CASE_TYPE
      : (active.find((t) => t.category === "case") ?? active[0])?.key ?? DEFAULT_CASE_TYPE,
  };
}

/** "Recon Reply", "recon_reply", "RECON REPLY" all normalise the same way. */
export function normalizeTypeWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
