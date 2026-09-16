"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";

import { ImportDialog } from "@/components/ImportDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SpreadsheetActionsProps {
  ym: string;
}

/** Icon buttons: import a workbook, or download this month in the same layout. */
export function SpreadsheetActions({ ym }: SpreadsheetActionsProps) {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Import Excel"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import Excel</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Export to .xlsx" asChild>
            <a href={`/api/export/${ym}`} download>
              <Download className="size-4" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export to .xlsx</TooltipContent>
      </Tooltip>
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
