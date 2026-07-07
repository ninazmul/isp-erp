"use client";

import { useForm } from "react-hook-form";
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
import { createExpense, updateExpense } from "@/lib/actions/expense.actions";

// Define types
interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  description?: string;
}

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess: () => void;
}

interface ExpenseFormData {
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
}

export default function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    defaultValues: expense
      ? {
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          expenseDate: new Date(expense.expenseDate)
            .toISOString()
            .split("T")[0],
          description: expense.description ?? "",
        }
      : {
          title: "",
          category: "",
          amount: 0,
          expenseDate: new Date().toISOString().split("T")[0],
          description: "",
        },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (expense) {
        await updateExpense(expense._id, {
          ...data,
          expenseDate: new Date(data.expenseDate),
        });
      } else {
        await createExpense({
          ...data,
          expenseDate: new Date(data.expenseDate),
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Expense title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          rules={{ required: "Amount is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
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

        <FormField
          control={form.control}
          name="expenseDate"
          rules={{ required: "Expense date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Expense description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {expense ? "Update Expense" : "Add Expense"}
        </Button>
      </form>
    </Form>
  );
}
