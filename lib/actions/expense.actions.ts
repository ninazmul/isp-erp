"use server";

import { connectToDatabase } from "@/lib/database";
import Expense from "@/lib/database/models/expense.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

interface ExpenseDoc {
  _id: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export async function createExpense(data: {
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  reference?: string;
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
      1
    );
    const endDate = new Date(
      year || new Date().getFullYear(),
      month ? month : 12,
      month ? 0 : 31,
      23,
      59,
      59,
      999
    );
    query.expenseDate = { $gte: startDate, $lte: endDate };
  }

  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ reference: regex }, { description: regex }];
  }

  const [expenses, total] = await Promise.all([
    Expense.find<ExpenseDoc>(query)
      .sort({ expenseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Expense.countDocuments(query),
  ]);

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
  }).lean();
  revalidatePath("/expenses");
  return JSON.parse(JSON.stringify(expense));
}

export async function deleteExpense(id: string) {
  await connectToDatabase();
  await Expense.findByIdAndDelete(id);
  revalidatePath("/expenses");
}
