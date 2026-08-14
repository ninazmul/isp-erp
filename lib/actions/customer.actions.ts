"use server";

import { connectToDatabase } from "@/lib/database";
import Customer from "@/lib/database/models/customer.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

interface CustomerDoc {
  _id: string;
  customerCode: string;
  username?: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: Date;
  router?: string;
  ipAddress?: string;
  status: string;
  notes?: string;
  isDeleted: boolean;
}

export async function createCustomer(data: {
  username?: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: Date;
  router?: string;
  ipAddress?: string;
  status?: string;
  notes?: string;
}) {
  await connectToDatabase();

  const lastCustomer = await Customer.findOne<CustomerDoc>()
    .select("customerCode")
    .sort({ createdAt: -1 })
    .lean();

  let customerCode = "CUST001";
  if (lastCustomer && lastCustomer.customerCode) {
    const lastCode = lastCustomer.customerCode;
    const num = parseInt(lastCode.slice(4));
    if (!isNaN(num)) {
      customerCode = `CUST${(num + 1).toString().padStart(3, "0")}`;
    }
  }

  const customer = await Customer.create({
    ...data,
    customerCode,
  });

  revalidatePath("/customers");
  return JSON.parse(JSON.stringify(customer));
}

export async function getCustomers(params?: {
  search?: string;
  status?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();

  const { search = "", status, month, year, page = 1, limit = 10 } = params || {};
  const skip = (page - 1) * limit;

  const query: FilterQuery<CustomerDoc> = { isDeleted: false };

  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: regex },
      { phone: regex },
      { email: regex },
      { customerCode: regex },
      { username: regex },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (month || year) {
    const startDate = new Date(
      year || new Date().getFullYear(),
      month ? month - 1 : 0,
      1
    );
    const endDate = new Date(
      year || new Date().getFullYear(),
      month ? month : 12,
      month ? 0 : 31,
      23,
      59,
      59,
      999
    );
    query.connectionDate = { $gte: startDate, $lte: endDate };
  }

  const [customers, total] = await Promise.all([
    Customer.find<CustomerDoc>(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(query),
  ]);

  return {
    customers: JSON.parse(JSON.stringify(customers)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCustomerById(id: string) {
  await connectToDatabase();
  const customer = await Customer.findById<CustomerDoc>(id).lean();
  if (!customer || customer.isDeleted) throw new Error("Customer not found");
  return JSON.parse(JSON.stringify(customer));
}

export async function updateCustomer(id: string, data: Partial<CustomerDoc>) {
  await connectToDatabase();
  const customer = await Customer.findByIdAndUpdate<CustomerDoc>(id, data, {
    new: true,
  }).lean();
  revalidatePath("/customers");
  return JSON.parse(JSON.stringify(customer));
}

export async function deleteCustomer(id: string) {
  await connectToDatabase();
  await Customer.findByIdAndUpdate(id, { isDeleted: true });
  revalidatePath("/customers");
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

export interface CustomerBulkImportResult {
  inserted: number;
  failed: Array<{ row: number; data: Record<string, unknown>; reason: string }>;
}

export async function bulkCreateCustomers(
  rows: Record<string, unknown>[]
): Promise<CustomerBulkImportResult> {
  await connectToDatabase();

  const lastCustomer = await Customer.findOne<CustomerDoc>()
    .select("customerCode")
    .sort({ createdAt: -1 })
    .lean();

  let nextNum = 1;
  if (lastCustomer && lastCustomer.customerCode) {
    const lastCode = lastCustomer.customerCode;
    const num = parseInt(lastCode.slice(4));
    if (!isNaN(num)) {
      nextNum = num + 1;
    }
  }

  let inserted = 0;
  const failed: CustomerBulkImportResult["failed"] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    try {
      const customerCode = `CUST${nextNum.toString().padStart(3, "0")}`;

      const rawName = getFlexibleField(raw, "Name", "name", "Customer Name", "CustomerName");
      const name = safeParseString(rawName, `Customer ${customerCode}`);

      const rawUsername = getFlexibleField(raw, "Username", "username", "User Name", "Login Username");
      const username = safeParseString(rawUsername, "") || undefined;

      const rawPhone = getFlexibleField(raw, "Phone", "phone", "Phone Number", "Mobile", "Contact");
      const phone = safeParseString(rawPhone, "N/A");

      const rawLocation = getFlexibleField(raw, "Location", "location", "Area", "Zone");
      const location = safeParseString(rawLocation, "General");

      const rawPackage = getFlexibleField(raw, "Package", "packageName", "Package Name", "Plan");
      const packageName = safeParseString(rawPackage, "Standard");

      const rawFee = getFlexibleField(raw, "Monthly Fee (৳)", "Monthly Fee", "monthlyFee", "Fee", "Price", "Amount");
      const monthlyFee = safeParseNumber(rawFee, 0);

      const rawDate = getFlexibleField(raw, "Connection Date (YYYY-MM-DD)", "Connection Date", "connectionDate", "Date");
      const connectionDate = safeParseDate(rawDate, new Date());

      const VALID_STATUSES = ["Active", "Inactive", "Disconnected"];
      const rawStatus = safeParseString(getFlexibleField(raw, "Status", "status"), "Active");
      const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : "Active";

      const rawEmail = getFlexibleField(raw, "Email", "email", "Email Address");
      const email = safeParseString(rawEmail, "") || undefined;

      const rawRouter = getFlexibleField(raw, "Router", "router", "Router Model");
      const router = safeParseString(rawRouter, "") || undefined;

      const rawIp = getFlexibleField(raw, "IP Address", "ipAddress", "IP", "IPAddress");
      const ipAddress = safeParseString(rawIp, "") || undefined;

      const rawNotes = getFlexibleField(raw, "Notes", "notes", "Remarks", "Comment");
      const notes = safeParseString(rawNotes, "") || undefined;

      await Customer.create({
        customerCode,
        username,
        name,
        phone,
        location,
        packageName,
        monthlyFee,
        connectionDate,
        status,
        email,
        router,
        ipAddress,
        notes,
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

  revalidatePath("/customers");
  return { inserted, failed };
}
