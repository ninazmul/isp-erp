"use server";

import { connectToDatabase } from "@/lib/database";
import Reseller from "@/lib/database/models/reseller.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

interface ResellerDoc {
    _id: string;
    resellerCode: string;
    name: string;
    phone: string;
    email?: string;
    location: string;
    packageDesc?: string;
    monthlyFee: number;
    activeClients: number;
    inactiveClients: number;
    connectionDate: Date;
    status: string;
    notes?: string;
    isDeleted: boolean;
}

async function generateNextResellerCode(): Promise<string> {
    const resellers = await Reseller.find({ resellerCode: { $regex: /^RESL\d+$/i } })
        .select("resellerCode")
        .lean<{ resellerCode: string }[]>();

    let maxNum = 0;
    for (const r of resellers) {
        const num = parseInt(r.resellerCode.replace(/^RESL/i, ""), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    return `RESL${(maxNum + 1).toString().padStart(3, "0")}`;
}

export async function createReseller(data: {
    name: string;
    phone: string;
    email?: string;
    location: string;
    packageDesc?: string;
    monthlyFee: number;
    activeClients?: number;
    inactiveClients?: number;
    connectionDate: Date | string;
    status?: string;
    notes?: string;
}) {
    await connectToDatabase();

    const resellerCode = await generateNextResellerCode();

    const reseller = await Reseller.create({
        ...data,
        resellerCode,
        monthlyFee: Number(data.monthlyFee) || 0,
        activeClients: Number(data.activeClients) || 0,
        inactiveClients: Number(data.inactiveClients) || 0,
        connectionDate: data.connectionDate ? new Date(data.connectionDate) : new Date(),
        status: data.status || "Active",
        isDeleted: false,
    });

    revalidatePath("/resellers");
    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(reseller));
}

export async function getResellers(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    await connectToDatabase();

    const { search = "", status, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const query: FilterQuery<ResellerDoc> = { isDeleted: false };

    if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
            { name: regex },
            { phone: regex },
            { email: regex },
            { resellerCode: regex },
            { location: regex },
        ];
    }

    if (status && status !== "all") {
        query.status = status;
    }

    const [resellers, total] = await Promise.all([
        Reseller.find<ResellerDoc>(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Reseller.countDocuments(query),
    ]);

    return {
        resellers: JSON.parse(JSON.stringify(resellers)),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
}

export async function getResellerById(id: string) {
    await connectToDatabase();
    const reseller = await Reseller.findById<ResellerDoc>(id).lean();
    if (!reseller || reseller.isDeleted) throw new Error("Reseller not found");
    return JSON.parse(JSON.stringify(reseller));
}

export async function updateReseller(id: string, data: Partial<ResellerDoc>) {
    await connectToDatabase();

    const updateData: Record<string, unknown> = { ...data };
    if (data.monthlyFee !== undefined) updateData.monthlyFee = Number(data.monthlyFee) || 0;
    if (data.activeClients !== undefined) updateData.activeClients = Number(data.activeClients) || 0;
    if (data.inactiveClients !== undefined) updateData.inactiveClients = Number(data.inactiveClients) || 0;
    if (data.connectionDate !== undefined) updateData.connectionDate = new Date(data.connectionDate);

    const reseller = await Reseller.findByIdAndUpdate<ResellerDoc>(id, updateData, {
        new: true,
    }).lean();

    if (!reseller) throw new Error("Reseller not found");

    revalidatePath("/resellers");
    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(reseller));
}

export async function deleteReseller(id: string) {
    await connectToDatabase();
    await Reseller.findByIdAndUpdate(id, { isDeleted: true });
    revalidatePath("/resellers");
    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return { success: true };
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

export interface ResellerBulkImportResult {
    inserted: number;
    failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

export async function bulkCreateResellers(
    rows: Record<string, unknown>[]
): Promise<ResellerBulkImportResult> {
    await connectToDatabase();

    const existing = await Reseller.find({ resellerCode: { $regex: /^RESL\d+$/i } })
        .select("resellerCode")
        .lean<{ resellerCode: string }[]>();

    let nextNum = 1;
    for (const r of existing) {
        const num = parseInt(r.resellerCode.replace(/^RESL/i, ""), 10);
        if (!isNaN(num) && num >= nextNum) nextNum = num + 1;
    }

    let inserted = 0;
    const failed: ResellerBulkImportResult["failed"] = [];

    for (let i = 0; i < rows.length; i++) {
        const raw = rows[i];
        try {
            const resellerCode = `RESL${nextNum.toString().padStart(3, "0")}`;

            const name = safeParseString(
                getFlexibleField(raw, "Name", "name", "Reseller Name", "ResellerName"),
                `Reseller ${resellerCode}`
            );
            const phone = safeParseString(
                getFlexibleField(raw, "Phone", "phone", "Phone Number", "Mobile", "Contact"),
                "N/A"
            );
            const email =
                safeParseString(getFlexibleField(raw, "Email", "email", "Email Address"), "") ||
                undefined;
            const location = safeParseString(
                getFlexibleField(raw, "Location", "location", "Area", "Zone", "Address"),
                "N/A"
            );
            const packageDesc =
                safeParseString(
                    getFlexibleField(raw, "Package", "packageDesc", "Package Description", "Plan"),
                    ""
                ) || undefined;
            const monthlyFee = safeParseNumber(
                getFlexibleField(raw, "Monthly Fee (৳)", "Monthly Fee", "monthlyFee", "Fee", "Amount"),
                0
            );
            const activeClients = safeParseNumber(
                getFlexibleField(raw, "Active Clients", "activeClients", "Active"),
                0
            );
            const inactiveClients = safeParseNumber(
                getFlexibleField(raw, "Inactive Clients", "inactiveClients", "Inactive"),
                0
            );
            const connectionDate = safeParseDate(
                getFlexibleField(raw, "Connection Date (YYYY-MM-DD)", "Connection Date", "connectionDate", "Date"),
                new Date()
            );
            const VALID_STATUSES = ["Active", "Inactive"];
            const rawStatus = safeParseString(
                getFlexibleField(raw, "Status", "status"),
                "Active"
            );
            const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : "Active";
            const notes =
                safeParseString(getFlexibleField(raw, "Notes", "notes", "Remarks"), "") ||
                undefined;

            await Reseller.create({
                resellerCode,
                name,
                phone,
                email,
                location,
                packageDesc,
                monthlyFee,
                activeClients,
                inactiveClients,
                connectionDate,
                status,
                notes,
                isDeleted: false,
            });

            nextNum++;
            inserted++;
        } catch (err) {
            failed.push({
                row: i + 2,
                data: raw,
                reason: err instanceof Error ? err.message : "Unknown error",
            });
        }
    }

    revalidatePath("/resellers");
    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return { inserted, failed };
}
