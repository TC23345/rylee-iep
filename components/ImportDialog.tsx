"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

import { importEntries } from "@/app/actions/import";
import { numericDate, shortDayLabel } from "@/lib/dates";
import { parseWorkbook, type ParsedWorkbook } from "@/lib/spreadsheet";
import { useCaseTypes } from "@/components/CaseTypesProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DaySummary {
  date: string;
  rows: number;
  cases: number;
}

function summarizeDays(
  parsed: ParsedWorkbook,
  countsAsCase: (type: string, caseNumber: string) => boolean
): DaySummary[] {
  const byDate = new Map<string, DaySummary>();
  for (const r of parsed.rows) {
    const d = byDate.get(r.date) ?? { date: r.date, rows: 0, cases: 0 };
    d.rows += 1;
    if (countsAsCase(r.caseType, r.caseNumber)) d.cases += 1;
    byDate.set(r.date, d);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

/**
 * Pick an .xlsx in the workbook layout, see what was found, then import it.
 * Rows already in the log are skipped, so re-importing a file is harmless.
 */
export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const router = useRouter();
  const types = useCaseTypes();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setFileName(null);
    setParsed(null);
    setReadError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function onFile(file: File | undefined) {
    setParsed(null);
    setReadError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const [xlsx, data] = await Promise.all([import("xlsx"), file.arrayBuffer()]);
      setParsed(parseWorkbook(xlsx, data, types.all));
    } catch {
      setReadError("That file could not be opened as a spreadsheet.");
    }
  }

  function runImport() {
    if (!parsed || parsed.rows.length === 0) return;
    startTransition(async () => {
      const res = await importEntries(parsed.rows);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const skipped = res.skipped ? `, ${res.skipped} already logged` : "";
      toast.success(`Imported ${res.inserted} ${res.inserted === 1 ? "row" : "rows"}${skipped}.`);
      router.refresh();
      handleOpenChange(false);
    });
  }

  const days = parsed ? summarizeDays(parsed, types.countsAsCase) : [];
  const totalCases = days.reduce((sum, d) => sum + d.cases, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Import a spreadsheet</DialogTitle>
          <DialogDescription className="sr-only">
            Choose an Excel workbook in the case log layout, review what was found, then import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <input
            id="import-file"
            ref={fileRef}
            type="file"
            accept=".xlsx,.xlsm,.xls,.csv"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="size-4" />
            {fileName ? "Choose a different workbook" : "Choose a workbook"}
          </Button>
          {fileName && <span className="truncate text-sm text-muted-foreground">{fileName}</span>}
        </div>

        {readError && (
          <Alert variant="destructive">
            <AlertTitle>Could not read {fileName}</AlertTitle>
            <AlertDescription>{readError}</AlertDescription>
          </Alert>
        )}

        {parsed && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Sheet</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.sheets.map((s) => (
                    <TableRow key={s.name}>
                      <TableCell>
                        {s.name}
                        {s.skipped && (
                          <span className="ml-2 text-xs text-muted-foreground">{s.skipped}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.skipped ? "—" : s.rows}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {days.length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Cases</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {days.map((d) => (
                      <TableRow key={d.date}>
                        <TableCell>
                          <span className="tabular-nums">{numericDate(d.date)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {shortDayLabel(d.date).slice(0, 3)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{d.rows}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.cases}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {parsed.issues.length > 0 && (
              <Alert>
                <AlertTitle>
                  {parsed.issues.length} {parsed.issues.length === 1 ? "row" : "rows"} will be
                  left out
                </AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {parsed.issues.slice(0, 8).map((i, n) => (
                      <li key={n}>
                        {i.sheet} row {i.row}: {i.message}
                      </li>
                    ))}
                    {parsed.issues.length > 8 && <li>and {parsed.issues.length - 8} more.</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {parsed.rows.length === 0 && (
              <Alert variant="destructive">
                <AlertTitle>Nothing to import</AlertTitle>
                <AlertDescription>
                  No month sheet with a Date, Case Type and Start Time header was found.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="btn-primary"
            disabled={!parsed || parsed.rows.length === 0 || pending}
            onClick={runImport}
          >
            {pending
              ? "Importing..."
              : parsed && parsed.rows.length > 0
                ? `Import ${parsed.rows.length} rows (${totalCases} cases)`
                : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
