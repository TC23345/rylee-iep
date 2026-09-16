// Builds three sample workbooks in the case log's import layout, one per
// month, modelled on a real day (2026-08-17: 30 cases, 9:12 AM to 5:48 PM).
//
//   node scripts/make-sample-workbooks.mjs [outDir]
//
// Layout per file: a "Daily Case Counts" sheet (Date, Case Count) plus one
// month sheet named like "August_2026" with the columns
//   Date · Case # · Case Type · Start Time · End Time · Duration · Notes
// The date is written once per day and left blank beneath it, times are real
// Excel time cells, and Duration is a time cell too. See docs/import-format.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";

const outDir = process.argv[2] ?? "docs/import-samples";
mkdirSync(outDir, { recursive: true });

// Deterministic RNG so the files are reproducible.
let seed = 20260817;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

// Weighted like the real day: continuations dominate, then reconsiderations.
const CASE_TYPES = [
  ["Continuation", 40, [12, 26]],
  ["Reconsideration", 28, [3, 25]],
  ["Recon Reply", 14, [4, 24]],
  ["Authorization Revision", 6, [8, 14]],
  ["BCBA Reply", 5, [5, 8]],
  ["Additional Info", 4, [3, 6]],
  ["Initial", 3, [15, 30]],
];
const OTHER_TIME = [
  ["Phone Call", [5, 15]],
  ["Meeting", [20, 45]],
  ["Admin Tasks", [10, 25]],
];
const NOTES = [
  "Phone call with Dave",
  "Had to restart",
  '"Requests to be reviewed by supervisor only"',
  "Retrospective",
  "Phone call",
  "Waiting on records",
  "Peer review requested",
  "Follow up Friday",
];

function weightedType() {
  const total = CASE_TYPES.reduce((s, t) => s + t[1], 0);
  let r = rand() * total;
  for (const t of CASE_TYPES) {
    r -= t[1];
    if (r <= 0) return t;
  }
  return CASE_TYPES[0];
}

let nextCase = 262100000;
function caseNumber() {
  nextCase += between(1, 900);
  return nextCase;
}

/** One day's rows as [caseNumber|null, type, startMin, endMin, note]. */
function buildDay() {
  const rows = [];
  let t = between(8 * 60 + 45, 9 * 60 + 20);
  const end = between(17 * 60, 17 * 60 + 55);
  let lunchDone = false;
  let breakBudget = between(1, 3);

  while (t < end) {
    if (!lunchDone && t >= 12 * 60 + 15 && rand() < 0.6) {
      const len = between(20, 40);
      rows.push([null, "Lunch", t, t + len, ""]);
      t += len;
      lunchDone = true;
      continue;
    }
    if (breakBudget > 0 && rand() < 0.05) {
      const [type, [lo, hi]] = pick(OTHER_TIME);
      const len = between(lo, hi);
      const withCase = type === "Phone Call" && rand() < 0.5;
      rows.push([withCase ? caseNumber() : null, type, t, t + len, type === "Meeting" ? "Team huddle" : ""]);
      t += len;
      breakBudget--;
      continue;
    }
    const [type, , [lo, hi]] = weightedType();
    const len = between(lo, hi);
    const note = rand() < 0.12 ? pick(NOTES) : "";
    rows.push([caseNumber(), type, t, t + len, note]);
    t += len;
    if (rand() < 0.3) t += between(1, 8); // small gap between cases
    if (rand() < 0.04) t += between(10, 25); // the occasional longer gap
  }
  return rows;
}

const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;
const frac = (minutes) => minutes / 1440;
const dateCell = (y, m, d) => ({ t: "n", v: serial(y, m, d), z: "m/d/yyyy" });
const timeCell = (minutes) => ({ t: "n", v: frac(minutes), z: "h:mm AM/PM" });
const durationCell = (minutes) => ({ t: "n", v: frac(minutes), z: "h:mm" });

const MONTHS = [
  { y: 2026, m: 7, name: "July_2026", skip: [3] }, // July 3 observed holiday
  { y: 2026, m: 8, name: "August_2026", skip: [] },
  { y: 2026, m: 9, name: "September_2026", skip: [7], through: 16 }, // Labor Day; up to today
];

for (const month of MONTHS) {
  const daysInMonth = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
  const last = month.through ?? daysInMonth;
  const header = ["Date", "Case #", "Case Type", "Start Time", "End Time", "Duration", "Notes"];
  const body = [];
  const counts = [];

  for (let d = 1; d <= last; d++) {
    const weekday = new Date(Date.UTC(month.y, month.m - 1, d)).getUTCDay();
    if (weekday === 0 || weekday === 6 || month.skip.includes(d)) continue;
    if (rand() < 0.06) continue; // an occasional day off
    const rows = buildDay();
    let cases = 0;
    rows.forEach(([num, type, start, end, note], i) => {
      if (num !== null && type !== "Lunch") cases++;
      body.push([
        i === 0 ? dateCell(month.y, month.m, d) : null,
        num,
        type,
        timeCell(start),
        timeCell(end),
        durationCell(end - start),
        note || null,
      ]);
    });
    counts.push([dateCell(month.y, month.m, d), cases]);
  }

  const monthSheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  monthSheet["!cols"] = [{ wch: 11 }, { wch: 11 }, { wch: 22 }, { wch: 11 }, { wch: 11 }, { wch: 9 }, { wch: 44 }];
  const countsSheet = XLSX.utils.aoa_to_sheet([["Date", "Case Count"], ...counts]);
  countsSheet["!cols"] = [{ wch: 11 }, { wch: 11 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, countsSheet, "Daily Case Counts");
  XLSX.utils.book_append_sheet(wb, monthSheet, month.name);
  const file = join(outDir, `${month.name}.xlsx`);
  writeFileSync(file, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  console.log(`${file}: ${counts.length} days, ${body.length} rows, ${counts.reduce((s, c) => s + c[1], 0)} cases`);
}
