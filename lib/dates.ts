// Pure date helpers for the case log. Dates are ISO "YYYY-MM-DD" strings and months
// are "YYYY-MM". All arithmetic runs in UTC so a local timezone never shifts a day.
// "Today" is resolved in Rylee's timezone.

export const TIME_ZONE = "America/Chicago";

/** First month that gets a tab. Tabs run from here through the current month. */
export const FIRST_MONTH = "2026-07";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isIsoDate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  if (m < 1 || m > 12) return false;
  return d >= 1 && d <= daysInMonth(y, m);
}

export function isIsoMonth(s: string): boolean {
  if (!ISO_MONTH.test(s)) return false;
  const m = Number(s.slice(5, 7));
  return m >= 1 && m <= 12;
}

export function todayIso(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Current wall-clock time in Rylee's timezone as "HH:MM". */
export function nowTime(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function monthRange(ym: string): { from: string; to: string; days: number } {
  const [y, m] = ym.split("-").map(Number);
  const days = daysInMonth(y, m);
  return {
    from: `${ym}-01`,
    to: `${ym}-${String(days).padStart(2, "0")}`,
    days,
  };
}

export function monthLabel(ym: string, style: "long" | "short" = "long"): string {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: style,
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/** "Tuesday, September 15" */
export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "September 18th" */
export function monthDayOrdinal(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const month = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long" }).format(
    new Date(Date.UTC(2000, m - 1, 1))
  );
  const suffix =
    d % 100 >= 11 && d % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[d % 10] ?? "th";
  return `${month} ${d}${suffix}`;
}

/** "8/17/2026" — matches the spreadsheet's date column. */
export function numericDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${m}/${d}/${y}`;
}

/** "Tue 9/15" */
export function shortDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "14:05" → "2:05 PM" */
export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Whole minutes from start to end ("HH:MM" each), or null if either is missing. */
export function minutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some(Number.isNaN)) return null;
  return eh * 60 + em - (sh * 60 + sm);
}

/** 6 → "0:06", 84 → "1:24" — matches the spreadsheet's Duration column. */
export function formatDuration(min: number): string {
  const sign = min < 0 ? "-" : "";
  const abs = Math.abs(min);
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`;
}

/** Months that get a tab: FIRST_MONTH through the month containing `today`. */
export function trackedMonths(today = todayIso()): string[] {
  const end = monthOf(today);
  const out: string[] = [];
  let cur = FIRST_MONTH;
  while (cur <= end && out.length < 120) {
    out.push(cur);
    cur = addMonths(cur, 1);
  }
  return out;
}
