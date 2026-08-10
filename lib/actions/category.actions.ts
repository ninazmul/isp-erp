"use server";

import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/database/models/category.model";
import { revalidatePath } from "next/cache";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Bandwidth",
  "Electricity",
  "Salary",
  "Maintenance",
  "Equipment",
  "Rent",
  "Transport",
  "Miscellaneous",
];

const DEFAULT_INCOME_CATEGORIES = [
  "Connection Fee",
  "Monthly Bill",
  "Service Charge",
  "Other",
];

async function seedDefaults(type: "income" | "expense") {
  const defaults =
    type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
  const count = await Category.countDocuments({ type });
  if (count === 0) {
    await Category.insertMany(
      defaults.map((name) => ({ name, type, isDefault: true }))
    );
  }
}

export async function getCategories(type: "income" | "expense") {
  await connectToDatabase();
  await seedDefaults(type);
  const categories = await Category.find({ type }).sort({ name: 1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function createCategory(name: string, type: "income" | "expense") {
  await connectToDatabase();
  const existing = await Category.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    type,
  });
  if (existing) throw new Error("Category already exists");
  const category = await Category.create({ name, type, isDefault: false });
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
  return JSON.parse(JSON.stringify(category));
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  if (category.isDefault) throw new Error("Cannot delete a default category");
  await Category.findByIdAndDelete(id);
  revalidatePath("/expenses");
  revalidatePath("/income");
  revalidatePath("/settings");
}
