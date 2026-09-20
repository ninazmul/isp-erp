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

        const printContent = targetElement.outerHTML;
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${bill.invoiceNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
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

                <DialogContent className="max-w-4xl bg-gray-100 max-h-[92vh] overflow-y-auto p-0 rounded-none border border-gray-300">
                    {/* Modal Top Actions Toolbar */}
                    <div className="sticky top-0 z-30 bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                        <DialogTitle className="text-sm font-bold text-gray-900 tracking-tight">
                            Invoice &nbsp;#{bill.invoiceNumber}
                        </DialogTitle>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrint}
                                className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 rounded-none"
                            >
                                <Printer className="h-3.5 w-3.5" /> Print
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDownload}
                                disabled={downloading}
                                className="h-8 text-xs bg-black hover:bg-gray-800 text-white gap-1.5 rounded-none"
                            >
                                <DownloadCloud className="h-3.5 w-3.5" />
                                {downloading ? "Downloading…" : "Download PDF"}
                            </Button>
                        </div>
                    </div>

                    {/* Invoice Document Wrapper */}
                    <div className="p-6 flex justify-center bg-gray-200 min-h-screen">
                        <div
                            ref={modalInvoiceRef}
                            className="bg-white shadow-md"
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
                className="h-8 w-8 p-0 text-gray-500 hover:text-black hover:bg-gray-100 rounded-none"
                title="Download PDF"
            >
                <DownloadCloud className="h-4 w-4" />
            </Button>

            <Button
                size="sm"
                variant="ghost"
                onClick={handlePrint}
                className="h-8 w-8 p-0 text-gray-500 hover:text-black hover:bg-gray-100 rounded-none"
                title="Print Invoice"
            >
                <Printer className="h-4 w-4" />
            </Button>
        </div>
    );
}