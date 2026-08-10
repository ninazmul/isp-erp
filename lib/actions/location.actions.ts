"use server";

import { connectToDatabase } from "@/lib/database";
import Location from "@/lib/database/models/location.model";
import Customer from "@/lib/database/models/customer.model";
import { revalidatePath } from "next/cache";

interface LocationDoc {
  _id: string;
  name: string;
}

export async function getLocations() {
  await connectToDatabase();
  const locations = await Location.find({})
    .sort({ name: 1 })
    .lean<LocationDoc[]>();
  return JSON.parse(JSON.stringify(locations));
}

export async function createLocation(name: string) {
  await connectToDatabase();
  const existing = await Location.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  })
    .select("_id")
    .lean<LocationDoc | null>();

  if (existing) throw new Error("Location already exists");

  const location = await Location.create({ name });

  revalidatePath("/customers");
  revalidatePath("/settings");
  revalidatePath("/billing");
  return JSON.parse(JSON.stringify(location));
}

export async function deleteLocation(id: string) {
  await connectToDatabase();
  const location = await Location.findById(id).lean<LocationDoc | null>();
  if (!location) throw new Error("Location not found");

  const inUseCount = await Customer.countDocuments({ location: location.name });
  if (inUseCount > 0) {
    throw new Error(
      `Cannot delete: "${location.name}" is used by ${inUseCount} customer(s). Reassign them first.`,
    );
  }

  await Location.findByIdAndDelete(id);
  revalidatePath("/customers");
  revalidatePath("/settings");
  revalidatePath("/billing");
}
