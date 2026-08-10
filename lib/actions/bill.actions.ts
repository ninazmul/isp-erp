"use server";

import { connectToDatabase } from "@/lib/database";
import Bill from "@/lib/database/models/bill.model";
import Customer from "@/lib/database/models/customer.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

const INVOICE_PREFIX = "INV";

interface RawCustomerDoc {
  _id: { toString(): string } | string;
  monthlyFee: number;
}

interface RawBillDoc {
  _id: string;
  invoiceNumber: string;
  customer: { _id?: string; toString(): string } | string;
  month: number;
  year: number;
  amount: number;
  paidAmount?: number;
  dueAmount?: number;
  advanceAmount?: number;
  status: string;
  paymentDate?: Date;
  paymentMethod?: string;
  remarks?: string;
}

export async function generateMonthlyBills(month: number, year: number) {
  await connectToDatabase();

  // 1. Fetch active non-deleted customers (.lean())
  const activeCustomers = await Customer.find({
    status: "Active",
    isDeleted: false,
  })
    .select("_id monthlyFee")
    .lean<RawCustomerDoc[]>();

  if (activeCustomers.length === 0) {
    return { generated: 0, skipped: 0 };
  }

  // 2. Fetch all existing bills for this month/year in ONE query & build O(1) Set lookup
  const existingBills = await Bill.find({ month, year })
    .select("customer")
    .lean<RawBillDoc[]>();
  const existingCustomerSet = new Set(
    existingBills.map((b) => b.customer.toString())
  );

  // 3. Find latest invoice sequence number
  const lastBill = await Bill.findOne()
    .select("invoiceNumber")
    .sort({ createdAt: -1 })
    .lean<RawBillDoc | null>();

  let invoiceSeq = 1;
  if (lastBill && lastBill.invoiceNumber) {
    const parsed = parseInt(lastBill.invoiceNumber.slice(INVOICE_PREFIX.length));
    if (!isNaN(parsed)) invoiceSeq = parsed + 1;
  }

  // 4. Batch prepare bulk ops
  const bulkOps = [];
  let skipped = 0;

  for (const customer of activeCustomers) {
    const custIdStr = customer._id.toString();
    if (existingCustomerSet.has(custIdStr)) {
      skipped++;
      continue;
    }

    const invoiceNumber = `${INVOICE_PREFIX}${invoiceSeq.toString().padStart(6, "0")}`;
    invoiceSeq++;

    bulkOps.push({
      insertOne: {
        document: {
          customer: customer._id,
          month,
          year,
          amount: customer.monthlyFee,
          paidAmount: 0,
          dueAmount: customer.monthlyFee,
          advanceAmount: 0,
          status: "Unpaid",
          invoiceNumber,
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await Bill.bulkWrite(bulkOps);
  }

  revalidatePath("/billing");
  revalidatePath("/");
  return { generated: bulkOps.length, skipped };
}

export async function getBills(params?: {
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

  if (month) query.month = month;
  if (year) query.year = year;
  if (status) query.status = status;

  // Search by customer name/code or invoice number
  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    const matchingCustomers = await Customer.find({
      $or: [{ name: regex }, { customerCode: regex }],
    })
      .select("_id")
      .lean<{ _id: string }[]>();
    const customerIds = matchingCustomers.map((c) => c._id);

    query.$or = [
      { invoiceNumber: regex },
      { customer: { $in: customerIds } },
    ];
  }

  const [bills, total] = await Promise.all([
    Bill.find(query)
      .populate("customer", "name customerCode phone monthlyFee status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bill.countDocuments(query),
  ]);

  return {
    bills: JSON.parse(JSON.stringify(bills)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markBillAsPaid(
  id: string,
  data: {
    paymentDate: Date;
    paymentMethod: string;
    paidAmount: number;
    remarks?: string;
  }
) {
  await connectToDatabase();

  const existingBill = await Bill.findById(id).select("amount").lean<RawBillDoc | null>();
  if (!existingBill) {
    throw new Error("Bill not found");
  }

  const paidAmount = Number(data.paidAmount);
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    throw new Error("Paid amount must be a valid non-negative number");
  }

  const billAmount = Number(existingBill.amount) || 0;
  const dueAmount = Math.max(billAmount - paidAmount, 0);
  const advanceAmount = Math.max(paidAmount - billAmount, 0);

  const bill = await Bill.findByIdAndUpdate(
    id,
    {
      status: dueAmount > 0 ? "Unpaid" : "Paid",
      paidAmount,
      dueAmount,
      advanceAmount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
    },
    { new: true }
  ).lean();

  revalidatePath("/billing");
  revalidatePath("/");
  return JSON.parse(JSON.stringify(bill));
}

export async function getBillById(id: string) {
  await connectToDatabase();
  const bill = await Bill.findById(id).populate("customer").lean();
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

export interface BillBulkImportResult {
  inserted: number;
  failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

/**
 * Bulk-imports billing records from an array of raw row objects.
 * - Looks up customer by CustomerCode first, then CustomerName.
 * - Each row is independent; a failed row never stops the rest.
 * - Handles type coercion safely for numbers, strings, and missing fields.
 */
export async function bulkImportBills(
  rows: Record<string, unknown>[]
): Promise<BillBulkImportResult> {
  await connectToDatabase();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let inserted = 0;
  const failed: BillBulkImportResult["failed"] = [];

  // Determine starting invoice sequence
  const lastBill = await Bill.findOne()
    .select("invoiceNumber")
    .sort({ createdAt: -1 })
    .lean<RawBillDoc | null>();

  let invoiceSeq = 1;
  if (lastBill?.invoiceNumber) {
    const parsed = parseInt(lastBill.invoiceNumber.slice(INVOICE_PREFIX.length));
    if (!isNaN(parsed)) invoiceSeq = parsed + 1;
  }

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    try {
      // ---- Extract customer identifier ----
      const rawCustomerCode = getFlexibleField(raw, "CustomerCode", "Customer Code", "customerCode", "Code", "ID");
      const customerCode = safeParseString(rawCustomerCode, "");

      const rawCustomerName = getFlexibleField(raw, "CustomerName", "Customer Name", "customerName", "Name", "Customer");
      const customerName = safeParseString(rawCustomerName, "");

      let customer = null;

      if (customerCode) {
        customer = await Customer.findOne({
          $or: [
            { customerCode: customerCode },
            { customerCode: new RegExp(`^${customerCode}$`, "i") },
          ],
          isDeleted: false,
        })
          .select("_id monthlyFee")
          .lean<{ _id: unknown; monthlyFee: number }>();
      }

      if (!customer && customerName) {
        customer = await Customer.findOne({
          name: new RegExp(`^${customerName}$`, "i"),
          isDeleted: false,
        })
          .select("_id monthlyFee")
          .lean<{ _id: unknown; monthlyFee: number }>();
      }

      if (!customer) {
        throw new Error(
          `Customer not found (CustomerCode="${customerCode}", CustomerName="${customerName}")`
        );
      }

      // ---- Normalise Month & Year ----
      const rawMonthVal = getFlexibleField(raw, "Month", "month", "Billing Month");
      const parsedMonth = Math.floor(safeParseNumber(rawMonthVal, currentMonth));
      const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : currentMonth;

      const rawYearVal = getFlexibleField(raw, "Year", "year", "Billing Year");
      const parsedYear = Math.floor(safeParseNumber(rawYearVal, currentYear));
      const year = parsedYear > 2000 ? parsedYear : currentYear;

      // ---- Amount & Status ----
      const rawAmountVal = getFlexibleField(raw, "Amount", "amount", "Bill Amount", "Total");
      const amount = rawAmountVal !== undefined && rawAmountVal !== null && rawAmountVal !== ""
        ? safeParseNumber(rawAmountVal, customer.monthlyFee ?? 0)
        : (customer.monthlyFee ?? 0);

      const VALID_STATUSES = ["Paid", "Unpaid"];
      const rawStatusVal = getFlexibleField(raw, "Status", "status", "Payment Status");
      const rawStatus = safeParseString(rawStatusVal, "Unpaid");
      const requestedStatus = VALID_STATUSES.map(s => s.toLowerCase()).includes(rawStatus.toLowerCase())
        ? (rawStatus.toLowerCase() === "paid" ? "Paid" : "Unpaid")
        : "Unpaid";

      const rawPaidAmountVal = getFlexibleField(raw, "PaidAmount", "Paid Amount", "paidAmount", "Paid");
      const paidAmount = rawPaidAmountVal !== undefined && rawPaidAmountVal !== null && rawPaidAmountVal !== ""
        ? safeParseNumber(rawPaidAmountVal, requestedStatus === "Paid" ? amount : 0)
        : (requestedStatus === "Paid" ? amount : 0);
      const dueAmount = Math.max(amount - paidAmount, 0);
      const advanceAmount = Math.max(paidAmount - amount, 0);
      const status = dueAmount > 0 ? "Unpaid" : "Paid";

      // ---- Invoice Number ----
      const rawInvoiceVal = getFlexibleField(raw, "InvoiceNumber", "Invoice Number", "invoiceNumber", "Invoice");
      const rawInvoice = safeParseString(rawInvoiceVal, "");
      const invoiceNumber = rawInvoice
        ? rawInvoice
        : `${INVOICE_PREFIX}${invoiceSeq.toString().padStart(6, "0")}`;
      if (!rawInvoice) invoiceSeq++;

      await Bill.create({
        customer: customer._id,
        month,
        year,
        amount,
        paidAmount,
        dueAmount,
        advanceAmount,
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

  revalidatePath("/billing");
  revalidatePath("/");
  return { inserted, failed };
}
