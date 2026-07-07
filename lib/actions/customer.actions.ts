"use server";

import { connectToDatabase } from "@/lib/database";
import Customer from "@/lib/database/models/customer.model";
import { revalidatePath } from "next/cache";
import type { FilterQuery } from "mongoose";

// Define types
interface CustomerDoc {
  _id: string;
  customerCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
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
  name: string;
  phone: string;
  email?: string;
  address?: string;
  packageName: string;
  monthlyFee: number;
  connectionDate: Date;
  router?: string;
  ipAddress?: string;
  status?: string;
  notes?: string;
}) {
  await connectToDatabase();

  const lastCustomer = await Customer.findOne<CustomerDoc>().sort({
    createdAt: -1,
  });
  let customerCode = "CUST001";

  if (lastCustomer) {
    const lastCode = lastCustomer.customerCode;
    const num = parseInt(lastCode.slice(4));
    customerCode = `CUST${(num + 1).toString().padStart(3, "0")}`;
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
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();

  const { search = "", status, page = 1, limit = 10 } = params || {};
  const skip = (page - 1) * limit;

  const query: FilterQuery<CustomerDoc> = { isDeleted: false };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { customerCode: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  const customers = await Customer.find<CustomerDoc>(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(query);

  return {
    customers: JSON.parse(JSON.stringify(customers)),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCustomerById(id: string) {
  await connectToDatabase();
  const customer = await Customer.findById<CustomerDoc>(id);
  if (!customer || customer.isDeleted) throw new Error("Customer not found");
  return JSON.parse(JSON.stringify(customer));
}

export async function updateCustomer(id: string, data: Partial<CustomerDoc>) {
  await connectToDatabase();
  const customer = await Customer.findByIdAndUpdate<CustomerDoc>(id, data, {
    new: true,
  });
  revalidatePath("/customers");
  return JSON.parse(JSON.stringify(customer));
}

export async function deleteCustomer(id: string) {
  await connectToDatabase();
  await Customer.findByIdAndUpdate(id, { isDeleted: true });
  revalidatePath("/customers");
}
