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
import {
  Plus,
  Search,
  Receipt,
  CheckCircle2,
  Trash2,
  Calendar,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Wifi,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getResellerBills,
  generateResellerBills,
  markResellerBillAsPaid,
  updateResellerBill,
  deleteResellerBill,
  bulkImportResellerBills,
} from "@/lib/actions/reseller-bill.actions";
import GenerateResellerBillsForm from "./GenerateResellerBillsForm";
import MarkResellerPaidForm from "./MarkResellerPaidForm";
import EditResellerBillForm from "./EditResellerBillForm";
import ResellerInvoiceDownloader from "@/app/(root)/components/ResellerInvoiceDownloader";
import type { ResellerBill } from "@/types";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface ResellerBillingClientProps {
  initialBills: ResellerBill[];
  initialTotal: number;
  initialTotalPages: number;
}

export default function ResellerBillingClient({
  initialBills,
  initialTotal = 0,
  initialTotalPages = 1,
}: ResellerBillingClientProps) {
  const [mounted, setMounted] = useState(false);
  const [bills, setBills] = useState<ResellerBill[]>(initialBills);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [payingBill, setPayingBill] = useState<ResellerBill | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const [editingBill, setEditingBill] = useState<ResellerBill | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await getResellerBills({
        search,
        status: status && status !== "all" ? status : undefined,
        month: month && month !== "all" ? parseInt(month) : undefined,
        year: year && year !== "all" ? parseInt(year) : undefined,
        page,
        limit,
      });
      setBills(res.bills);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load reseller bills");
    }
  }, [search, status, month, year, page, limit]);

  useEffect(() => {
    if (mounted) loadData();
  }, [loadData, mounted]);

  const handleGenerate = async (data: { month: number; year: number }) => {
    setIsGenerating(true);
    try {
      const res = await generateResellerBills(data.month, data.year);
      if (res.generated === 0 && res.skipped === 0) {
        toast.error("No active resellers found to generate bills for");
      } else {
        toast.success(
          `Generated ${res.generated} reseller bills (${res.skipped} already existed)`
        );
      }
      setIsGenerateOpen(false);
      setMonth(data.month.toString());
      setYear(data.year.toString());
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate bills");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkPaid = async (data: {
    amount?: number;
    paymentDate: string;
    paymentMethod: string;
    remarks?: string;
  }) => {
    if (!payingBill) return;
    setIsSubmittingPay(true);
    try {
      await markResellerBillAsPaid(payingBill._id, data);
      toast.success("Payment recorded successfully");
      setIsPayOpen(false);
      setPayingBill(null);
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to record payment");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleUpdateBill = async (data: {
    amount: number;
    status: "Paid" | "Unpaid";
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }) => {
    if (!editingBill) return;
    setIsSubmittingEdit(true);
    try {
      await updateResellerBill(editingBill._id, data);
      toast.success("Bill updated successfully");
      setIsEditOpen(false);
      setEditingBill(null);
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update bill");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) return;
    try {
      await deleteResellerBill(id);
      toast.success("Invoice deleted");
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete bill");
    }
  };

  // -------------------------------------------------------------------------
  // Excel Import / Export
  // -------------------------------------------------------------------------

  const handleExport = () => {
    if (bills.length === 0) {
      toast.error("No reseller bills to export");
      return;
    }
    const headers = [
      "Invoice Number",
      "Reseller Code",
      "Reseller Name",
      "Phone",
      "Location",
      "Package / Bandwidth",
      "Month",
      "Year",
      "Bill Amount",
      "Status",
      "Payment Date",
      "Payment Method",
      "Remarks",
    ];
    const exportRows = bills.map((b) => ({
      "Invoice Number": b.invoiceNumber,
      "Reseller Code": b.reseller?.resellerCode || "",
      "Reseller Name": b.reseller?.name || "",
      Phone: b.reseller?.phone || "",
      Location: b.reseller?.location || "",
      "Package / Bandwidth": b.reseller?.packageDesc || "",
      Month: new Date(0, b.month - 1).toLocaleString("default", { month: "long" }),
      Year: b.year,
      "Bill Amount": b.amount,
      Status: b.status,
      "Payment Date": b.paymentDate ? formatDate(b.paymentDate) : "",
      "Payment Method": b.paymentMethod || "",
      Remarks: b.remarks || "",
    }));
    exportToExcel(
      exportRows,
      headers,
      "Reseller_Bills",
      `ISP_Reseller_Bills_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Reseller bills exported");
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Reseller Code",
      "Reseller Name",
      "Month",
      "Year",
      "Amount",
      "Status",
      "Invoice Number",
    ];
    const sampleRow = {
      "Reseller Code": "RESL001",
      "Reseller Name": "Dhaka Fiber Networks",
      Month: new Date().getMonth() + 1,
      Year: new Date().getFullYear(),
      Amount: 15000,
      Status: "Unpaid",
      "Invoice Number": "",
    };
    downloadTemplate(headers, sampleRow, "Reseller_Bills_Import_Template.xlsx");
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkImportResellerBills(rows);
    loadData();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-50 text-violet-700">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Reseller Billing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly reseller bill cycles with customizable amounts per partner
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            onImport={handleImport}
            onExport={handleExport}
            onTemplate={handleDownloadTemplate}
            label="Reseller Bill"
          />

          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-700 to-purple-600 hover:from-violet-800 hover:to-purple-700 text-white rounded-xl shadow-md font-bold text-xs h-9">
                <Plus className="mr-1.5 h-4 w-4" /> Generate Reseller Bills
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-700" />
                  Generate Monthly Reseller Bills
                </DialogTitle>
              </DialogHeader>
              <GenerateResellerBillsForm
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search invoice or reseller..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 rounded-xl border-slate-200 text-xs h-9"
            />
          </div>

          {/* Month */}
          <Select
            value={month}
            onValueChange={(val) => {
              setMonth(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Months" />
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

          {/* Year */}
          <Select
            value={year}
            onValueChange={(val) => {
              setYear(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val === "all" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 text-xs h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid Only</SelectItem>
              <SelectItem value="Unpaid">Unpaid Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bills Table */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs font-bold text-slate-700">Invoice</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Reseller Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Billing Period</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Bill Amount</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-700">Payment Details</TableHead>
                <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-slate-400 text-xs">
                    No reseller billing records found. Click &quot;Generate Reseller Bills&quot; to begin.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => {
                  const isPaid = bill.status === "Paid";

                  return (
                    <TableRow key={bill._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Invoice */}
                      <TableCell className="font-mono text-xs font-extrabold text-violet-700">
                        {bill.invoiceNumber}
                      </TableCell>

                      {/* Reseller Info */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">
                            {bill.reseller?.name ?? "Unknown Reseller"}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                            <span className="font-mono text-violet-600 font-semibold">
                              {bill.reseller?.resellerCode}
                            </span>
                            {bill.reseller?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {bill.reseller.phone}
                              </span>
                            )}
                            {bill.reseller?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {bill.reseller.location}
                              </span>
                            )}
                          </div>
                          {bill.reseller?.packageDesc && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <Wifi className="w-3 h-3 text-slate-400" />
                              <span>{bill.reseller.packageDesc}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Billing Period */}
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-700">
                          {new Date(0, bill.month - 1).toLocaleString("default", {
                            month: "short",
                          })}{" "}
                          {bill.year}
                        </span>
                      </TableCell>

                      {/* Bill Amount — editable */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900">
                            ৳{bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingBill(bill);
                              setIsEditOpen(true);
                            }}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-violet-700 rounded-md"
                            title="Edit Bill Amount"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                              : "bg-rose-100 text-rose-800 border-rose-200 font-bold text-[10px] px-2 py-0.5 rounded-md"
                          }
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>

                      {/* Payment Details */}
                      <TableCell>
                        {isPaid ? (
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-emerald-700">
                              {bill.paymentDate ? formatDate(bill.paymentDate) : "Paid"}
                            </span>
                            {bill.paymentMethod && (
                              <p className="text-[10px] text-slate-400">
                                via {bill.paymentMethod}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Pending Payment</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Collect / Mark Paid Button */}
                          {!isPaid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPayingBill(bill);
                                setIsPayOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="Mark as Paid"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Edit Bill */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingBill(bill);
                              setIsEditOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg"
                            title="Edit Bill Amount & Details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Invoice PDF / Print */}
                          <ResellerInvoiceDownloader bill={bill} />

                          {/* Delete Bill */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(bill._id, bill.invoiceNumber)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Bill"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/40 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Showing</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(parseInt(val, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 rounded-lg text-xs bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>of {total} bills</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 w-7 p-0 rounded-lg border-slate-200 bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="font-semibold text-slate-700 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 w-7 p-0 rounded-lg border-slate-200 bg-white"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Mark Paid Dialog */}
      <Dialog
        open={isPayOpen}
        onOpenChange={(open) => {
          setIsPayOpen(open);
          if (!open) setPayingBill(null);
        }}
      >
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Confirm Payment — {payingBill?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {payingBill && (
            <MarkResellerPaidForm
              bill={payingBill}
              onSubmit={handleMarkPaid}
              isLoading={isSubmittingPay}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingBill(null);
        }}
      >
        <DialogContent className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-violet-700" />
              Edit Reseller Bill
            </DialogTitle>
          </DialogHeader>
          {editingBill && (
            <EditResellerBillForm
              bill={editingBill}
              onSubmit={handleUpdateBill}
              isLoading={isSubmittingEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
