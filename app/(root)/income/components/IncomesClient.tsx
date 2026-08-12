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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, TrendingUp, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import IncomeForm from "./IncomeForm";
import { getIncomes, deleteIncome, bulkCreateIncomes } from "@/lib/actions/income.actions";
import { getCategories } from "@/lib/actions/category.actions";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export default function IncomesClient({
  initialIncomes,
  initialTotal = 0,
  initialTotalPages = 1,
}: {
  initialIncomes: Income[];
  initialTotal?: number;
  initialTotalPages?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [incomes, setIncomes] = useState(initialIncomes);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    setMounted(true);
    getCategories("income").then(setCategories);
  }, []);

  const loadIncomes = useCallback(async () => {
    const res = await getIncomes({
      search,
      category,
      month: month && month !== "all" ? parseInt(month) : undefined,
      year: parseInt(year),
      page,
      limit,
    });
    setIncomes(res.incomes);
    setTotal(res.total);
    setTotalPages(res.totalPages || 1);
  }, [search, category, month, year, page, limit]);

  useEffect(() => {
    if (mounted) {
      loadIncomes();
    }
  }, [loadIncomes, mounted]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val === "all" ? "" : val);
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

  const handleLimitChange = (val: string) => {
    setLimit(parseInt(val));
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this income entry?")) {
      try {
        await deleteIncome(id);
        toast.success("Income deleted successfully");
        loadIncomes();
      } catch {
        toast.error("Failed to delete income");
      }
    }
  };

  const pageAmountTotal = incomes.reduce((sum, i) => sum + i.amount, 0);

  // ── Excel Columns ─────────────────────────────────────────────────────────
  const INCOME_HEADERS = [
    "Category",
    "Amount",
    "Date (YYYY-MM-DD)",
    "PaymentMethod",
    "Reference",
    "Description",
  ];

  const INCOME_SAMPLE = {
    Category: "Internet Service",
    Amount: 500,
    "Date (YYYY-MM-DD)": new Date().toISOString().split("T")[0],
    PaymentMethod: "Cash",
    Reference: "REC-001",
    Description: "Monthly subscription",
  };

  const handleTemplate = () => {
    downloadTemplate(INCOME_HEADERS, INCOME_SAMPLE, "income_import_template.xlsx");
  };

  const handleExport = async () => {
    try {
      const res = await getIncomes({ search, category, month: month && month !== "all" ? parseInt(month) : undefined, year: parseInt(year), limit: 10000 });
      const rows = res.incomes.map((inc: Income) => ({
        Category: inc.category,
        Amount: inc.amount,
        "Date (YYYY-MM-DD)": new Date(inc.incomeDate).toISOString().split("T")[0],
        PaymentMethod: inc.paymentMethod,
        Reference: inc.reference ?? "",
        Description: inc.description ?? "",
      }));
      exportToExcel(rows, INCOME_HEADERS, "Income", `income_export_${year}_${month || "all"}.xlsx`);
    } catch {
      toast.error("Failed to export income data");
    }
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkCreateIncomes(rows);
    loadIncomes();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Manual Income Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Receipts: <span className="font-bold text-slate-800">{total}</span> | Page Subtotal:{" "}
              <span className="font-bold text-emerald-600">৳{pageAmountTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            label="Income"
            onTemplate={handleTemplate}
            onExport={handleExport}
            onImport={handleImport}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3e0078] hover:bg-[#52029d] text-white shadow-md shadow-purple-900/10 rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">Add New Income Entry</DialogTitle>
              </DialogHeader>
              <IncomeForm
                onSuccess={() => {
                  setIsAddOpen(false);
                  loadIncomes();
                  toast.success("Income added successfully");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Row Limits */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search reference or description..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 text-sm"
            />
          </div>
          <Select value={category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-slate-200 text-sm">
              <SelectValue placeholder="Filter category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-slate-200 text-sm">
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
            <SelectTrigger className="w-full sm:w-[110px] rounded-xl border-slate-200 text-sm">
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
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Payment Method</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Reference</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-10 text-sm">
                    No income entries found
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income._id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                        {income.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-emerald-600 whitespace-nowrap">
                      ৳{income.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(income.incomeDate)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {income.paymentMethod}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500 max-w-[120px] truncate whitespace-nowrap">
                      {income.reference || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate whitespace-nowrap">
                      {income.description || "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Dialog
                          open={isEditOpen && editingIncome?._id === income._id}
                          onOpenChange={(open) => {
                            setIsEditOpen(open);
                            if (!open) setEditingIncome(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                              onClick={() => setEditingIncome(income)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold text-slate-800">Edit Income Entry</DialogTitle>
                            </DialogHeader>
                            <IncomeForm
                              income={editingIncome ?? undefined}
                              onSuccess={() => {
                                setIsEditOpen(false);
                                setEditingIncome(null);
                                loadIncomes();
                                toast.success("Income updated successfully");
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(income._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            Showing <span className="font-bold text-slate-700">{incomes.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
            <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-slate-700">{total}</span> entries
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
