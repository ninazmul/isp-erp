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

// ---------------------------------------------------------------------------
// Bulk Import
// ---------------------------------------------------------------------------

import {
  getFlexibleField,
  safeParseDate,
  safeParseNumber,
  safeParseString,
} from "@/lib/excel";

export interface ExpenseBulkImportResult {
  inserted: number;
  failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

/**
 * Bulk-creates expense records from an array of raw row objects (parsed from Excel).
 * - Each row is processed independently; a failure never aborts the loop.
 * - Missing/invalid/mis-typed fields are safely converted and replaced with defaults.
 */
export async function bulkCreateExpenses(
  rows: Record<string, unknown>[]
): Promise<ExpenseBulkImportResult> {
  await connectToDatabase();

  const DEFAULT_CATEGORY = "Uncategorized";
  const DEFAULT_PAYMENT_METHOD = "Cash";

  let inserted = 0;
  const failed: ExpenseBulkImportResult["failed"] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    try {
      // ---- Extract with flexible header matching & type coercion ----
      const rawCategory = getFlexibleField(raw, "Category", "category", "Category Name");
      const category = safeParseString(rawCategory, DEFAULT_CATEGORY);

      const rawAmount = getFlexibleField(raw, "Amount", "amount", "Total");
      const amount = safeParseNumber(rawAmount, 0);

      const rawDate = getFlexibleField(raw, "Date (YYYY-MM-DD)", "Date", "expenseDate", "Expense Date");
      const expenseDate = safeParseDate(rawDate, new Date());

      const VALID_PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mobile Banking", "Cheque"];
      const rawMethod = safeParseString(
        getFlexibleField(raw, "PaymentMethod", "Payment Method", "paymentMethod", "Method"),
        DEFAULT_PAYMENT_METHOD
      );

      const paymentMethod = VALID_PAYMENT_METHODS.includes(rawMethod)
        ? rawMethod
        : DEFAULT_PAYMENT_METHOD;

      const rawRef = getFlexibleField(raw, "Reference", "reference", "Ref", "Voucher");
      const reference = safeParseString(rawRef, "") || undefined;

      const rawDesc = getFlexibleField(raw, "Description", "description", "Desc", "Notes");
      const description = safeParseString(rawDesc, "") || undefined;

      await Expense.create({
        category,
        amount,
        expenseDate,
        paymentMethod,
        reference,
        description,
      });

      inserted++;
    } catch (err) {
      failed.push({
        row: i + 2,
        data: raw,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  revalidatePath("/expenses");
  return { inserted, failed };
}
