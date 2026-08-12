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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Wallet, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import ExpenseForm from "./ExpenseForm";
import { getExpenses, deleteExpense, bulkCreateExpenses } from "@/lib/actions/expense.actions";
import { getCategories } from "@/lib/actions/category.actions";
import ExcelImportExport, { type ImportResult } from "@/components/shared/ExcelImportExport";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { formatDate } from "@/lib/utils";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export default function ExpensesClient({
  initialExpenses,
  initialTotal = 0,
  initialTotalPages = 1,
}: {
  initialExpenses: Expense[];
  initialTotal?: number;
  initialTotalPages?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState(initialExpenses);
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    setMounted(true);
    getCategories("expense").then(setCategories);
  }, []);

  const loadExpenses = useCallback(async () => {
    const res = await getExpenses({
      search,
      category,
      month: month && month !== "all" ? parseInt(month) : undefined,
      year: parseInt(year),
      page,
      limit,
    });
    setExpenses(res.expenses);
    setTotal(res.total);
    setTotalPages(res.totalPages || 1);
  }, [search, category, month, year, page, limit]);

  useEffect(() => {
    if (mounted) {
      loadExpenses();
    }
  }, [loadExpenses, mounted]);

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
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        toast.success("Expense deleted successfully");
        loadExpenses();
      } catch {
        toast.error("Failed to delete expense");
      }
    }
  };

  const pageAmountTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  // ── Excel Columns ─────────────────────────────────────────────────────────
  const EXPENSE_HEADERS = [
    "Category",
    "Amount",
    "Date (YYYY-MM-DD)",
    "PaymentMethod",
    "Reference",
    "Description",
  ];

  const EXPENSE_SAMPLE = {
    Category: "Office Supplies",
    Amount: 1200,
    "Date (YYYY-MM-DD)": new Date().toISOString().split("T")[0],
    PaymentMethod: "Cash",
    Reference: "EXP-001",
    Description: "Monthly office expense",
  };

  const handleTemplate = () => {
    downloadTemplate(EXPENSE_HEADERS, EXPENSE_SAMPLE, "expense_import_template.xlsx");
  };

  const handleExport = async () => {
    try {
      const res = await getExpenses({ search, category, month: month && month !== "all" ? parseInt(month) : undefined, year: parseInt(year), limit: 10000 });
      const rows = res.expenses.map((exp: Expense) => ({
        Category: exp.category,
        Amount: exp.amount,
        "Date (YYYY-MM-DD)": new Date(exp.expenseDate).toISOString().split("T")[0],
        PaymentMethod: exp.paymentMethod,
        Reference: exp.reference ?? "",
        Description: exp.description ?? "",
      }));
      exportToExcel(rows, EXPENSE_HEADERS, "Expenses", `expense_export_${year}_${month || "all"}.xlsx`);
    } catch {
      toast.error("Failed to export expense data");
    }
  };

  const handleImport = async (rows: Record<string, unknown>[]): Promise<ImportResult> => {
    const result = await bulkCreateExpenses(rows);
    loadExpenses();
    return result;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Expense Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Records: <span className="font-bold text-slate-800">{total}</span> | Page Subtotal:{" "}
              <span className="font-bold text-rose-600">৳{pageAmountTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExcelImportExport
            label="Expenses"
            onTemplate={handleTemplate}
            onExport={handleExport}
            onImport={handleImport}
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3e0078] hover:bg-[#52029d] text-white shadow-md shadow-purple-900/10 rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onSuccess={() => {
                  setIsAddOpen(false);
                  loadExpenses();
                  toast.success("Expense added successfully");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Limit Controls */}
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
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-10 text-sm">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense._id} className="hover:bg-slate-50/60 border-slate-100 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-rose-600 whitespace-nowrap">
                      ৳{expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(expense.expenseDate)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {expense.paymentMethod}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500 max-w-[120px] truncate whitespace-nowrap">
                      {expense.reference || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate whitespace-nowrap">
                      {expense.description || "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Dialog
                          open={isEditOpen && editingExpense?._id === expense._id}
                          onOpenChange={(open) => {
                            setIsEditOpen(open);
                            if (!open) setEditingExpense(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-bold text-slate-800">Edit Expense</DialogTitle>
                            </DialogHeader>
                            <ExpenseForm
                              expense={editingExpense ?? undefined}
                              onSuccess={() => {
                                setIsEditOpen(false);
                                setEditingExpense(null);
                                loadExpenses();
                                toast.success("Expense updated successfully");
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(expense._id)}
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
            Showing <span className="font-bold text-slate-700">{expenses.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
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
