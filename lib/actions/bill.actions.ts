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
    remarks?: string;
  }
) {
  await connectToDatabase();

  const bill = await Bill.findByIdAndUpdate(
    id,
    {
      status: "Paid",
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
    },
    { new: true }
  ).lean();

  revalidatePath("/billing");
  return JSON.parse(JSON.stringify(bill));
}

export async function getBillById(id: string) {
  await connectToDatabase();
  const bill = await Bill.findById(id).populate("customer").lean();
  return JSON.parse(JSON.stringify(bill));
}
