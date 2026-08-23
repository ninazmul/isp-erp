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
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Location name is required");

    const existing = await Location.findOne({
        name: { $regex: `^${trimmedName}$`, $options: "i" },
    })
        .select("_id")
        .lean<LocationDoc | null>();

    if (existing) throw new Error("Location already exists");

    const location = await Location.create({ name: trimmedName });

    revalidatePath("/customers");
    revalidatePath("/settings");
    revalidatePath("/billing");
    return JSON.parse(JSON.stringify(location));
}

export async function updateLocation(id: string, name: string) {
    await connectToDatabase();
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Location name is required");

    const loc = await Location.findById(id);
    if (!loc) throw new Error("Location not found");

    const existing = await Location.findOne({
        _id: { $ne: id },
        name: { $regex: `^${trimmedName}$`, $options: "i" },
    })
        .select("_id")
        .lean<LocationDoc | null>();

    if (existing) throw new Error("Another location with this name already exists");

    const oldName = loc.name;
    loc.name = trimmedName;
    await loc.save();

    // If location name changed, update existing active customers with the old location
    if (oldName !== trimmedName) {
        await Customer.updateMany(
            { location: oldName },
            { $set: { location: trimmedName } }
        );
    }

    revalidatePath("/customers");
    revalidatePath("/settings");
    revalidatePath("/billing");
    return JSON.parse(JSON.stringify(loc));
}

export async function deleteLocation(id: string) {
    await connectToDatabase();
    const location = await Location.findById(id).lean<LocationDoc | null>();
    if (!location) throw new Error("Location not found");

    const inUseCount = await Customer.countDocuments({
        location: location.name,
        isDeleted: false,
    });
    if (inUseCount > 0) {
        throw new Error(
            `Cannot delete: "${location.name}" is used by ${inUseCount} active customer(s). Reassign them first.`
        );
    }

    await Location.findByIdAndDelete(id);
    revalidatePath("/customers");
    revalidatePath("/settings");
    revalidatePath("/billing");
    return { success: true };
}