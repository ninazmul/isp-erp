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
  const trimmedName = name.trim();

  const existing = await Category.findOne({
    name: { $regex: `^${trimmedName}$`, $options: "i" },
    type,
  })
    .select("_id")
    .lean<CategoryDoc | null>();

  if (existing) throw new Error("Category already exists");
  const category = await Category.create({ name: trimmedName, type, isDefault: false });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
  return JSON.parse(JSON.stringify(category));
}

export async function updateCategory(id: string, newName: string) {
  await connectToDatabase();
  const trimmedName = newName.trim();
  if (!trimmedName) throw new Error("Category name cannot be empty");

  const category = await Category.findById(id).lean<CategoryDoc | null>();
  if (!category) throw new Error("Category not found");

  const oldName = category.name;

  if (oldName.toLowerCase() !== trimmedName.toLowerCase()) {
    const existing = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: `^${trimmedName}$`, $options: "i" },
      type: category.type,
    })
      .select("_id")
      .lean<CategoryDoc | null>();

    if (existing) throw new Error(`Category "${trimmedName}" already exists`);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name: trimmedName },
    { new: true }
  ).lean();

  // Synchronize category name on all existing records if name changed
  if (oldName !== trimmedName) {
    const Model = category.type === "expense" ? Expense : Income;
    await Model.updateMany(
      { category: oldName },
      { $set: { category: trimmedName } }
    );
  }

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");

  return JSON.parse(JSON.stringify(updatedCategory));
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  const category = await Category.findById(id).lean<CategoryDoc | null>();
  if (!category) throw new Error("Category not found");

  const Model = category.type === "expense" ? Expense : Income;
  const inUseCount = await Model.countDocuments({ category: category.name });
  if (inUseCount > 0) {
    throw new Error(
      `Cannot delete: "${category.name}" is used by ${inUseCount} ${category.type} record(s). Reassign them first.`
    );
  }

  await Category.findByIdAndDelete(id);
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
}
