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
import IncomeForm from "./IncomeForm";
import { getIncomes, deleteIncome } from "@/lib/actions/income.actions";
import { getCategories } from "@/lib/actions/category.actions";

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
}: {
  initialIncomes: Income[];
}) {
  const [incomes, setIncomes] = useState(initialIncomes);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    getCategories("income").then(setCategories);
  }, []);

  const loadIncomes = useCallback(async () => {
    const { incomes: newIncomes } = await getIncomes({
      search,
      category,
      month: month ? parseInt(month) : undefined,
      year: parseInt(year),
    });
    setIncomes(newIncomes);
  }, [search, category, month, year]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

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

  const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total:{" "}
            <span className="font-semibold text-green-600">
              ৳{totalAmount.toFixed(2)}
            </span>
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search by reference or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={category || "all"}
          onValueChange={(value) => setCategory(value === "all" ? "" : value)}
        >
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
        <Select value={month} onValueChange={setMonth}>
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
        <Select value={year} onValueChange={setYear}>
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
            {incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  No income entries found
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income._id}>
                  <TableCell>
                    <Badge variant="secondary">{income.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ৳{income.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(income.incomeDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{income.paymentMethod}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-gray-500">
                    {income.reference || "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500">
                    {income.description || "—"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog
                      open={isEditOpen && editingIncome?._id === income._id}
                      onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setEditingIncome(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingIncome(income)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle>Edit Income</DialogTitle>
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
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(income._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
