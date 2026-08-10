"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DownloadCloud, Printer, Eye } from "lucide-react";
import InvoiceTemplate from "./InvoiceTemplate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import type { Bill } from "@/types";

export default function InvoiceDownloader({ bill }: { bill: Bill }) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const modalInvoiceRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    // Prefer visible modal ref if open, otherwise offscreen ref
    const targetElement = modalInvoiceRef.current || invoiceRef.current;
    if (!targetElement) return;

    setDownloading(true);
    const toastId = toast.loading("Generating PDF invoice...");

    try {
      const canvas = await html2canvas(targetElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pageWidth,
        Math.min(imgHeight, pageHeight),
      );
      pdf.save(`invoice_${bill.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const targetElement = modalInvoiceRef.current || invoiceRef.current;
    if (!targetElement) return;

    const printContent = targetElement.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${bill.invoiceNumber}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background: #ffffff !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center gap-1">
      {/* Offscreen element for generating PDF/Print when modal is closed */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div ref={invoiceRef}>
          <InvoiceTemplate bill={bill} />
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-500 hover:text-[#3e0078] hover:bg-purple-50 rounded-lg"
            title="Preview Invoice"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl bg-slate-100 max-h-[92vh] overflow-y-auto p-0 rounded-2xl border-none">
          {/* Modal Top Actions Toolbar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs">
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Invoice #{bill.invoiceNumber}
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="h-8 text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="h-8 text-xs rounded-xl bg-[#3e0078] hover:bg-[#52029d] text-white gap-1.5 shadow-sm"
              >
                <DownloadCloud className="h-3.5 w-3.5" />
                {downloading ? "Downloading…" : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* Invoice Document Wrapper */}
          <div className="p-6 flex justify-center bg-slate-200/60 min-h-screen">
            <div
              ref={modalInvoiceRef}
              className="bg-white shadow-xl rounded-xl overflow-hidden"
            >
              <InvoiceTemplate bill={bill} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Action Buttons */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDownload}
        disabled={downloading}
        className="h-8 w-8 p-0 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
        title="Download PDF"
      >
        <DownloadCloud className="h-4 w-4 text-slate-600" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={handlePrint}
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        title="Print Invoice"
      >
        <Printer className="h-4 w-4 text-slate-600" />
      </Button>
    </div>
  );
}
