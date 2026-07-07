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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import ExpenseForm from "./ExpenseForm";
import { getExpenses, deleteExpense } from "@/lib/actions/expense.actions";

// Define types
interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  description?: string;
}

export default function ExpensesClient({
  initialExpenses,
}: {
  initialExpenses: Expense[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadExpenses = useCallback(async () => {
    const { expenses: newExpenses } = await getExpenses({
      search,
      category,
      month: month ? parseInt(month) : undefined,
      year: parseInt(year),
    });
    setExpenses(newExpenses);
  }, [search, category, month, year]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

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

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Bandwidth":
        return "default";
      case "Electricity":
        return "secondary";
      case "Salary":
        return "default";
      case "Maintenance":
        return "secondary";
      case "Equipment":
        return "default";
      case "Rent":
        return "secondary";
      case "Transport":
        return "default";
      case "Miscellaneous":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="Bandwidth">Bandwidth</SelectItem>
            <SelectItem value="Electricity">Electricity</SelectItem>
            <SelectItem value="Salary">Salary</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Rent">Rent</SelectItem>
            <SelectItem value="Transport">Transport</SelectItem>
            <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
          </SelectContent>
        </Select>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i,
            ).map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Expense Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{expense.title}</TableCell>
                <TableCell>
                  <Badge variant={getCategoryBadgeColor(expense.category)}>
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell>৳{expense.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {expense.description}
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
                    <DialogContent className="max-w-2xl">
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
