"use server";

import { connectToDatabase } from "@/lib/database";
import Package from "@/lib/database/models/package.model";
import Customer from "@/lib/database/models/customer.model";
import { revalidatePath } from "next/cache";

interface PackageDoc {
  _id: string;
  name: string;
  monthlyFee: number;
}

export async function getPackages() {
  await connectToDatabase();
  const packages = await Package.find({})
    .sort({ name: 1 })
    .lean<PackageDoc[]>();
  return JSON.parse(JSON.stringify(packages));
}

export async function createPackage(name: string, monthlyFee: number) {
  await connectToDatabase();
  const existing = await Package.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  })
    .select("_id")
    .lean<PackageDoc | null>();

  if (existing) throw new Error("Package already exists");

  const pkg = await Package.create({
    name,
    monthlyFee: monthlyFee ?? 0,
  });

  revalidatePath("/customers");
  revalidatePath("/settings");
  revalidatePath("/billing");
  return JSON.parse(JSON.stringify(pkg));
}

export async function deletePackage(id: string) {
  await connectToDatabase();
  const pkg = await Package.findById(id).lean<PackageDoc | null>();
  if (!pkg) throw new Error("Package not found");

  const inUseCount = await Customer.countDocuments({ packageName: pkg.name });
  if (inUseCount > 0) {
    throw new Error(
      `Cannot delete: "${pkg.name}" is used by ${inUseCount} customer(s). Reassign them first.`,
    );
  }

  await Package.findByIdAndDelete(id);
  revalidatePath("/customers");
  revalidatePath("/settings");
  revalidatePath("/billing");
}
