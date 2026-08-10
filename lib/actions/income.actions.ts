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
    const endDate = new Date(
      year || new Date().getFullYear(),
      month ? month : 12,
      month ? 0 : 31,
      23,
      59,
      59,
      999
    );
    query.incomeDate = { $gte: startDate, $lte: endDate };
  }

  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ reference: regex }, { description: regex }];
  }

  const [incomes, total] = await Promise.all([
    Income.find<IncomeDoc>(query)
      .sort({ incomeDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Income.countDocuments(query),
  ]);

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
  }).lean();
  revalidatePath("/income");
  return JSON.parse(JSON.stringify(income));
}

export async function deleteIncome(id: string) {
  await connectToDatabase();
  await Income.findByIdAndDelete(id);
  revalidatePath("/income");
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

export interface IncomeBulkImportResult {
  inserted: number;
  failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

/**
 * Bulk-creates income records from an array of raw row objects (parsed from Excel).
 * - Each row is processed independently; a failure never aborts the loop.
 * - Missing/invalid/mis-typed fields are safely converted and replaced with defaults.
 */
export async function bulkCreateIncomes(
  rows: Record<string, unknown>[]
): Promise<IncomeBulkImportResult> {
  await connectToDatabase();

  const DEFAULT_CATEGORY = "Uncategorized";
  const DEFAULT_PAYMENT_METHOD = "Cash";

  let inserted = 0;
  const failed: IncomeBulkImportResult["failed"] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    try {
      // ---- Extract with flexible header matching & type coercion ----
      const rawCategory = getFlexibleField(raw, "Category", "category", "Category Name");
      const category = safeParseString(rawCategory, DEFAULT_CATEGORY);

      const rawAmount = getFlexibleField(raw, "Amount", "amount", "Total");
      const amount = safeParseNumber(rawAmount, 0);

      const rawDate = getFlexibleField(raw, "Date (YYYY-MM-DD)", "Date", "incomeDate", "Income Date");
      const incomeDate = safeParseDate(rawDate, new Date());

      const VALID_PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mobile Banking", "Cheque"];
      const rawMethod = safeParseString(
        getFlexibleField(raw, "PaymentMethod", "Payment Method", "paymentMethod", "Method"),
        DEFAULT_PAYMENT_METHOD
      );

      const paymentMethod = VALID_PAYMENT_METHODS.includes(rawMethod)
        ? rawMethod
        : DEFAULT_PAYMENT_METHOD;

      const rawRef = getFlexibleField(raw, "Reference", "reference", "Ref", "Receipt");
      const reference = safeParseString(rawRef, "") || undefined;

      const rawDesc = getFlexibleField(raw, "Description", "description", "Desc", "Notes");
      const description = safeParseString(rawDesc, "") || undefined;

      await Income.create({
        category,
        amount,
        incomeDate,
        paymentMethod,
        reference,
        description,
      });

      inserted++;
    } catch (err) {
      failed.push({
        row: i + 2, // +2 because row 1 is headers, and i is 0-indexed
        data: raw,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  revalidatePath("/income");
  return { inserted, failed };
}
