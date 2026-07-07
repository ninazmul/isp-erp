"use server";

import { connectToDatabase } from "@/lib/database";
import Expense from "@/lib/database/models/expense.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

// Define types
interface ExpenseDoc {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  description?: string;
}

export async function createExpense(data: {
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  description?: string;
}) {
  await connectToDatabase();

  const expense = await Expense.create(data);

  revalidatePath("/expenses");
  return JSON.parse(JSON.stringify(expense));
}

export async function getExpenses(params?: {
  category?: string;
  month?: number;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();

  const {
    category,
    month,
    year,
    search = "",
    page = 1,
    limit = 10,
  } = params || {};
  const skip = (page - 1) * limit;

  const query: FilterQuery<ExpenseDoc> = {};

  if (category) query.category = category;

  if (month || year) {
    const startDate = new Date(
      year || new Date().getFullYear(),
      (month || 1) - 1,
      1,
    );
    const endDate = new Date(year || new Date().getFullYear(), month || 12, 0);
    query.expenseDate = { $gte: startDate, $lte: endDate };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const expenses = await Expense.find<ExpenseDoc>(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);

  return {
    expenses: JSON.parse(JSON.stringify(expenses)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateExpense(id: string, data: Partial<ExpenseDoc>) {
  await connectToDatabase();
  const expense = await Expense.findByIdAndUpdate<ExpenseDoc>(id, data, {
    new: true,
  });
  revalidatePath("/expenses");
  return JSON.parse(JSON.stringify(expense));
}

export async function deleteExpense(id: string) {
  await connectToDatabase();
  await Expense.findByIdAndDelete(id);
  revalidatePath("/expenses");
}
