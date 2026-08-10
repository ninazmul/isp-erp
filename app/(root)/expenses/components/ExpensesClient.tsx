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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import ExpenseForm from "./ExpenseForm";
import { getExpenses, deleteExpense } from "@/lib/actions/expense.actions";
import { getCategories } from "@/lib/actions/category.actions";

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
    loadExpenses();
  }, [loadExpenses]);

  // Reset page to 1 when filters change
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

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total Items: <span className="font-semibold text-gray-800">{total}</span> | Page Subtotal:{" "}
            <span className="font-semibold text-red-600">৳{pageAmountTotal.toFixed(2)}</span>
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
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

      {/* Filters & Lazy Loading Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search reference or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-xs"
          />
          <Select value={category || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
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
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[120px]">
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

        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rows per page:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[80px]">
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-red-600">
                    ৳{expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-gray-500">
                    {expense.reference || "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500">
                    {expense.description || "—"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog
                      open={isEditOpen && editingExpense?._id === expense._id}
                      onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setEditingExpense(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingExpense(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle>Edit Expense</DialogTitle>
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
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(expense._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Server-Side Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t text-sm text-gray-600">
          <div>
            Showing <span className="font-medium">{expenses.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
            <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-medium">{total}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs px-2">
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
