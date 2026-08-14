"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createIncome, updateIncome } from "@/lib/actions/income.actions";
import { getCategories, createCategory } from "@/lib/actions/category.actions";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { PAYMENT_METHODS } from "@/lib/constants";

interface Income {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

interface IncomeFormProps {
  income?: Income;
  onSuccess: () => void;
}

interface IncomeFormData {
  category: string;
  amount: number;
  incomeDate: string;
  paymentMethod: string;
  reference: string;
  description: string;
}

export default function IncomeForm({ income, onSuccess }: IncomeFormProps) {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);

  const form = useForm<IncomeFormData>({
    defaultValues: income
      ? {
          category: income.category,
          amount: income.amount,
          incomeDate: new Date(income.incomeDate).toISOString().split("T")[0],
          paymentMethod: income.paymentMethod,
          reference: income.reference ?? "",
          description: income.description ?? "",
        }
      : {
          category: "",
          amount: 0,
          incomeDate: new Date().toISOString().split("T")[0],
          paymentMethod: "",
          reference: "",
          description: "",
        },
  });

  useEffect(() => {
    getCategories("income").then(setCategories);
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const result = await createCategory(newCatName.trim(), "income");
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Failed to add category");
        return;
      }
      setCategories((prev) =>
        [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name))
      );
      form.setValue("category", result.data.name);
      setNewCatName("");
      setShowAddCat(false);
      toast.success("Category added");
    } catch {
      toast.error("Failed to add category");
    } finally {
      setAddingCat(false);
    }
  };

  const onSubmit = async (data: IncomeFormData) => {
    try {
      const payload = {
        ...data,
        incomeDate: new Date(data.incomeDate),
        reference: data.reference || undefined,
        description: data.description || undefined,
      };
      if (income) {
        await updateIncome(income._id, payload);
      } else {
        await createIncome(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving income:", error);
      toast.error("Failed to save income");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto space-y-4 pr-3 pb-4">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {showAddCat ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="New category name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddCategory())
                      }
                      className="h-8 text-sm"
                    />
                    <Button type="button" size="sm" onClick={handleAddCategory} disabled={addingCat}>
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddCat(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddCat(true)}
                    className="flex items-center gap-1 text-xs text-[#3e0078] hover:underline mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add new category
                  </button>
                )}
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            rules={{
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (৳)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="incomeDate"
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            rules={{ required: "Payment method is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reference (optional) */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Reference{" "}
                  <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Receipt #5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description (optional) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description{" "}
                  <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2 border-t">
          <Button type="submit" className="w-full">
            {income ? "Update Income" : "Add Income"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
