import { z } from "zod";
import { CASE_TYPE_LABELS, caseTypes, type CaseType } from "@/lib/entry-schema";

// Reading and writing Rylee's workbook layout. Client-safe: the SheetJS module
// is handed in by the caller so it only loads where it is used.
//
// Workbook shape: a "Daily Case Counts" sheet (derived, ignored on import) and
// one sheet per month with the columns Date · Case # · Case Type · Start Time ·
// End Time · Duration · Notes. The date is written once per day and left blank
// on the rows beneath it.

type SheetJs = typeof import("xlsx");
type Cell = string | number | boolean | Date | null | undefined;

export const importRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  caseNumber: z.string().regex(/^\d{0,12}$/),
  caseType: z.enum(caseTypes),
  startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).nullable(),
  endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).nullable(),
  note: z.string().max(2000),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export interface ImportIssue {
  sheet: string;
  /** 1-based row number as shown in the spreadsheet. */
  row: number;
  message: string;
}

export interface SheetSummary {
  name: string;
  rows: number;
  /** Why the sheet was left out, if it was. */
  skipped?: string;
}

export interface ParsedWorkbook {
  rows: ImportRow[];
  issues: ImportIssue[];
  sheets: SheetSummary[];
}

const DAILY_COUNTS = /daily\s*case\s*counts/i;

/** "Recon Reply", "recon_reply", "RECON REPLY" all resolve to the same type. */
const TYPE_LOOKUP: Record<string, CaseType> = Object.fromEntries(
  caseTypes.flatMap((t) => [
    [normalizeWord(t), t],
    [normalizeWord(CASE_TYPE_LABELS[t]), t],
  ])
);
// Spellings seen in the workbook that differ from the app's labels.
Object.assign(TYPE_LOOKUP, {
  [normalizeWord("Lunch / break")]: "lunch",
  [normalizeWord("Break")]: "lunch",
  [normalizeWord("Recon")]: "reconsideration",
  [normalizeWord("Auth Revision")]: "authorization_revision",
  [normalizeWord("Phone")]: "phone_call",
  [normalizeWord("Admin")]: "admin_tasks",
} satisfies Record<string, CaseType>);

function normalizeWord(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export function caseTypeFromLabel(raw: Cell): CaseType | null {
  if (typeof raw !== "string") return null;
  return TYPE_LOOKUP[normalizeWord(raw)] ?? null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Excel serial, JS Date, or "8/17/2026" → "2026-08-17". */
function toIsoDate(xlsx: SheetJs, raw: Cell): string | null {
  if (raw instanceof Date) {
    return `${raw.getFullYear()}-${pad(raw.getMonth() + 1)}-${pad(raw.getDate())}`;
  }
  if (typeof raw === "number") {
    const d = xlsx.SSF.parse_date_code(raw);
    return d ? `${d.y}-${pad(d.m)}-${pad(d.d)}` : null;
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    let m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s);
    if (m) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return `${y}-${pad(Number(m[1]))}-${pad(Number(m[2]))}`;
    }
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return null;
}

/** Excel time fraction, JS Date, "9:12 AM", or "09:12" → "09:12". */
function toHhMm(xlsx: SheetJs, raw: Cell): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (raw instanceof Date) return `${pad(raw.getHours())}:${pad(raw.getMinutes())}`;
  if (typeof raw === "number") {
    const d = xlsx.SSF.parse_date_code(raw);
    return d ? `${pad(d.H)}:${pad(d.M)}` : null;
  }
  if (typeof raw === "string") {
    const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/.exec(raw.trim());
    if (!m) return null;
    let h = Number(m[1]);
    const suffix = m[3]?.toUpperCase();
    if (suffix === "PM" && h < 12) h += 12;
    if (suffix === "AM" && h === 12) h = 0;
    if (h > 23 || Number(m[2]) > 59) return null;
    return `${pad(h)}:${m[2]}`;
  }
  return null;
}

function toCaseNumber(raw: Cell): string {
  if (typeof raw === "number") return Number.isFinite(raw) ? String(Math.trunc(raw)) : "";
  if (typeof raw === "string") return raw.replace(/\D/g, "");
  return "";
}

function toNote(raw: Cell): string {
  if (raw === null || raw === undefined) return "";
  return String(raw).trim();
}

interface ColumnMap {
  date: number;
  caseNumber: number;
  caseType: number;
  startTime: number;
  endTime: number;
  note: number;
}

const HEADER_PATTERNS: Record<keyof ColumnMap, RegExp> = {
  date: /^date/i,
  caseNumber: /case\s*(#|no|num)/i,
  caseType: /type/i,
  startTime: /start/i,
  endTime: /end/i,
  note: /note/i,
};

function findHeader(rows: Cell[][]): { index: number; columns: ColumnMap } | null {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map((c) => (typeof c === "string" ? c.trim() : ""));
    const col = (re: RegExp) => cells.findIndex((c) => re.test(c));
    const columns: ColumnMap = {
      date: col(HEADER_PATTERNS.date),
      caseNumber: col(HEADER_PATTERNS.caseNumber),
      caseType: col(HEADER_PATTERNS.caseType),
      startTime: col(HEADER_PATTERNS.startTime),
      endTime: col(HEADER_PATTERNS.endTime),
      note: col(HEADER_PATTERNS.note),
    };
    if (columns.date >= 0 && columns.caseType >= 0 && columns.startTime >= 0) {
      return { index: i, columns };
    }
  }
  return null;
}

/** Read every month sheet in the workbook into rows the app can store. */
export function parseWorkbook(xlsx: SheetJs, data: ArrayBuffer): ParsedWorkbook {
  const wb = xlsx.read(data, { type: "array", cellDates: false });
  const out: ParsedWorkbook = { rows: [], issues: [], sheets: [] };

  for (const name of wb.SheetNames) {
    if (DAILY_COUNTS.test(name)) {
      out.sheets.push({ name, rows: 0, skipped: "Counts are worked out from the rows." });
      continue;
    }
    const ws = wb.Sheets[name];
    const grid = xlsx.utils.sheet_to_json<Cell[]>(ws, { header: 1, raw: true, defval: null });
    const header = findHeader(grid);
    if (!header) {
      out.sheets.push({ name, rows: 0, skipped: "No Date / Case Type / Start Time header found." });
      continue;
    }

    const { columns } = header;
    const at = (row: Cell[], i: number): Cell => (i >= 0 ? row[i] : null);
    let currentDate: string | null = null;
    let count = 0;

    for (let r = header.index + 1; r < grid.length; r++) {
      const row = grid[r];
      const rowNumber = r + 1;
      const isBlank = row.every((c) => c === null || c === undefined || c === "");
      if (isBlank) continue;

      const dateCell = at(row, columns.date);
      if (dateCell !== null && dateCell !== undefined && dateCell !== "") {
        const iso = toIsoDate(xlsx, dateCell);
        if (!iso) {
          out.issues.push({ sheet: name, row: rowNumber, message: `Unreadable date "${String(dateCell)}".` });
          currentDate = null;
          continue;
        }
        currentDate = iso;
      }
      if (!currentDate) {
        out.issues.push({ sheet: name, row: rowNumber, message: "No date above this row." });
        continue;
      }

      const typeCell = at(row, columns.caseType);
      const caseNumber = toCaseNumber(at(row, columns.caseNumber));
      if ((typeCell === null || typeCell === "") && !caseNumber) continue;

      const caseType = caseTypeFromLabel(typeCell);
      if (!caseType) {
        out.issues.push({ sheet: name, row: rowNumber, message: `Unknown case type "${String(typeCell ?? "")}".` });
        continue;
      }

      const startTime = toHhMm(xlsx, at(row, columns.startTime));
      const endTime = toHhMm(xlsx, at(row, columns.endTime));
      const candidate: ImportRow = {
        date: currentDate,
        caseNumber,
        caseType,
        startTime,
        endTime,
        note: toNote(at(row, columns.note)),
      };
      const parsed = importRowSchema.safeParse(candidate);
      if (!parsed.success) {
        out.issues.push({ sheet: name, row: rowNumber, message: parsed.error.issues[0]?.message ?? "Invalid row." });
        continue;
      }
      out.rows.push(parsed.data);
      count++;
    }
    out.sheets.push({ name, rows: count });
  }

  return out;
}

/** Sheet name in Rylee's style: "August_2026". */
export function monthSheetName(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 1))
  );
  return `${month}_${y}`;
}
