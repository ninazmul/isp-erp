"use server";

import { connectToDatabase } from "@/lib/database";
import Income from "@/lib/database/models/income.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

interface IncomeDoc {
  _id: string;
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}

export async function createIncome(data: {
  category: string;
  amount: number;
  incomeDate: Date;
  paymentMethod: string;
  reference?: string;
  description?: string;
}) {
  await connectToDatabase();
  const income = await Income.create(data);
  revalidatePath("/income");
  return JSON.parse(JSON.stringify(income));
}

export async function getIncomes(params?: {
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

  const query: FilterQuery<IncomeDoc> = {};

  if (category) query.category = category;

  if (month || year) {
    const startDate = new Date(
      year || new Date().getFullYear(),
      (month || 1) - 1,
      1
    );
    const endDate = new Date(year || new Date().getFullYear(), month || 12, 0);
    query.incomeDate = { $gte: startDate, $lte: endDate };
  }

  if (search) {
    query.$or = [
      { reference: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const incomes = await Income.find<IncomeDoc>(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Income.countDocuments(query);

  return {
    incomes: JSON.parse(JSON.stringify(incomes)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateIncome(id: string, data: Partial<IncomeDoc>) {
  await connectToDatabase();
  const income = await Income.findByIdAndUpdate<IncomeDoc>(id, data, {
    new: true,
  });
  revalidatePath("/income");
  return JSON.parse(JSON.stringify(income));
}

export async function deleteIncome(id: string) {
  await connectToDatabase();
  await Income.findByIdAndDelete(id);
  revalidatePath("/income");
}
