"use server";

import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/database/models/category.model";
import Expense from "@/lib/database/models/expense.model";
import Income from "@/lib/database/models/income.model";
import { revalidatePath } from "next/cache";

interface CategoryDoc {
  _id: string;
  name: string;
  type: "income" | "expense";
  isDefault: boolean;
}

export async function getCategories(type: "income" | "expense") {
  await connectToDatabase();
  const categories = await Category.find({ type })
    .sort({ name: 1 })
    .lean<CategoryDoc[]>();
  return JSON.parse(JSON.stringify(categories));
}

export async function createCategory(name: string, type: "income" | "expense") {
  await connectToDatabase();
  const existing = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    type,
  })
    .select("_id")
    .lean<CategoryDoc | null>();

  if (existing) throw new Error("Category already exists");
  const category = await Category.create({ name, type, isDefault: false });
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
  return JSON.parse(JSON.stringify(category));
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  const category = await Category.findById(id).lean<CategoryDoc | null>();
  if (!category) throw new Error("Category not found");

  const Model = category.type === "expense" ? Expense : Income;
  const inUseCount = await Model.countDocuments({ category: category.name });
  if (inUseCount > 0) {
    throw new Error(
      `Cannot delete: "${category.name}" is used by ${inUseCount} ${category.type} record(s). Reassign them first.`,
    );
  }

  await Category.findByIdAndDelete(id);
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
}
