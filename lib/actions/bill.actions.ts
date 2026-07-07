"use server";

import { connectToDatabase } from "@/lib/database";
import Bill from "@/lib/database/models/bill.model";
import Customer from "@/lib/database/models/customer.model";
import Setting from "@/lib/database/models/setting.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

// Define types for mongoose docs
interface BillDoc {
  _id: string;
  invoiceNumber: string;
  customer: CustomerDoc;
  month: number;
  year: number;
  amount: number;
  status: string;
  paymentDate?: Date;
  paymentMethod?: string;
  remarks?: string;
}

interface CustomerDoc {
  _id: string;
  customerCode: string;
  name: string;
  monthlyFee: number;
  status: string;
  isDeleted: boolean;
}

export async function generateMonthlyBills(month: number, year: number) {
  await connectToDatabase();

  const activeCustomers = await Customer.find<CustomerDoc>({
    status: "Active",
    isDeleted: false,
  });

  let generated = 0;
  let skipped = 0;

  for (const customer of activeCustomers) {
    const existingBill = await Bill.findOne<BillDoc>({
      customer: customer._id,
      month,
      year,
    });

    if (existingBill) {
      skipped++;
      continue;
    }

    const setting = await Setting.findOne();
    const invoicePrefix = setting?.invoicePrefix || "INV";
    const lastBill = await Bill.findOne<BillDoc>().sort({ createdAt: -1 });
    let invoiceNum = 1;

    if (lastBill) {
      const lastInv = lastBill.invoiceNumber;
      invoiceNum = parseInt(lastInv.slice(invoicePrefix.length)) + 1;
    }

    const invoiceNumber = `${invoicePrefix}${invoiceNum.toString().padStart(6, "0")}`;

    await Bill.create({
      customer: customer._id,
      month,
      year,
      amount: customer.monthlyFee,
      status: "Unpaid",
      invoiceNumber,
    });

    generated++;
  }

  revalidatePath("/billing");
  return { generated, skipped };
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

  const query: FilterQuery<BillDoc> = {};

  if (month) query.month = month;
  if (year) query.year = year;
  if (status) query.status = status;

  const billsQuery = Bill.find<BillDoc>(query)
    .populate("customer")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Bill.countDocuments(query);

  let bills = await billsQuery;

  if (search) {
    bills = bills.filter(
      (bill: BillDoc) =>
        bill.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        bill.customer.customerCode
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        bill.invoiceNumber.toLowerCase().includes(search.toLowerCase()),
    );
  }

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
  },
) {
  await connectToDatabase();

  const bill = await Bill.findByIdAndUpdate<BillDoc>(
    id,
    {
      status: "Paid",
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
    },
    { new: true },
  );

  revalidatePath("/billing");
  return JSON.parse(JSON.stringify(bill));
}

export async function getBillById(id: string) {
  await connectToDatabase();
  const bill = await Bill.findById<BillDoc>(id).populate("customer");
  return JSON.parse(JSON.stringify(bill));
}
