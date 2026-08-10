"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { parseExcelFile } from "@/lib/excel";
import { toast } from "react-hot-toast";

export interface ImportResult {
  inserted: number;
  failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

interface ExcelImportExportProps {
  /** Called with parsed rows after file is picked. Returns an ImportResult. */
  onImport: (rows: Record<string, unknown>[]) => Promise<ImportResult>;
  /** Called when the user clicks Export. Parent provides data + triggers download. */
  onExport: () => void;
  /** Called when the user clicks Download Template. */
  onTemplate: () => void;
  /** Whether an import is currently in progress */
  isImporting?: boolean;
  /** Label prefix for button titles, e.g. "Income", "Expense" */
  label?: string;
}

/**
 * Reusable Import / Export / Template buttons used in Income, Expense, Billing.
 * Renders a compact row of action buttons and handles file-picking internally.
 * Shows a results modal after import completes.
 */
export default function ExcelImportExport({
  onImport,
  onExport,
  onTemplate,
  isImporting = false,
  label = "",
}: ExcelImportExportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-imported
    e.target.value = "";

    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        toast.error("The file is empty or has no data rows.");
        return;
      }
      const importResult = await onImport(rows);
      setResult(importResult);
      setShowResult(true);

      if (importResult.failed.length === 0) {
        toast.success(`✅ Imported ${importResult.inserted} records successfully.`);
      } else {
        toast(
          `Imported ${importResult.inserted} records. ${importResult.failed.length} rows failed.`,
          { icon: "⚠️" }
        );
      }
    } catch (err) {
      toast.error("Failed to read file. Make sure it's a valid .xlsx or .xls file.");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const busy = importing || isImporting;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Template Download */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTemplate}
          className="h-8 rounded-xl border-slate-200 text-xs gap-1.5 text-slate-600 hover:text-[#3e0078] hover:border-purple-200 hover:bg-purple-50 transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Template
        </Button>

        {/* Import */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="h-8 rounded-xl border-emerald-200 text-xs gap-1.5 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          {busy ? "Importing…" : `Import${label ? ` ${label}` : ""}`}
        </Button>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-8 rounded-xl border-blue-200 text-xs gap-1.5 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {`Export${label ? ` ${label}` : ""}`}
        </Button>
      </div>

      {/* Results Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-lg bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#3e0078]" />
              Import Results
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              {/* Summary pills */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Inserted</p>
                    <p className="text-xl font-extrabold text-emerald-700">{result.inserted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">
                  <X className="h-4 w-4 text-rose-600" />
                  <div>
                    <p className="text-xs text-rose-600 font-medium">Failed</p>
                    <p className="text-xl font-extrabold text-rose-700">{result.failed.length}</p>
                  </div>
                </div>
              </div>

              {/* Failed rows detail */}
              {result.failed.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    Failed Rows (review and fix before re-importing):
                  </p>
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {result.failed.map((f, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-700">Row {f.row}</span>
                          <span className="text-rose-600 font-medium">{f.reason}</span>
                        </div>
                        <p className="text-slate-400 font-mono truncate">
                          {JSON.stringify(f.data)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowResult(false)}
                className="w-full bg-[#3e0078] hover:bg-[#52029d] text-white rounded-xl"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
