"use server";

import { connectToDatabase } from "@/lib/database";
import ResellerBill from "@/lib/database/models/reseller-bill.model";
import Reseller from "@/lib/database/models/reseller.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

const RINV_PREFIX = "RINV";

interface RawResellerDoc {
    _id: { toString(): string } | string;
    monthlyFee: number;
}

async function getNextRInvSequence(): Promise<number> {
    const bills = await ResellerBill.find({ invoiceNumber: { $regex: /^RINV\d+$/i } })
        .select("invoiceNumber")
        .lean<{ invoiceNumber: string }[]>();

    let maxSeq = 0;
    for (const b of bills) {
        const num = parseInt(b.invoiceNumber.replace(/^RINV/i, ""), 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
    }
    return maxSeq + 1;
}

export async function generateResellerBills(month: number, year: number) {
    await connectToDatabase();

    const activeResellers = await Reseller.find({
        status: "Active",
        isDeleted: false,
    })
        .select("_id monthlyFee")
        .lean<RawResellerDoc[]>();

    if (activeResellers.length === 0) {
        return { generated: 0, skipped: 0 };
    }

    const existingBills = await ResellerBill.find({ month, year })
        .select("reseller")
        .lean<{ reseller: { toString(): string } }[]>();

    const existingResellerSet = new Set(
        existingBills.map((b) => b.reseller.toString())
    );

    let invoiceSeq = await getNextRInvSequence();
    const bulkOps = [];
    let skipped = 0;

    for (const reseller of activeResellers) {
        const resellerIdStr = reseller._id.toString();
        if (existingResellerSet.has(resellerIdStr)) {
            skipped++;
            continue;
        }

        const invoiceNumber = `${RINV_PREFIX}${invoiceSeq.toString().padStart(6, "0")}`;
        invoiceSeq++;

        const monthlyFee = Number(reseller.monthlyFee) || 0;

        bulkOps.push({
            insertOne: {
                document: {
                    reseller: reseller._id,
                    month,
                    year,
                    amount: monthlyFee,
                    paidAmount: 0,
                    dueAmount: 0,
                    advanceAmount: 0,
                    status: "Unpaid",
                    invoiceNumber,
                },
            },
        });
    }

    if (bulkOps.length > 0) {
        await ResellerBill.bulkWrite(bulkOps);
    }

    revalidatePath("/reseller-billing");
    revalidatePath("/resellers");
    revalidatePath("/");
    return { generated: bulkOps.length, skipped };
}

export async function getResellerBills(params?: {
    month?: number;
    year?: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    await connectToDatabase();

    const {
        month,
        year,
        status,
        search = "",
        page = 1,
        limit = 10,
    } = params || {};
    const skip = (page - 1) * limit;

    const query: FilterQuery<unknown> = {};

    if (month && month !== 0) query.month = month;
    if (year) query.year = year;
    if (status && status !== "all") query.status = status;

    if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        const matchingResellers = await Reseller.find({
            $or: [{ name: regex }, { resellerCode: regex }, { phone: regex }, { location: regex }],
        })
            .select("_id")
            .lean<{ _id: string }[]>();
        const resellerIds = matchingResellers.map((r) => r._id);

        query.$or = [
            { invoiceNumber: regex },
            { reseller: { $in: resellerIds } },
        ];
    }

    const [bills, total] = await Promise.all([
        ResellerBill.find(query)
            .populate(
                "reseller",
                "name resellerCode phone monthlyFee status location packageDesc activeClients inactiveClients email"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ResellerBill.countDocuments(query),
    ]);

    return {
        bills: JSON.parse(JSON.stringify(bills)),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
}

export async function updateResellerBill(
    id: string,
    data: {
        amount?: number;
        status?: "Paid" | "Unpaid";
        paymentDate?: Date | string | null;
        paymentMethod?: string;
        remarks?: string;
    }
) {
    await connectToDatabase();

    const updateData: Record<string, unknown> = {};

    if (data.amount !== undefined) {
        const amount = Number(data.amount);
        if (isNaN(amount) || amount < 0) {
            throw new Error("Amount must be a non-negative number");
        }
        updateData.amount = amount;
    }

    if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === "Paid") {
            if (data.amount !== undefined) {
                updateData.paidAmount = data.amount;
            }
        } else {
            updateData.paidAmount = 0;
        }
    }

    if (data.paymentDate !== undefined) {
        updateData.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    }

    if (data.paymentMethod !== undefined) {
        updateData.paymentMethod = data.paymentMethod;
    }

    if (data.remarks !== undefined) {
        updateData.remarks = data.remarks;
    }

    const bill = await ResellerBill.findByIdAndUpdate(id, updateData, {
        new: true,
    }).populate("reseller").lean();

    if (!bill) throw new Error("Reseller bill not found");

    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(bill));
}

export async function markResellerBillAsPaid(
    id: string,
    data: {
        amount?: number;
        paymentDate: Date | string;
        paymentMethod: string;
        remarks?: string;
    }
) {
    await connectToDatabase();

    const existingBill = await ResellerBill.findById(id).select("amount").lean<{ amount: number } | null>();
    if (!existingBill) throw new Error("Reseller bill not found");

    const amount = data.amount !== undefined ? Number(data.amount) : Number(existingBill.amount);

    const bill = await ResellerBill.findByIdAndUpdate(
        id,
        {
            amount,
            status: "Paid",
            paidAmount: amount,
            dueAmount: 0,
            advanceAmount: 0,
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
            paymentMethod: data.paymentMethod || "Cash",
            remarks: data.remarks || "",
        },
        { new: true }
    ).populate("reseller").lean();

    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return JSON.parse(JSON.stringify(bill));
}

export async function deleteResellerBill(id: string) {
    await connectToDatabase();
    const bill = await ResellerBill.findByIdAndDelete(id);
    if (!bill) throw new Error("Bill not found");
    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return { success: true };
}

export async function getResellerBillById(id: string) {
    await connectToDatabase();
    const bill = await ResellerBill.findById(id).populate("reseller").lean();
    if (!bill) throw new Error("Bill not found");
    return JSON.parse(JSON.stringify(bill));
}

// ---------------------------------------------------------------------------
// Bulk Import
// ---------------------------------------------------------------------------

import {
    getFlexibleField,
    safeParseNumber,
    safeParseString,
} from "@/lib/excel";

export interface ResellerBillBulkImportResult {
    inserted: number;
    failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

export async function bulkImportResellerBills(
    rows: Record<string, unknown>[]
): Promise<ResellerBillBulkImportResult> {
    await connectToDatabase();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let invoiceSeq = await getNextRInvSequence();
    let inserted = 0;
    const failed: ResellerBillBulkImportResult["failed"] = [];

    for (let i = 0; i < rows.length; i++) {
        const raw = rows[i];
        try {
            const rawResellerCode = getFlexibleField(raw, "ResellerCode", "Reseller Code", "resellerCode", "Code");
            const resellerCode = safeParseString(rawResellerCode, "");

            const rawResellerName = getFlexibleField(raw, "ResellerName", "Reseller Name", "resellerName", "Name");
            const resellerName = safeParseString(rawResellerName, "");

            let reseller = null;

            if (resellerCode) {
                reseller = await Reseller.findOne({
                    $or: [
                        { resellerCode },
                        { resellerCode: new RegExp(`^${resellerCode}$`, "i") },
                    ],
                    isDeleted: false,
                })
                    .select("_id monthlyFee")
                    .lean<{ _id: unknown; monthlyFee: number }>();
            }

            if (!reseller && resellerName) {
                reseller = await Reseller.findOne({
                    name: new RegExp(`^${resellerName}$`, "i"),
                    isDeleted: false,
                })
                    .select("_id monthlyFee")
                    .lean<{ _id: unknown; monthlyFee: number }>();
            }

            if (!reseller) {
                throw new Error(
                    `Reseller not found (Code="${resellerCode}", Name="${resellerName}")`
                );
            }

            const rawMonth = getFlexibleField(raw, "Month", "month", "Billing Month");
            const parsedMonth = Math.floor(safeParseNumber(rawMonth, currentMonth));
            const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : currentMonth;

            const rawYear = getFlexibleField(raw, "Year", "year", "Billing Year");
            const parsedYear = Math.floor(safeParseNumber(rawYear, currentYear));
            const year = parsedYear > 2000 ? parsedYear : currentYear;

            const rawAmount = getFlexibleField(raw, "Amount", "amount", "Bill Amount", "Total", "Fee");
            const amount =
                rawAmount !== undefined && rawAmount !== null && rawAmount !== ""
                    ? safeParseNumber(rawAmount, reseller.monthlyFee ?? 0)
                    : reseller.monthlyFee ?? 0;

            const rawStatus = safeParseString(
                getFlexibleField(raw, "Status", "status", "Payment Status"),
                "Unpaid"
            );
            const status = rawStatus.toLowerCase() === "paid" ? "Paid" : "Unpaid";

            const rawInvoice = safeParseString(
                getFlexibleField(raw, "InvoiceNumber", "Invoice Number", "invoiceNumber", "Invoice"),
                ""
            );
            const invoiceNumber = rawInvoice
                ? rawInvoice
                : `${RINV_PREFIX}${invoiceSeq.toString().padStart(6, "0")}`;
            if (!rawInvoice) invoiceSeq++;

            await ResellerBill.create({
                reseller: reseller._id,
                month,
                year,
                amount,
                paidAmount: status === "Paid" ? amount : 0,
                dueAmount: 0,
                advanceAmount: 0,
                status,
                invoiceNumber,
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

    revalidatePath("/reseller-billing");
    revalidatePath("/");
    return { inserted, failed };
}
