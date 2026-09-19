import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireSignedInUser } from "@/lib/authz";
import { formatDuration, formatTime12, isIsoMonth, monthRange, numericDate } from "@/lib/dates";
import { getDailyCounts, listEntriesForRange } from "@/lib/entries";
import { caseTypeHelpers } from "@/lib/case-types";
import { getCaseTypes } from "@/lib/case-types-db";
import { monthSheetName } from "@/lib/spreadsheet";

export const dynamic = "force-dynamic";

/**
 * GET /api/export/2026-08 → an .xlsx in Rylee's workbook layout: a Daily Case
 * Counts sheet for the month plus the month sheet with one row per log entry.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ ym: string }> }) {
  let orgId: string;
  try {
    ({ orgId } = await requireSignedInUser());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ym } = await ctx.params;
  if (!isIsoMonth(ym)) return NextResponse.json({ error: "Bad month" }, { status: 400 });

  const range = monthRange(ym);
  const [counts, entries, types] = await Promise.all([
    getDailyCounts(orgId, range),
    listEntriesForRange(orgId, range),
    getCaseTypes(orgId),
  ]);
  const typeLabel = caseTypeHelpers(types).label;

  const countsSheet = XLSX.utils.aoa_to_sheet([
    ["Date", "Case Count"],
    ...counts.map((c) => [numericDate(c.date), c.count]),
  ]);
  countsSheet["!cols"] = [{ wch: 12 }, { wch: 12 }];

  const header = ["Date", "Case #", "Case Type", "Start Time", "End Time", "Duration", "Notes"];
  const body: (string | number)[][] = [];
  let lastDate = "";
  for (const e of entries) {
    body.push([
      e.date === lastDate ? "" : numericDate(e.date),
      e.caseNumber,
      typeLabel(e.caseType),
      e.startTime ? formatTime12(e.startTime) : "",
      e.endTime ? formatTime12(e.endTime) : "",
      e.durationMin === null ? "" : formatDuration(e.durationMin),
      e.note,
    ]);
    lastDate = e.date;
  }
  const monthSheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  monthSheet["!cols"] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 22 },
    { wch: 11 },
    { wch: 11 },
    { wch: 9 },
    { wch: 48 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, countsSheet, "Daily Case Counts");
  XLSX.utils.book_append_sheet(wb, monthSheet, monthSheetName(ym));

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="case-log-${ym}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
