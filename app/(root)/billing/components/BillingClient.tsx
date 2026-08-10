"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Receipt, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getBills,
  generateMonthlyBills,
  markBillAsPaid,
  bulkImportBills,
} from "@/lib/actions/bill.actions";
import GenerateBillsForm from "./GenerateBillsForm";
import MarkPaidForm from "./MarkPaidForm";
import InvoiceDownloader from "../../components/InvoiceDownloader";
import type { Bill } from "@/types";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";

export default function BillingClient({
  initialBills,
  initialTotal = 0,
  initialTotalPages = 1,
}: {
  initialBills: Bill[];
  initialTotal?: number;
  initialTotalPages?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [bills, setBills] = useState(initialBills);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [markingBill, setMarkingBill] = useState<Bill | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBills = useCallback(async () => {
    const res = await getBills({
      month: month && month !== "all" ? parseInt(month) : undefined,
      year: parseInt(year),
      status,
      search,
      page,
      limit,
    });
    setBills(res.bills);
    setTotal(res.total);
    setTotalPages(res.totalPages || 1);
  }, [search, month, year, status, page, limit]);

  useEffect(() => {
    if (mounted) {
      loadBills();
    }
  }, [loadBills, mounted]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    setPage(1);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val === "all" ? "" : val);
    setPage(1);
  };

  const handleLimitChange = (val: string) => {
    setLimit(parseInt(val));
    setPage(1);
  };

  const handleGenerate = async (data: { month: number; year: number }) => {
    try {
      const result = await generateMonthlyBills(data.month, data.year);
      toast.success(
        `Generated ${result.generated} bills, skipped ${result.skipped} existing bills`
      );
      setIsGenerateOpen(false);
      loadBills();
    } catch {
      toast.error("Failed to generate bills");
    }
  };

  const handleMarkPaid = async (data: {
    paymentDate: string;
    paymentMethod: string;
    paidAmount: number;
    remarks?: string;
  }) => {
    if (!markingBill) return;
    try {
      await markBillAsPaid(markingBill._id, {
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        paidAmount: data.paidAmount,
        remarks: data.remarks,
      });
      toast.success(data.paidAmount >= markingBill.amount ? "Bill marked as paid" : "Partial payment recorded");
      setIsMarkPaidOpen(false);
      setMarkingBill(null);
      loadBills();
    } catch {
      toast.error("Failed to mark bill as paid");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Paid</Badge>;
      case "Unpaid":
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pageTotalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const getPaidAmount = (bill: Bill) =>
    bill.paidAmount ?? (bill.status === "Paid" ? bill.amount : 0);
  const getDueAmount = (bill: Bill) =>
    bill.dueAmount ?? (bill.status === "Paid" ? 0 : bill.amount);
  const getAdvanceAmount = (bill: Bill) => bill.advanceAmount ?? 0;

  // ── Excel Columns ─────────────────────────────────────────────────────────
  const BILLING_IMPORT_HEADERS = [
    "CustomerCode",
    "CustomerName",
    "Month",
    "Year",
    "Amount",
    "PaidAmount",
    "Status",
    "InvoiceNumber",
  ];

  const BILLING_EXPORT_HEADERS = [
    "InvoiceNumber",
    "CustomerName",
    "CustomerCode",
    "Month",
    "Year",
    "Amount",
    "PaidAmount",
    "DueAmount",
    "AdvanceAmount",
    "Status",
    "PaymentDate",
    "PaymentMethod",
  ];

  const BILLING_SAMPLE = {
    CustomerCode: "C001",
    CustomerName: "John Doe",
    Month: new Date().getMonth() + 1,
    Year: new Date().getFullYear(),
    Amount: 500,
    PaidAmount: 0,
    Status: "Unpaid",
    InvoiceNumber: "",
  };

  const handleTemplate = () => {
    downloadTemplate(BILLING_IMPORT_HEADERS, BILLING_SAMPLE, "billing_import_template.xlsx");
  };

  const handleExport = async () => {
    try {
      const res = await getBills({ month: month && month !== "all" ? parseInt(month) : undefined, year: parseInt(year), status, search, limit: 10000 });
      const rows = res.bills.map((bill: Bill) => ({
        InvoiceNumber: bill.invoiceNumber,
        CustomerName: bill.customer?.name ?? "",
        CustomerCode: bill.customer?.customerCode ?? "",
        Month: bill.month,
        Year: bill.year,
        Amount: bill.amount,
        PaidAmount: getPaidAmount(bill),
        DueAmount: getDueAmount(bill),
        AdvanceAmount: getAdvanceAmount(bill),
        Status: bill.status,
        PaymentDate: bill.paymentDate ? new Date(bill.paymentDate).toISOString().split("T")[0] : "",
        PaymentMethod: bill.paymentMethod ?? "",
      }));
      exportToExcel(rows, BILLING_EXPORT_HEADERS, "Billing", `billing_export_${year}_${month || "all"}.xlsx`);
    } catch {
      toast.error("Failed to export billing data");
    }
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkImportBills(rows);
    loadBills();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Billing Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Invoices: <span className="font-bold text-slate-800">{total}</span> | Page Subtotal:{" "}
              <span className="font-bold text-emerald-600">৳{pageTotalAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            label="Billing"
            onTemplate={handleTemplate}
            onExport={handleExport}
            onImport={handleImport}
          />
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3e0078] hover:bg-[#52029d] text-white shadow-md shadow-purple-900/10 rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Generate Monthly Bills
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">Generate Monthly Bills</DialogTitle>
              </DialogHeader>
              <GenerateBillsForm onSubmit={handleGenerate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Pagination Limit Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-sm"
            />
          </div>
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full sm:w-[120px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[75px] rounded-xl border-slate-200 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Responsive Overflow Table */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Invoice #</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Period</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Paid</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Due</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Advance</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Payment Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-slate-400 py-10 text-sm">
                    No bills found
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow key={bill._id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-purple-900 whitespace-nowrap">
                      {bill.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-slate-800 whitespace-nowrap">
                      {bill.customer?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {new Date(0, bill.month - 1).toLocaleString("default", { month: "short" })} {bill.year}
                    </TableCell>
                    <TableCell className="font-bold text-sm text-slate-800 whitespace-nowrap">
                      ৳{bill.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold text-sm text-emerald-700 whitespace-nowrap">
                      ৳{getPaidAmount(bill).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold text-sm text-amber-700 whitespace-nowrap">
                      ৳{getDueAmount(bill).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-bold text-sm text-cyan-700 whitespace-nowrap">
                      ৳{getAdvanceAmount(bill).toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(bill.status)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {bill.status === "Unpaid" && (
                          <Dialog
                            open={isMarkPaidOpen && markingBill?._id === bill._id}
                            onOpenChange={(open) => {
                              setIsMarkPaidOpen(open);
                              if (!open) setMarkingBill(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs"
                                onClick={() => setMarkingBill(bill)}
                              >
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark Paid
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl bg-white rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-800">Mark Bill as Paid</DialogTitle>
                              </DialogHeader>
                              <MarkPaidForm bill={bill} onSubmit={handleMarkPaid} />
                            </DialogContent>
                          </Dialog>
                        )}
                        <InvoiceDownloader bill={bill} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-700">{bills.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
            <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-slate-700">{total}</span> invoices
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-slate-200 text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 font-medium">
              Page <span className="font-bold text-slate-800">{page}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-slate-200 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
